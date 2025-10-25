import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]";
import type { ErrorResponse } from "@/lib/types/api";
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

// Now using sendError from api-utils
import { sendError } from "@/lib/api/api-utils";

/**
 * @openapi
 * /user/profile:
 *   get:
 *     tags: [User]
 *     summary: Get my profile
 *     description: Return the current user's profile from the NextAuth session.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name: { type: string, example: "Jane Doe" }
 *                 email: { type: string, example: "jane@example.com" }
 *                 phone: { type: string, example: "0812345678" }
 *                 dob: { type: string, description: "YYYY-MM-DD", example: "1995-05-01" }
 *                 idNumber: { type: string, nullable: true, example: "1103700XXXXXXX" }
 *                 image: { type: string, nullable: true, description: "Public ID (if set) หรือ URL", example: "users/abc123" }
 *                 profileImage: { type: string, example: "https://cdn.example.com/u/123.png" }
 *                 profileImagePublicId: { type: string, nullable: true, example: "users/abc123" }
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 *
 *   put:
 *     tags: [User]
 *     summary: Update my profile
 *     description: "Update profile fields. Server validates uniqueness of email/phone and ID number."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, example: "jane@example.com" }
 *               phone: { type: string, example: "0812345678" }
 *               dob: { type: string, description: "YYYY-MM-DD", example: "1995-05-01" }
 *               idNumber: { type: string, nullable: true, example: "1103700XXXXXXX" }
 *               profileImage: { type: string, nullable: true, example: "https://cdn.example.com/u/123.png" }
 *               profileImagePublicId: { type: string, nullable: true, example: "users/abc123" }
 *     responses:
 *       '200':
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Profile updated successfully" }
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 *       '409':
 *         description: Conflict (email/phone/idNumber already taken)
 *       '500':
 *         description: Failed to update profile
 */


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
  image?: string;
  profileImage: string;
  profileImagePublicId?: string;
};

type UpdateResponse = { message: string };
type ProfileErrorResponse = ErrorResponse & {
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
  res: NextApiResponse<UpdateResponse | ProfileErrorResponse>
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
    
    // NOTIFICATION SYSTEM: สร้าง notification เมื่ออัปเดต profile
    // เพิ่มโค้ดนี้เพื่อแจ้ง user เมื่ออัปเดต profile - เพื่อยืนยันการเปลี่ยนแปลง
    try {
      const { notifyProfileUpdate } = await import('@/lib/notifications/pet-sitter-notifications');
      // แจ้ง user เมื่ออัปเดต profile - เพื่อยืนยันการเปลี่ยนแปลงข้อมูลส่วนตัว
      await notifyProfileUpdate(userId);
    } catch (notificationError) {
      console.error('Failed to create profile update notification:', notificationError);
      // ไม่ throw error เพื่อไม่ให้กระทบการอัปเดต profile - notification เป็น secondary feature
    }
    
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
  res: NextApiResponse<UserProfileResponse | UpdateResponse | ProfileErrorResponse>
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