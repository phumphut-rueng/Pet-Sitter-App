import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

type PetType = {
  id: number;
  name: string;
};

type SuccessResponse = PetType[];

type ErrorResponse = {
  message: string;
};

const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Pet Type Repository
 */
const petTypeRepository = {
  findAll: async (): Promise<PetType[]> => {
    const types = await prisma.pet_type.findMany({
      orderBy: { id: "asc" },
      select: { 
        id: true, 
        pet_type_name: true 
      },
    });

    return types.map((type) => ({
      id: type.id,
      name: type.pet_type_name,
    }));
  },
};

/**
 * GET /api/pet-types
 * ดึง list ของ pet types ทั้งหมด
 */
export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  try {
    const petTypes = await petTypeRepository.findAll();
    
    return res.status(HTTP_STATUS.OK).json(petTypes);
  } catch (error) {
    console.error("Pet types API error:", error);
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Failed to load pet types",
    });
  }
}