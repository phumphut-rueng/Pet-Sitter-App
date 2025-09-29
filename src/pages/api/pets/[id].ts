import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { petSchema } from "@/lib/validators/pet";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const userIdStr = session?.user?.id;
  if (!userIdStr) return res.status(401).json({ error: "Unauthorized" });

  const userId = Number(userIdStr);
  if (!Number.isFinite(userId)) return res.status(400).json({ error: "Invalid user id" });

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    if (req.method === "GET") {
      const pet = await prisma.pet.findFirst({
        where: { id, owner_id: userId },
        include: { pet_type: true },
      });
      if (!pet) return res.status(404).json({ error: "Pet not found" });

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
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }
      const data = parsed.data;

      const updated = await prisma.pet.updateMany({
        where: { id, owner_id: userId },
        data: {
          pet_type_id: data.petTypeId,
          name: data.name,
          breed: data.breed,
          sex: data.sex,
          age_month: data.ageMonth,
          color: data.color,
          weight_kg: data.weightKg,
          about: data.about,
          image_url: data.imageUrl,
          updated_at: new Date(),
        },
      });
      if (updated.count === 0) return res.status(404).json({ error: "Pet not found" });

      return res.status(200).json({ message: "OK" });
    }

    if (req.method === "DELETE") {
      const result = await prisma.pet.deleteMany({ where: { id, owner_id: userId } });
      if (result.count === 0) return res.status(404).json({ error: "Pet not found" });
      return res.status(200).json({ message: "Deleted" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("pet [id] api error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}