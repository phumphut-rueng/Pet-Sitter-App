import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

import { HTTP_STATUS } from "@/lib/api/api-http";
import {
  updateProfileSchema,
  ValidationDetails,
  normalizeString,
  pickDobYmd,
  pickProfileImageUrl,
  pickProfileImagePublicId,
  pickIdNumber,
} from "@/lib/validators/validation";
import { extractPublicIdFromCloudinaryUrl } from "@/lib/cloudinary/id";
import { userRepository, type UpdateData } from "@/lib/repo/user.repo";

/* ===== helpers ===== */
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const parseDate = (dateString: string): Date =>
  new Date(`${dateString}T00:00:00.000Z`);
const formatDateForResponse = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

const getUserIdFromSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<number | null> => {
  const session = await getServerSession(req, res, authOptions);
  const u = (session as unknown as UnknownRecord | null)?.["user"];
  const idRaw = isRecord(u) ? u["id"] : undefined;
  const n = typeof idRaw === "string" ? Number(idRaw) : NaN;
  return Number.isFinite(n) ? n : null;
};

const isPrismaUniqueConstraintError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
  typeof error === "object" &&
  error !== null &&
  "code" in (error as UnknownRecord) &&
  (error as { code: unknown }).code === "P2002";

/* ===== types ===== */
type UserProfileResponse = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  idNumber?: string;
  profileImage: string;            // legacy URL
  profileImagePublicId?: string;   // preferred for FE
};
type UpdateResponse = { message: string };
type ErrorResponse = {
  message: string;
  details?: ValidationDetails;
  fields?: string[];
};

/* ===== handlers ===== */
const handleGetProfile = async (
  userId: number,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User not found" });
  }

  return res.status(HTTP_STATUS.OK).json({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    dob: formatDateForResponse(user.dob),
    idNumber: user.id_number ?? undefined,
    profileImage: user.profile_image ?? "",
    profileImagePublicId: user.profile_image_public_id ?? undefined,
  });
};

const handleUpdateProfile = async (
  userId: number,
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | ErrorResponse>
) => {
  //  log body ดิบ
  console.log("[profile] raw body =", req.body);

  const normalizedIdNumber = pickIdNumber(req.body);

  const normalized = {
    name: normalizeString((req.body as UnknownRecord | undefined)?.name),
    email: normalizeString((req.body as UnknownRecord | undefined)?.email),
    phone: normalizeString((req.body as UnknownRecord | undefined)?.phone),
    dob: pickDobYmd(req.body),
    profileImage: pickProfileImageUrl(req.body),                 // URL
    profile_image_public_id: pickProfileImagePublicId(req.body), // string | null | undefined
  };

  console.log("[profile] picked =", normalized);

  const parsed = updateProfileSchema.safeParse(normalized);
  if (!parsed.success) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Validation error",
      details: parsed.error.flatten(),
    });
  }

  const {
    name,
    email,
    phone,
    dob,
    profileImage,
    profile_image_public_id,
  } = parsed.data;

  const resolvedPublicId =
    profile_image_public_id ?? extractPublicIdFromCloudinaryUrl(profileImage);

  const updateData: UpdateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (dob !== undefined) updateData.dob = parseDate(dob);

  //  id number ไม่พึ่ง zod เพื่อกันเคส schema ยังไม่อัป
  if (normalizedIdNumber !== undefined) {
    updateData.id_number = normalizedIdNumber || null;
  }

  //  บันทึกทั้ง public_id และ URL (legacy)
  if (resolvedPublicId !== undefined) {
    updateData.profile_image_public_id = resolvedPublicId || null; // null = ลบรูป
  }
  if (profileImage !== undefined) {
    updateData.profile_image = profileImage || null; // null = เคลียร์ URL legacy
  }

  console.log("[profile] updateData BEFORE save =", updateData);

  try {
    const out = await userRepository.updateById(userId, updateData);
    console.log("[profile] updated profile_image_public_id =", out.profile_image_public_id);
    console.log("[profile] updated profile_image =", out.profile_image);
    console.log("[profile] updated id_number =", out.id_number);
    return res.status(HTTP_STATUS.OK).json({ message: "Profile updated successfully" });
  } catch (error: unknown) {
    if (isPrismaUniqueConstraintError(error)) {
      const target = Array.isArray(
        (error as Prisma.PrismaClientKnownRequestError).meta?.target
      )
        ? ((error as Prisma.PrismaClientKnownRequestError).meta!
            .target as string[])
        : undefined;

      if (target?.includes("email")) {
        return res.status(HTTP_STATUS.CONFLICT).json({ message: "Email is already taken" });
      }
      if (target?.includes("phone")) {
        return res.status(HTTP_STATUS.CONFLICT).json({ message: "Phone number is already taken" });
      }
      if (target?.includes("unique_id_number") || target?.includes("id_number")) {
        return res.status(HTTP_STATUS.CONFLICT).json({ message: "ID number is already taken" });
      }
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: "Unique constraint violation",
        fields: target,
      });
    }
    console.error("Update profile error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update profile",
    });
  }
};

/* ===== router ===== */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponse | UpdateResponse | ErrorResponse>
) {
  try {
    const userId = await getUserIdFromSession(req, res);
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    switch (req.method) {
      case "GET":
        return handleGetProfile(userId, res);
      case "PUT":
        return handleUpdateProfile(userId, req, res);
      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
          message: "Method not allowed",
        });
    }
  } catch (error: unknown) {
    console.error("Profile API error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}