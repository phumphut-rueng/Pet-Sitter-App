import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import type { PetType } from "@/types/pet.types";
import type { ErrorResponse } from "@/lib/types/api";
import { HTTP_STATUS } from "@/lib/api/api-http";


/**
 * @openapi
 * /pet-types:
 *   get:
 *     tags: [Public]
 *     summary: List pet types
 *     description: >
 *       Return a list of available pet types.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Dog
 *             examples:
 *               sample:
 *                 summary: Example list
 *                 value:
 *                   - { id: 1, name: "Dog" }
 *                   - { id: 2, name: "Cat" }
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal Server Error
 */

const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: "Method not allowed",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
} as const;


const petTypeRepository = {
  async findAll(): Promise<PetType[]> {
    const types = await prisma.pet_type.findMany({
      orderBy: { id: "asc" },
      select: { id: true, pet_type_name: true },
    });
    return types.map((t) => ({ id: t.id, name: t.pet_type_name }));
  },
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PetType[] | ErrorResponse>
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

