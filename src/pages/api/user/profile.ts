import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]";

/* ===== Helpers & type guards (no-any) ===== */
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const normalizeString = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
};

const pickProfileImageUrl = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const candidate =
    body["profileImage"] ??
    body["profile_image"] ??
    body["profileImageUrl"] ??
    body["imageUrl"] ??
    body["image"];
  return normalizeString(candidate);
};

const pickDobYmd = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const raw = normalizeString(body["dob"]);
  if (!raw) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
};

// session -> userId
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

const parseDate = (dateString: string): Date => new Date(`${dateString}T00:00:00.000Z`);
const formatDateForResponse = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

/* ===== constants ===== */
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  USER_NOT_FOUND: "User not found",
  VALIDATION_ERROR: "Validation error",
  METHOD_NOT_ALLOWED: "Method not allowed",
  EMAIL_TAKEN: "email_taken",
  PHONE_TAKEN: "phone_taken",
  UNIQUE_VIOLATION: "unique_violation",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

const SUCCESS_MESSAGES = { PROFILE_UPDATED: "OK" } as const;

/* ===== validation ===== */
const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().regex(/^\d{9,15}$/).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  profileImage: z.string().url().optional(),
});

type UserProfileResponse = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  profileImage: string;
};
type UpdateResponse = { message: string };
type ValidationDetails = z.inferFlattenedErrors<typeof updateProfileSchema>;
type ErrorResponse = { error: string; details?: ValidationDetails; fields?: string[] };
type UpdateData = Parameters<typeof prisma.user.update>[0]["data"];

/* ===== repo ===== */
const userRepository = {
  findById: async (userId: number) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, dob: true, profile_image: true },
    }),

  updateById: async (userId: number, data: UpdateData) =>
    prisma.user.update({ where: { id: userId }, data: { ...data, updated_at: new Date() } }),
};

/* ===== handlers ===== */
const handleGetProfile = async (
  userId: number,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) => {
  const user = await userRepository.findById(userId);
  if (!user) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });

  return res.status(HTTP_STATUS.OK).json({
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    dob: formatDateForResponse(user.dob),
    profileImage: user.profile_image ?? "",
  });
};

const handleUpdateProfile = async (
  userId: number,
  req: NextApiRequest,
  res: NextApiResponse<UpdateResponse | ErrorResponse>
) => {
  // normalize ก่อน validate
  const normalized = {
    name: normalizeString((req.body as UnknownRecord | undefined)?.name),
    email: normalizeString((req.body as UnknownRecord | undefined)?.email),
    phone: normalizeString((req.body as UnknownRecord | undefined)?.phone),
    dob: pickDobYmd(req.body),
    profileImage: pickProfileImageUrl(req.body),
  };

  const parsed = updateProfileSchema.safeParse(normalized);
  if (!parsed.success) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: ERROR_MESSAGES.VALIDATION_ERROR, details: parsed.error.flatten() });
  }

  const { name, email, phone, dob, profileImage } = parsed.data;

  const updateData: UpdateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (dob !== undefined) updateData.dob = parseDate(dob);
  if (profileImage !== undefined) updateData.profile_image = profileImage;

  try {
    await userRepository.updateById(userId, updateData);
    return res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.PROFILE_UPDATED });
  } catch (error: unknown) {
    if (isPrismaUniqueConstraintError(error)) {
      const target = Array.isArray((error as Prisma.PrismaClientKnownRequestError).meta?.target)
        ? ((error as Prisma.PrismaClientKnownRequestError).meta!.target as string[])
        : undefined;

      if (target?.includes("email")) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: ERROR_MESSAGES.EMAIL_TAKEN });
      }
      if (target?.includes("phone")) {
        return res.status(HTTP_STATUS.CONFLICT).json({ error: ERROR_MESSAGES.PHONE_TAKEN });
      }
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: ERROR_MESSAGES.UNIQUE_VIOLATION,
        fields: target,
      });
    }
    console.error("Update profile error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
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
    if (!userId) return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: ERROR_MESSAGES.UNAUTHORIZED });

    switch (req.method) {
      case "GET":
        return handleGetProfile(userId, res);
      case "PUT":
        return handleUpdateProfile(userId, req, res);
      default:
        res.setHeader("Allow", ["GET", "PUT"]);
        return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
          error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        });
    }
  } catch (error: unknown) {
    console.error("Profile API error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}