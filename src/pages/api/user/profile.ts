import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]";


const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{9,15}$/, "phone must be 9–15 digits")
    .optional(),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dob must be YYYY-MM-DD")
    .optional(),
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

type ErrorResponse = {
  error: string;
  details?: ValidationDetails;
  fields?: string[];
};


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
  INVALID_USER_ID: "Invalid user id",
  USER_NOT_FOUND: "User not found",
  VALIDATION_ERROR: "Validation error",
  METHOD_NOT_ALLOWED: "Method not allowed",
  EMAIL_TAKEN: "email_taken",
  PHONE_TAKEN: "phone_taken",
  UNIQUE_VIOLATION: "unique_violation",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "OK",
} as const;


const getUserIdFromSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<number | null> => {
  const session = await getServerSession(req, res, authOptions);
  const userIdStr = session?.user?.id;
  if (!userIdStr) return null;
  const userId = Number(userIdStr);
  return Number.isFinite(userId) ? userId : null;
};

const isPrismaUniqueConstraintError = (
  error: unknown
): error is Prisma.PrismaClientKnownRequestError =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code: unknown }).code === "P2002";

const formatDateForResponse = (date: Date | null): string =>
  date ? date.toISOString().slice(0, 10) : "";

const parseDate = (dateString: string): Date =>
  new Date(`${dateString}T00:00:00.000Z`);


type UpdateData = Parameters<typeof prisma.user.update>[0]["data"];

const userRepository = {
  findById: async (userId: number) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        profile_image: true,
      },
    });
  },

  updateById: async (userId: number, data: UpdateData) => {
    return prisma.user.update({
      where: { id: userId },
      data: { ...data, updated_at: new Date() },
    });
  },
};


const handleGetProfile = async (
  userId: number,
  res: NextApiResponse<UserProfileResponse | ErrorResponse>
) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: ERROR_MESSAGES.USER_NOT_FOUND,
    });
  }

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
  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details: validation.error.flatten(),
    });
  }

  const { name, email, phone, dob, profileImage } = validation.data;

  const updateData: UpdateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (dob !== undefined) updateData.dob = parseDate(dob);
  if (profileImage !== undefined) updateData.profile_image = profileImage;

  try {
    await userRepository.updateById(userId, updateData);
    return res.status(HTTP_STATUS.OK).json({
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      const target = Array.isArray(error.meta?.target)
        ? (error.meta!.target as string[])
        : undefined;

      if (target?.includes("email")) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: ERROR_MESSAGES.EMAIL_TAKEN,
        });
      }
      if (target?.includes("phone")) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          error: ERROR_MESSAGES.PHONE_TAKEN,
        });
      }

      return res.status(HTTP_STATUS.CONFLICT).json({
        error: ERROR_MESSAGES.UNIQUE_VIOLATION,
        fields: target,
      });
    }

    throw error;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserProfileResponse | UpdateResponse | ErrorResponse>
) {
  try {
    const userId = await getUserIdFromSession(req, res);
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

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
  } catch (error) {
    console.error("Profile API error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
}