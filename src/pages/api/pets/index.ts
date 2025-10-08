import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";
import { petSchema } from "@/lib/validators/pet";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const userIdStr = session?.user?.id;
  if (!userIdStr) return res.status(401).json({ message: "Unauthorized" });

  const ownerId = Number(userIdStr);
  if (!Number.isFinite(ownerId)) return res.status(400).json({ message: "Invalid user id" });

  try {
    if (req.method === "GET") {
      const pets = await prisma.pet.findMany({
        where: { owner_id: ownerId },
        orderBy: { id: "asc" },
        include: { pet_type: true },
      });


      return res.status(200).json(
        pets.map((p) => ({
          id: p.id,
          name: p.name,
          petTypeId: p.pet_type_id,
          petTypeName: p.pet_type?.pet_type_name ?? "",
          breed: p.breed,
          sex: p.sex as "Male" | "Female",
          ageMonth: p.age_month,
          color: p.color,
          weightKg: Number(p.weight_kg),
          about: p.about ?? "",
          imageUrl: p.image_url ?? "",
        }))
      );
    }

    if (req.method === "POST") {
      const parsed = petSchema.safeParse(req.body);
      console.log("parsed", parsed);

      if (!parsed.success) {
        const flat = parsed.error.flatten();
        return res.status(400).json({
          message: "Validation failed",
          fieldErrors: flat.fieldErrors, // { [field]: string[] }
        });
      }
      const data = parsed.data;
      console.log("data", data);
      const created = await prisma.pet.create({
        data: {
          owner_id: ownerId,
          pet_type_id: data.petTypeId,
          name: data.name,
          breed: data.breed,
          sex: data.sex,
          age_month: data.ageMonth,
          color: data.color,
          weight_kg: data.weightKg,
          about: data.about || null,
          image_url: data.imageUrl || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: { pet_type: true },
      });

      return res.status(201).json({
        id: created.id,
        name: created.name,
        petTypeId: created.pet_type_id,
        petTypeName: created.pet_type?.pet_type_name ?? "",
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  } catch (e) {
    console.error("pets api error:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}