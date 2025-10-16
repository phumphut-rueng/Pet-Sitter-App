import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { petSchema } from "@/lib/validators/pet";
import { Prisma } from "@prisma/client";

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