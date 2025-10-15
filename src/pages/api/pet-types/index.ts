import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

type PetTypeResponse = {
  id: number;
  name: string;
};

type ErrorResponse = {
  message: string;
};

const HTTP_STATUS = {
  OK: 200,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: "Method not allowed",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

/* ------------------------------- repository ------------------------------- */

const petTypeRepository = {
  async findAll(): Promise<PetTypeResponse[]> {
    const types = await prisma.pet_type.findMany({
      orderBy: { id: "asc" },
      select: { id: true, pet_type_name: true },
    });
    return types.map((t) => ({ id: t.id, name: t.pet_type_name }));
  },
};

/* --------------------------------- handler -------------------------------- */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PetTypeResponse[] | ErrorResponse>
) {
  // allow only GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json({ message: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
  }

  try {
    const petTypes = await petTypeRepository.findAll();
    return res.status(HTTP_STATUS.OK).json(petTypes);
  } catch (error) {
    console.error("Pet types API error:", error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
}