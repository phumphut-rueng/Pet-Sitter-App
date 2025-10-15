import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";

import { HTTP_STATUS } from "@/lib/api/api-http";
import {
  updateProfileSchema,
  type ValidationDetails,
  normalizeString,
  pickDobYmd,
  pickProfileImageUrl,
  pickProfileImagePublicId,
  pickIdNumber,
} from "@/lib/validators/validation";
import { extractPublicIdFromCloudinaryUrl } from "@/lib/cloudinary/id";
import { userRepository, type UpdateData } from "@/lib/repo/user.repo";

type UnknownRecord = Record<string, unknown>;

function sendError(
  res: NextApiResponse,
  status: number,
  message: string,
  extra?: Record<string, unknown>
) {
  return res.status(status).json({ message, ...(extra ?? {}) });
}

function getProp<T = unknown>(obj: unknown, key: string): T | undefined {
  if (obj && typeof obj === "object") {
    return (obj as UnknownRecord)[key] as T | undefined;
  }
  return undefined;
}

async function getUserIdFromSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<number | null> {
  const session = await getServerSession(req, res, authOptions);

  const user = getProp<UnknownRecord | undefined>(session, "user");
  const rawId = user ? getProp<string | number | undefined>(user, "id") : undefined;

  const n = typeof rawId === "string" ? Number(rawId) : typeof rawId === "number" ? rawId : NaN;
  return Number.isFinite(n) ? n : null;
}

function parseDateYmdToUTCDate(ymd?: string): Date | undefined {
  if (!ymd) return undefined;
  return new Date(`${ymd}T00:00:00.000Z`);
}

function isP2002(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

type UserProfileResponse = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  idNumber?: string;
  image?: string; // ← เพิ่มบรรทัดนี้
  profileImage: string;
  profileImagePublicId?: string;
};

type UpdateResponse = { message: string };
type ErrorResponse = {
  message: string;
  details?: ValidationDetails;
  fields?: string[];
};

async function handleGetProfile(
  userId: number,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) {
  const user = await userRepository.findById(userId);
  if (!user) return sendError(res, HTTP_STATUS.NOT_FOUND, "User not found");

  const dobStr = user.dob ? user.dob.toISOString().slice(0, 10) : "";

  return res.status(HTTP_STATUS.OK).json({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    dob: dobStr,
    idNumber: user.id_number ?? undefined,
    image: user.profile_image_public_id ?? user.profile_image ?? undefined, // ← เพิ่มบรรทัดนี้
    profileImage: user.profile_image ?? "",
    profileImagePublicId: user.profile_image_public_id ?? undefined,
  });
}

async function handleUpdateProfile(
  userId: number,
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | ErrorResponse>
) {
  const idNumberRaw = pickIdNumber(req.body);

  const normalized = {
    name: normalizeString(getProp<string | undefined>(req.body, "name")),
    email: normalizeString(getProp<string | undefined>(req.body, "email")),
    phone: normalizeString(getProp<string | undefined>(req.body, "phone")),
    dob: pickDobYmd(req.body),
    profileImage: pickProfileImageUrl(req.body),
    profile_image_public_id: pickProfileImagePublicId(req.body),
  };

  const parsed = updateProfileSchema.safeParse(normalized);
  if (!parsed.success) {
    return sendError(res, HTTP_STATUS.BAD_REQUEST, "Validation error", {
      details: parsed.error.flatten(),
    });
  }

  const { name, email, phone, dob, profileImage, profile_image_public_id } = parsed.data;

  const resolvedPublicId =
    profile_image_public_id ?? extractPublicIdFromCloudinaryUrl(profileImage);

  const updateData: UpdateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (dob !== undefined) updateData.dob = parseDateYmdToUTCDate(dob);
  if (idNumberRaw !== undefined) updateData.id_number = idNumberRaw || null;

  if (resolvedPublicId !== undefined) {
    updateData.profile_image_public_id = resolvedPublicId || null;
  }
  if (profileImage !== undefined) {
    updateData.profile_image = profileImage || null;
  }

  try {
    await userRepository.updateById(userId, updateData);
    return res.status(HTTP_STATUS.OK).json({ message: "Profile updated successfully" });
  } catch (error: unknown) {
    if (isP2002(error)) {
      const targets = error.meta?.target;
      const fields = Array.isArray(targets) ? (targets as string[]) : [];

      if (fields.includes("email")) {
        return sendError(res, HTTP_STATUS.CONFLICT, "Email is already taken");
      }
      if (fields.includes("phone")) {
        return sendError(res, HTTP_STATUS.CONFLICT, "Phone number is already taken");
      }
      if (fields.includes("unique_id_number") || fields.includes("id_number")) {
        return sendError(res, HTTP_STATUS.CONFLICT, "ID number is already taken");
      }
      return sendError(res, HTTP_STATUS.CONFLICT, "Unique constraint violation", { fields });
    }

    console.error("Update profile error:", error);
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update profile");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponse | UpdateResponse | ErrorResponse>
) {
  try {
    const userId = await getUserIdFromSession(req, res);
    if (!userId) return sendError(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");

    if (req.method === "GET") {
      return handleGetProfile(userId, res);
    }

    if (req.method === "PUT") {
      return handleUpdateProfile(userId, req, res);
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return sendError(res, HTTP_STATUS.METHOD_NOT_ALLOWED, "Method not allowed");
  } catch (error) {
    console.error("Profile API error:", error);
    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}