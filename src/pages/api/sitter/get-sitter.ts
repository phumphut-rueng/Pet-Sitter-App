// import type { NextApiRequest, NextApiResponse } from "next";
// import { prisma } from "@/lib/prisma";
// import type { Prisma } from "@prisma/client";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "GET") {
//     res.setHeader("Allow", ["GET"]);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   }

//   try {
//     const {
//       petTypeIds,      // array ของ id [1,2,3]
//       rating,          // ขั้นต่ำ rating เช่น 4
//       experience,      // ขั้นต่ำปีประสบการณ์ เช่น 2
//       tradeName,       // keyword ชื่อ sitter
//       location,        // เช่น "Bangkok"
//     } = req.query;

//     const andConditions: Prisma.sitterWhereInput[] = [];

//     // 1) Query multiple pet type
//     if (petTypeIds) {
//       const ids = Array.isArray(petTypeIds) ? petTypeIds.map(Number) : [Number(petTypeIds)];
//       ids.forEach((id) => {
//         andConditions.push({
//           sitter_pet_type: {
//             some: { pet_type_id: id },
//           },
//         });
//       });
//     }

//     // 2) Query experience
//     if (experience) {
//       andConditions.push({
//         experience: { gte: Number(experience) },
//       });
//     }

//     // 3) Query trade name (partial match)
//     if (tradeName) {
//       andConditions.push({
//         name: {
//           contains: String(tradeName),
//           mode: "insensitive",
//         },
//       });
//     }

//     // 4) Query location
//     if (location) {
//       andConditions.push({
//         OR: [
//           { address_province: { contains: String(location), mode: "insensitive" } },
//           { address_district: { contains: String(location), mode: "insensitive" } },
//           { address_sub_district: { contains: String(location), mode: "insensitive" } },
//         ],
//       });
//     }

//     // --- Query Sitters ---
//     const sitters = await prisma.sitter.findMany({
//       where: andConditions.length ? { AND: andConditions } : undefined,
//       include: {
//         sitter_image: true,
//         sitter_pet_type: { include: { pet_type: true } },
//         reviews: true,
//       },
//     });

//     // ✅ คำนวณ averageRating
//     let result = sitters.map((sitter) => {
//       const ratings = sitter.reviews.map((r) => r.rating);
//       const averageRating =
//         ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
//       return { ...sitter, averageRating };
//     });

//     // ✅ filter เฉพาะ averageRating >= rating (ถ้ามีส่งเข้ามา)
//     if (rating) {
//       result = result.filter((s) => s.averageRating !== null && s.averageRating >= Number(rating));
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ message: "ไม่พบข้อมูล" });
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     console.error("❌ Error fetching sitters:", error);
//     return res.status(500).json({ message: "Error fetching sitters" });
//   }
// }
