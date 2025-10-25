import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma/prisma";
import { petSchema } from "@/lib/validators/pet";

/**
 * @openapi
 * /pets:
 *   get:
 *     tags: [Pets]
 *     summary: List pets of current user
 *     description: Return all pets belonging to the current session user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of pets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer, example: 10 }
 *                   name: { type: string, nullable: true, example: "Milo" }
 *                   petTypeId: { type: integer, nullable: true, example: 1 }
 *                   petTypeName: { type: string, example: "Dog" }
 *                   breed: { type: string, nullable: true, example: "Shiba" }
 *                   sex: { type: string, enum: ["Male","Female"], example: "Male" }
 *                   ageMonth: { type: integer, nullable: true, example: 18 }
 *                   color: { type: string, nullable: true, example: "brown" }
 *                   weightKg: { type: number, nullable: true, example: 8.2 }
 *                   about: { type: string, example: "Friendly and energetic" }
 *                   imageUrl: { type: string, example: "" }
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     tags: [Pets]
 *     summary: Create a pet
 *     description: Create a pet for the current session user.
 *     security:
 *       - cookieAuth: []
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
 *       201:
 *         description: Pet created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer, example: 25 }
 *                 name: { type: string, example: "Milo" }
 *                 petTypeId: { type: integer, example: 1 }
 *                 petTypeName: { type: string, example: "Dog" }
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal Server Error
 */

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

      if (!parsed.success) {
        const flat = parsed.error.flatten();
        return res.status(400).json({
          message: "Validation failed",
          fieldErrors: flat.fieldErrors, // { [field]: string[] }
        });
      }
      const data = parsed.data;
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

      // NOTIFICATION SYSTEM: Create notification when adding new pet
      try {
        const { createSystemNotification } = await import('@/lib/notifications/notification-utils');
        
        // Create notification directly
        await createSystemNotification(
          ownerId,
          'Pet Added!',
          `Your pet "${created.name}" (${created.pet_type?.pet_type_name ?? ""}) has been added to your profile.`
        );
        
        // Trigger real-time notification update
        try {
          // Send event to frontend directly
          if (typeof global !== 'undefined' && global.window) {
            global.window.dispatchEvent(new CustomEvent('socket:notification_refresh', {
              detail: { userId: ownerId }
            }));
            global.window.dispatchEvent(new CustomEvent('update:notification_count', {
              detail: { userId: ownerId }
            }));
          }
        } catch (error) {
          console.error('Failed to trigger real-time update:', error);
        }
      } catch (notificationError) {
        console.error('Failed to create pet registration notification:', notificationError);
      }

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