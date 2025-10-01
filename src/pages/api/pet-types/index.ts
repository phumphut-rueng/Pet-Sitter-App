import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

type PetTypeResponse = {
  id: number;
  name: string;
};

type ErrorResponse = {
  error: string;
};


const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;

const petTypeRepository = {
  findAll: async (): Promise<PetTypeResponse[]> => {
    const types = await prisma.pet_type.findMany({
      orderBy: { id: "asc" },
      select: { 
        id: true, 
        pet_type_name: true 
      },
    });

    return types.map(type => ({
      id: type.id,
      name: type.pet_type_name,
    }));
  },
};

const handleError = (error: unknown, res: NextApiResponse<ErrorResponse>) => {
  console.error("Pet types API error:", error);
  
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};


export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<PetTypeResponse[] | ErrorResponse>
) {
  try {
    const petTypes = await petTypeRepository.findAll();
    
    return res.status(HTTP_STATUS.OK).json(petTypes);
  } catch (error) {
    return handleError(error, res);
  }
}