import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { petSchema } from "@/lib/validators/pet";
import { Prisma } from "@prisma/client";


/**
 * @openapi
 * /pets/{id}:
 *   get:
 *     tags: [Pets]
 *     summary: Get a pet owned by the current user
 *     description: Return a single pet by id. The pet must belong to the current session user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Pet found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 10 }
 *                 name: { type: string, nullable: true, example: "Milo" }
 *                 breed: { type: string, nullable: true, example: "Shiba" }
 *                 sex: { type: string, enum: ["Male","Female"], example: "Male" }
 *                 ageMonth: { type: integer, nullable: true, example: 18 }
 *                 color: { type: string, nullable: true, example: "brown" }
 *                 weightKg: { type: number, nullable: true, example: 8.2 }
 *                 about: { type: string, example: "Friendly and energetic" }
 *                 imageUrl: { type: string, nullable: true, example: null }
 *                 petTypeId: { type: integer, nullable: true, example: 1 }
 *                 petTypeName: { type: string, example: "Dog" }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     tags: [Pets]
 *     summary: Update a pet
 *     description: Update a pet owned by the current session user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [petTypeId, name, sex, ageMonth]
 *             properties:
 *               petTypeId: { type: integer, nullable: true, example: 1 }
 *               name: { type: string, example: "Milo" }
 *               breed: { type: string, nullable: true, example: "Shiba" }
 *               sex: { type: string, enum: ["Male","Female"], example: "Male" }
 *               ageMonth: { type: integer, nullable: true, example: 18 }
 *               color: { type: string, nullable: true, example: "brown" }
 *               weightKg: { type: number, nullable: true, example: 8.2 }
 *               about: { type: string, nullable: true, example: "Gentle and playful" }
 *               imageUrl: { type: string, nullable: true, example: null }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "OK" }
 *       400:
 *         description: Validation failed or invalid id
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     tags: [Pets]
 *     summary: Delete a pet
 *     description: Delete a pet owned by the current session user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Deleted" }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pet not found
 *       409:
 *         description: Conflict due to foreign key references
 *       500:
 *         description: Internal Server Error
 */


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const userIdStr = session?.user?.id;
  if (!userIdStr) return res.status(401).json({ message: "Unauthorized" });

  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) return res.status(400).json({ message: "Invalid user id" });

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  try {
    if (req.method === "GET") {
      const pet = await prisma.pet.findFirst({
        where: { id, owner_id: userId },
        include: { pet_type: true },
      });

      if (!pet) return res.status(404).json({ message: "Pet not found" });

      return res.status(200).json({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        sex: pet.sex as "Male" | "Female",
        ageMonth: pet.age_month,
        color: pet.color,
        weightKg: Number(pet.weight_kg),
        about: pet.about ?? "",
        imageUrl: pet.image_url || undefined,
        petTypeId: pet.pet_type_id,
        petTypeName: pet.pet_type?.pet_type_name ?? "",
      });
    }

    if (req.method === "PUT") {
      const parsed = petSchema.safeParse(req.body);
      if (!parsed.success) {
        const flat = parsed.error.flatten();
        return res.status(400).json({
          message: "Validation failed",
          fieldErrors: flat.fieldErrors,
        });
      }
      const data = parsed.data;

      const updated = await prisma.pet.updateMany({
        where: { id, owner_id: userId },
        data: {
          pet_type_id: data.petTypeId,
          name: data.name,
          breed: data.breed,
          sex: data.sex, // "Male" | "Female"
          age_month: data.ageMonth,
          color: data.color,
          weight_kg: data.weightKg,
          about: data.about || null,
          image_url: data.imageUrl || null,
          updated_at: new Date(),
        },
      });

      if (updated.count === 0) return res.status(404).json({ message: "Pet not found" });
      return res.status(200).json({ message: "OK" });
    }

    if (req.method === "DELETE") {
      const result = await prisma.$transaction(async (tx) => {
        await tx.booking_pet_detail.deleteMany({
          where: { pet_detail_id: id },
        });

        return tx.pet.deleteMany({
          where: { id, owner_id: userId },
        });
      });

      if (result.count === 0) return res.status(404).json({ message: "Pet not found" });
      return res.status(200).json({ message: "Deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return res.status(409).json({
          message:
            "Cannot delete this pet because it is referenced by other records (e.g., bookings).",
        });
      }
    }

    console.error("pet [id] api error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}