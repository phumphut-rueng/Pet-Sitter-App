// ./src/pages/api/user/profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

import { json, HTTP_STATUS, toErrMsg } from "@/lib/api/api-http";
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
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

const parseDate = (dateString: string): Date => new Date(`${dateString}T00:00:00.000Z`);
const formatDateForResponse = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

const getUserIdFromSession = async (req: NextApiRequest, res: NextApiResponse): Promise<number | null> => {
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
  idNumber?: string; // ✅ เพิ่ม field นี้
  dob: string;
  profileImage: string;
  profileImagePublicId?: string;
};
type UpdateResponse = { message: string };
type ErrorResponse = { error: string; details?: ValidationDetails; fields?: string[] };

/* ===== handlers ===== */
const handleGetProfile = async (
  userId: number,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) => {
  const user = await userRepository.findById(userId);
  if (!user) return json(res, HTTP_STATUS.NOT_FOUND, { error: "User not found" });

  return json(res, HTTP_STATUS.OK, {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    idNumber: user.id_number ?? undefined, // ✅ เพิ่มบรรทัดนี้
    dob: formatDateForResponse(user.dob),
    profileImage: user.profile_image ?? "",
    profileImagePublicId: user.profile_image_public_id ?? undefined,
  });
};

const handleUpdateProfile = async (
  userId: number,
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | ErrorResponse>
) => {
  const normalized = {
    name: normalizeString((req.body as UnknownRecord | undefined)?.name),
    email: normalizeString((req.body as UnknownRecord | undefined)?.email),
    phone: normalizeString((req.body as UnknownRecord | undefined)?.phone),
    idNumber: pickIdNumber(req.body), // ✅ เพิ่มบรรทัดนี้
    dob: pickDobYmd(req.body),
    profileImage: pickProfileImageUrl(req.body),
    profile_image_public_id: pickProfileImagePublicId(req.body),
  };

  const parsed = updateProfileSchema.safeParse(normalized);
  if (!parsed.success) {
    return json(res, HTTP_STATUS.BAD_REQUEST, {
      error: "Validation error",
      details: parsed.error.flatten(),
    });
  }

  const { name, email, phone, idNumber, dob, profileImage, profile_image_public_id } = parsed.data;

  const resolvedPublicId =
    profile_image_public_id ?? extractPublicIdFromCloudinaryUrl(profileImage);

  const updateData: UpdateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (idNumber !== undefined) updateData.id_number = idNumber; // ✅ เพิ่มบรรทัดนี้
  if (dob !== undefined) updateData.dob = parseDate(dob);
  if (resolvedPublicId !== undefined) {
    updateData.profile_image_public_id = resolvedPublicId || null;
  }

  try {
    const out = await userRepository.updateById(userId, updateData);
    console.log("[profile] updated public_id =", out.profile_image_public_id);
    console.log("[profile] updated id_number =", out.id_number); // ✅ เพิ่ม log
    return json(res, HTTP_STATUS.OK, { message: "OK" });
  } catch (error: unknown) {
    if (isPrismaUniqueConstraintError(error)) {
      const target = Array.isArray((error as Prisma.PrismaClientKnownRequestError).meta?.target)
        ? ((error as Prisma.PrismaClientKnownRequestError).meta!.target as string[])
        : undefined;

      if (target?.includes("email")) {
        return json(res, HTTP_STATUS.CONFLICT, { error: "Email already registered" });
      }
      if (target?.includes("phone")) {
        return json(res, HTTP_STATUS.CONFLICT, { error: "Phone already registered" });
      }
      if (target?.includes("id_number")) { // ✅ เพิ่ม error handling
        return json(res, HTTP_STATUS.CONFLICT, { error: "ID Number already registered" });
      }
      return json(res, HTTP_STATUS.CONFLICT, { error: "unique_violation", fields: target });
    }
    console.error("Update profile error:", error);
    return json(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: "Internal Server Error" });
  }
};

/* ===== router ===== */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponse | UpdateResponse | ErrorResponse>
) {
  try {
    const userId = await getUserIdFromSession(req, res);
    if (!userId) return json(res, HTTP_STATUS.UNAUTHORIZED, { error: "Unauthorized" });

    switch (req.method) {
      case "GET":
        return handleGetProfile(userId, res);
      case "PUT":
        return handleUpdateProfile(userId, req, res);
      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return json(res, HTTP_STATUS.METHOD_NOT_ALLOWED, { error: "Method not allowed" });
    }
  } catch (error: unknown) {
    console.error("Profile API error:", error);
    return json(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, { error: toErrMsg(error) });
  }
}