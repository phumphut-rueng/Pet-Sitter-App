import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma/prisma";
import { authOptions } from "../auth/[...nextauth]";
import { labelToNumber } from "@/lib/utils/experience";
import type { Prisma } from "@prisma/client";
import { emailRegex, phoneRegex } from "@/lib/validators/validation";


/**
 * @openapi
 * /sitter/put-sitter:
 *   put:
 *     tags: [Sitter]
 *     summary: Create or update my sitter profile
 *     description: >
 *       Create sitter profile if not exists, otherwise update existing one.  
 *       Requires signed-in session via cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string, nullable: true, example: "Jane Sitter" }
 *               experience: { type: string, nullable: true, example: "3-5 years" }
 *               phone: { type: string, nullable: true, example: "0812345678" }
 *               email: { type: string, nullable: true, example: "jane@example.com" }
 *               tradeName: { type: string, nullable: true, example: "Happy Paws" }
 *               petTypes:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["Dog","Cat"]
 *               introduction: { type: string, nullable: true, example: "Animal lover." }
 *               location_description: { type: string, nullable: true, example: "Near central park" }
 *               service_description: { type: string, nullable: true, example: "Walking, boarding" }
 *               address_detail: { type: string, nullable: true, example: "123/45 Soi 1" }
 *               address_province: { type: string, nullable: true, example: "Bangkok" }
 *               address_district: { type: string, nullable: true, example: "Bang Kapi" }
 *               address_sub_district: { type: string, nullable: true, example: "Hua Mak" }
 *               address_post_code: { type: string, nullable: true, example: "10240" }
 *               profileImageUrl: { type: string, nullable: true, example: "https://..." }
 *               images:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["https://cdn/img1.jpg","https://cdn/img2.jpg"]
 *               latitude:
 *                 type: number
 *                 nullable: true
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 13.7563
 *               longitude:
 *                 type: number
 *                 nullable: true
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 100.5018
 *     responses:
 *       200:
 *         description: Sitter saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400: { description: Invalid input or format }
 *       401: { description: Unauthorized }
 *       404: { description: User not found }
 *       405: { description: Method not allowed }
 *       409:
 *         description: Conflict (duplicate email/phone or pet types)
 *       500: { description: Server error while saving sitter }
 *     security:
 *       - cookieAuth: []
 */

const phoneRe = phoneRegex;
const emailRe = emailRegex;

type Body = {
  fullName?: string;
  experience?: string;
  phone?: string;
  email?: string;
  tradeName?: string;
  petTypes?: string[];
  introduction?: string;
  location_description?: string;
  service_description?: string;
  address_detail?: string;
  address_province?: string;
  address_district?: string;
  address_sub_district?: string;
  address_post_code?: string;
  profileImageUrl?: string;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
  bank_account_number?: string;
  account_name?: string;
  bank_name?: string;
  book_bank_image?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "PUT") {
      return res
        .status(405)
        .json({ message: `Method ${req.method} not allowed` });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email)
      return res.status(401).json({ message: "Unauthorized" });

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true },
    });
    if (!me) return res.status(404).json({ message: "User not found" });

    const b = (req.body ?? {}) as Body;

    const phone = b.phone?.trim();
    const email = b.email?.trim();
    const fullName = b.fullName?.trim();
    const tradeName = b.tradeName?.trim();
    const profileImageUrl = b.profileImageUrl?.trim();
    const hasLatitude = b.latitude !== undefined;
    const hasLongtitude = b.longitude !== undefined;

    const hasImages = Array.isArray(b.images);
    const gallery = hasImages
      ? (b.images ?? []).map((u) => (u ?? "").trim()).filter(Boolean)
      : [];

    const hasPetTypes = Array.isArray(b.petTypes);
    const petTypeNames = hasPetTypes
      ? Array.from(
          new Set((b.petTypes ?? []).map((v) => v.trim()).filter(Boolean))
        )
      : [];

    const expNumber = b.experience ? labelToNumber(b.experience) : undefined;

    if (phone && !phoneRe.test(phone))
      return res.status(400).json({ message: "Invalid phone format" });
    if (email && !emailRe.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    // duplicate check (ยกเว้นของตัวเอง)
    if (phone) {
      const dup = await prisma.user.findFirst({
        where: { phone, NOT: { id: me.id } },
        select: { id: true },
      });
      if (dup) return res.status(409).json({ message: "Phone already exists" });
    }
    if (email) {
      const dup = await prisma.user.findFirst({
        where: { email, NOT: { id: me.id } },
        select: { id: true },
      });
      if (dup) return res.status(409).json({ message: "Email already exists" });
    }

    //ตรวจสอบความถูกต้องของ latitude/longitude
    if (hasLatitude && b.latitude !== null) {
      const v = Number(b.latitude);
      if (Number.isNaN(v) || v < -90 || v > 90) {
        return res.status(400).json({ message: "Invalid latitude" });
      }
    }

    if (hasLongtitude && b.longitude !== null) {
      const v = Number(b.longitude);
      if (Number.isNaN(v) || v < -180 || v > 180) {
        return res.status(400).json({ message: "Invalid longitude" });
      }
    }

    const petTypeIds: number[] = [];
    if (hasPetTypes) {
      for (const name of petTypeNames) {
        const row = await prisma.pet_type.upsert({
          where: { pet_type_name: name },
          update: {},
          create: { pet_type_name: name },
          select: { id: true },
        });
        petTypeIds.push(row.id);
      }
    }

    const result = await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: { id: me.id },
          data: {
            ...(fullName ? { name: fullName } : {}),
            ...(email ? { email } : {}),
            ...(phone ? { phone } : {}),
            ...(profileImageUrl ? { profile_image: profileImageUrl } : {}),
            updated_at: new Date(),
          },
        });

        const existing = await tx.sitter.findFirst({
          where: { user_sitter_id: me.id },
          select: { id: true },
        });

        const baseDataForCreate: Prisma.sitterUncheckedCreateInput = {
          user_sitter_id: me.id,
          name: tradeName || fullName || me.email,
          ...(phone !== undefined ? { phone: phone || null } : {}),
          ...(expNumber !== undefined ? { experience: expNumber } : {}),
          ...(b.introduction !== undefined
            ? { introduction: b.introduction ?? null }
            : {}),
          ...(b.location_description !== undefined
            ? { location_description: b.location_description ?? null }
            : {}),
          ...(b.service_description !== undefined
            ? { service_description: b.service_description ?? null }
            : {}),
          ...(b.address_detail !== undefined
            ? { address_detail: b.address_detail ?? null }
            : {}),
          ...(b.address_province !== undefined
            ? { address_province: b.address_province ?? null }
            : {}),
          ...(b.address_district !== undefined
            ? { address_district: b.address_district ?? null }
            : {}),
          ...(b.address_sub_district !== undefined
            ? { address_sub_district: b.address_sub_district ?? null }
            : {}),
          ...(b.address_post_code !== undefined
            ? { address_post_code: b.address_post_code ?? null }
            : {}),
          ...(hasLatitude ? { latitude: b.latitude ?? null } : {}),
          ...(hasLongtitude ? { longitude: b.longitude ?? null } : {}),
          ...(b.bank_account_number !== undefined
            ? { bank_account_number: b.bank_account_number || null }
            : {}),
          ...(b.account_name !== undefined
            ? { account_name: b.account_name || null }
            : {}),
          ...(b.bank_name !== undefined ? { bank_name: b.bank_name || null } : {}),
          ...(b.book_bank_image !== undefined ? { book_bank_image: b.book_bank_image || null } : {}),
          updated_at: new Date(),
        };

        const baseDataForUpdate: Prisma.sitterUncheckedUpdateInput = {
          ...(tradeName || fullName ? { name: tradeName || fullName } : {}),
          ...(phone !== undefined ? { phone: phone || null } : {}),
          ...(expNumber !== undefined ? { experience: expNumber } : {}),
          ...(b.introduction !== undefined
            ? { introduction: b.introduction || null }
            : {}),
          ...(b.location_description !== undefined
            ? { location_description: b.location_description || null }
            : {}),
          ...(b.service_description !== undefined
            ? { service_description: b.service_description || null }
            : {}),
          ...(b.address_detail !== undefined
            ? { address_detail: b.address_detail || null }
            : {}),
          ...(b.address_province !== undefined
            ? { address_province: b.address_province || null }
            : {}),
          ...(b.address_district !== undefined
            ? { address_district: b.address_district || null }
            : {}),
          ...(b.address_sub_district !== undefined
            ? { address_sub_district: b.address_sub_district || null }
            : {}),
          ...(b.address_post_code !== undefined
            ? { address_post_code: b.address_post_code || null }
            : {}),
          ...(hasLatitude ? { latitude: b.latitude ?? null } : {}),
          ...(hasLongtitude ? { longitude: b.longitude ?? null } : {}),
          ...(b.bank_account_number !== undefined
            ? { bank_account_number: b.bank_account_number || null }
            : {}),
          ...(b.account_name !== undefined
            ? { account_name: b.account_name || null }
            : {}),
          ...(b.bank_name !== undefined ? { bank_name: b.bank_name || null } : {}),
          ...(b.book_bank_image !== undefined ? { book_bank_image: b.book_bank_image || null } : {}),
          updated_at: new Date(),
        };

        if (!existing) {
          if (hasImages) {
            baseDataForCreate.sitter_image = {
              create: gallery.map((url) => ({ image_url: url })),
            };
          }
          if (hasPetTypes) {
            baseDataForCreate.sitter_pet_type = {
              create: petTypeIds.map((id) => ({
                pet_type: { connect: { id } },
              })),
            };
          }
          return tx.sitter.create({
            data: baseDataForCreate,
            include: {
              sitter_image: true,
              sitter_pet_type: { include: { pet_type: true } },
            },
          });
        }

        if (hasImages) {
          await tx.sitter_image.deleteMany({
            where: { sitter_id: existing.id },
          });
          baseDataForUpdate.sitter_image = {
            create: gallery.map((url) => ({ image_url: url })),
          };
        }

        if (hasPetTypes) {
          baseDataForUpdate.sitter_pet_type = {
            connectOrCreate: petTypeIds.map((id) => ({
              where: {
                sitter_id_pet_type_id: {
                  sitter_id: existing.id,
                  pet_type_id: id,
                },
              },
              create: { pet_type: { connect: { id } } },
            })),
            deleteMany: { pet_type_id: { notIn: petTypeIds } },
          };
        }

        const sitter = await tx.sitter.update({
          where: { id: existing.id },
          data: baseDataForUpdate,
          include: {
            sitter_image: true,
            sitter_pet_type: { include: { pet_type: true } },
          },
        });

        if (sitter.approval_status_id === 4) {
          const sitterRole = await tx.role.findFirst({
            where: { role_name: "Sitter" },
            select: { id: true },
          });

          if (sitterRole) {
            const alreadyHasRole = await tx.user_role.findFirst({
              where: { user_id: me.id, role_id: sitterRole.id },
            });

            if (!alreadyHasRole) {
              await tx.user_role.create({
                data: {
                  user_id: me.id,
                  role_id: sitterRole.id,
                },
              });
            }
          }
        }

        return sitter;
      },
      { timeout: 15000 }
    );

    return res.status(200).json(result);
  } catch (e: unknown) {
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      const meta = (e as { meta?: { target?: string[] | string } }).meta;
      const t = String(
        Array.isArray(meta?.target) ? meta.target.join(",") : meta?.target || ""
      );
      if (t.includes("email"))
        return res.status(409).json({ message: "Email already exists" });
      if (t.includes("phone"))
        return res.status(409).json({ message: "Phone already exists" });
      if (t.includes("sitter_id") && t.includes("pet_type_id")) {
        return res.status(409).json({ message: "Duplicate pet types" });
      }
    }
    console.error("put-sitter error:", e);
    return res
      .status(500)
      .json({ message: "Server error while saving sitter" });
  }
}
