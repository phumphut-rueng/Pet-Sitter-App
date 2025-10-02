import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";


type UniqueCheckField = "email" | "name" | "phone";

type RequestBody =
  | {
      field: UniqueCheckField;
      value: string;
    }
  | {
      email?: string;
      name?: string;
      phone?: string;
    };

type UniqueResponse = {
  unique: boolean;
};

type ErrorResponse = {
  error: string;
};


const HTTP_STATUS = {
  OK: 200,
  METHOD_NOT_ALLOWED: 405,
  BAD_REQUEST: 400,
} as const;

const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: "Method not allowed",
  INVALID_FIELD: "Invalid field specified",
  MISSING_VALUE: "Value is required",
} as const;


const sanitizeInput = {
  email: (value: string): string => value.trim().toLowerCase(),
  name: (value: string): string => value.trim(),
  phone: (value: string): string => value.replace(/\D/g, ""),
};

const getCurrentUserId = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<number | undefined> => {
  const session = await getServerSession(req, res, authOptions);
  return session?.user?.id ? Number(session.user.id) : undefined;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/**
 * แปลง/ตรวจรูปแบบ body จาก unknown  RequestBody
 */
const parseRequestBody = (body: unknown): RequestBody | null => {
  if (!isRecord(body)) return null;

  if (
    "field" in body &&
    "value" in body &&
    typeof body.field === "string" &&
    typeof body.value === "string"
  ) {
    const f = body.field as string;
    if (f === "email" || f === "name" || f === "phone") {
      return { field: f, value: body.value } as RequestBody;
    }
  }

  const email = typeof body.email === "string" ? body.email : undefined;
  const name = typeof body.name === "string" ? body.name : undefined;
  const phone = typeof body.phone === "string" ? body.phone : undefined;
  if (email !== undefined || name !== undefined || phone !== undefined) {
    return { email, name, phone };
  }

  return null;
};

const processRequest = (
  body: RequestBody
): { field: UniqueCheckField; value: string } | null => {
  if ("field" in body && "value" in body) {
    return { field: body.field, value: body.value };
  }

  if ("email" in body && body.email) {
    return { field: "email", value: body.email };
  }
  if ("name" in body && body.name) {
    return { field: "name", value: body.name };
  }
  if ("phone" in body && body.phone) {
    return { field: "phone", value: body.phone };
  }
  return null;
};

const validateAndSanitize = (
  field: UniqueCheckField,
  value: string
): string | null => {
  if (!value?.trim()) return null;
  const sanitizedValue = sanitizeInput[field](value);
  return sanitizedValue || null;
};


const uniqueCheckRepository = {
  checkEmail: async (
    email: string,
    excludeUserId?: number
  ): Promise<boolean> => {
    const found = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
      select: { id: true },
    });
    return !found;
  },

  checkName: async (name: string, excludeUserId?: number): Promise<boolean> => {
    const found = await prisma.user.findFirst({
      where: {
        name,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
      select: { id: true },
    });
    return !found;
  },

  checkPhone: async (
    phone: string,
    excludeUserId?: number
  ): Promise<boolean> => {
    const found = await prisma.user.findFirst({
      where: {
        phone,
        ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
      },
      select: { id: true },
    });
    return !found;
  },
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UniqueResponse | ErrorResponse>
) {
  // Method validation
  if (req.method !== "POST") {
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
    });
  }

  try {
    const parsed = parseRequestBody(req.body);
    const requestData = parsed ? processRequest(parsed) : null;

    if (!requestData) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: ERROR_MESSAGES.MISSING_VALUE });
    }

    const { field, value } = requestData;


    const sanitizedValue = validateAndSanitize(field, value);
    if (!sanitizedValue) {
      // ค่าว่างถือว่า "unique" (ไม่มีอะไรให้ชน)
      return res.status(HTTP_STATUS.OK).json({ unique: true });
    }


    const currentUserId = await getCurrentUserId(req, res);


    let isUnique: boolean;
    switch (field) {
      case "email":
        isUnique = await uniqueCheckRepository.checkEmail(
          sanitizedValue,
          currentUserId
        );
        break;
      case "name":
        isUnique = await uniqueCheckRepository.checkName(
          sanitizedValue,
          currentUserId
        );
        break;
      case "phone":
        isUnique = await uniqueCheckRepository.checkPhone(
          sanitizedValue,
          currentUserId
        );
        break;
      default:
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ error: ERROR_MESSAGES.INVALID_FIELD });
    }

    return res.status(HTTP_STATUS.OK).json({ unique: isUnique });
  } catch (error) {
    console.error("Unique check API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}