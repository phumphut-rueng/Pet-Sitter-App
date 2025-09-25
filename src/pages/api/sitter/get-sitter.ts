import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const {
      searchTerm,      // คำค้นหาทั่วไป
      petTypes,        // array ของ pet type names ["Dog", "Cat"]
      rating,          // ขั้นต่ำ rating เช่น 4
      experience,      // ช่วงประสบการณ์ เช่น "0-2", "3-5", "5+"
      page = 1,        // หน้าปัจจุบัน
      limit = 5,       // จำนวนรายการต่อหน้า
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // สร้าง WHERE conditions
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // 1) Search term (ชื่อ sitter หรือที่อยู่)
    if (searchTerm) {
      whereConditions.push(`(
        s.name ILIKE $${paramIndex} OR 
        s.address_province ILIKE $${paramIndex} OR 
        s.address_district ILIKE $${paramIndex} OR 
        s.address_sub_district ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // 2) Pet Types (ต้องมีทุกประเภทที่เลือก)
    if (petTypes && petTypes.length > 0) {
      const petTypeArray = Array.isArray(petTypes) ? petTypes : [petTypes];
      
      // สร้าง subquery ที่ตรวจสอบว่า sitter มี pet types ทั้งหมดที่เลือก
      const petTypeConditions = petTypeArray.map((petType) => {
        const placeholder = `$${paramIndex++}`;
        queryParams.push(petType);
        return `EXISTS (
          SELECT 1 FROM sitter_pet_type spt 
          JOIN pet_type pt ON spt.pet_type_id = pt.id 
          WHERE spt.sitter_id = s.id AND pt.pet_type_name = ${placeholder}
        )`;
      }).join(' AND ');
      
      whereConditions.push(`(${petTypeConditions})`);
    }

    // 3) Experience
    if (experience && experience !== "all") {
      switch (experience) {
        case "0-2":
          whereConditions.push(`(s.experience >= 0 AND s.experience <= 2)`);
          break;
        case "3-5":
          whereConditions.push(`(s.experience >= 3 AND s.experience <= 5)`);
          break;
        case "5+":
          whereConditions.push(`(s.experience >= 5)`);
          break;
      }
    }

    // 4) Rating (ขั้นต่ำ)
    if (rating) {
      const minRating = Number(rating);
      whereConditions.push(`(
        SELECT AVG(r.rating)::numeric(3,2)
        FROM review r 
        WHERE r.sitter_id = s.id
      ) >= $${paramIndex}`);
      queryParams.push(minRating);
      paramIndex++;
    }

    // สร้าง WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query สำหรับนับจำนวนทั้งหมด
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM sitter s
      ${whereClause}
    `;

    // Query หลักสำหรับดึงข้อมูล
    const mainQuery = `
      SELECT 
        s.*,
        COALESCE((
          SELECT AVG(r.rating)::numeric(3,2)
          FROM review r 
          WHERE r.sitter_id = s.id
        ), 0) as average_rating,
        (
          SELECT json_agg(
            json_build_object(
              'id', si.id,
              'image_url', si.image_url
            )
          )
          FROM sitter_image si 
          WHERE si.sitter_id = s.id
        ) as sitter_images,
        (
          SELECT json_agg(
            json_build_object(
              'pet_type_name', pt.pet_type_name
            )
          )
          FROM sitter_pet_type spt
          JOIN pet_type pt ON spt.pet_type_id = pt.id
          WHERE spt.sitter_id = s.id
        ) as pet_types
      FROM sitter s
      ${whereClause}
      ORDER BY s.id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Execute queries
    const [countResult, sittersResult] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...queryParams),
      prisma.$queryRawUnsafe(mainQuery, ...queryParams, limitNumber, offset)
    ]);

    const totalCount = Number((countResult as any)[0].total_count);
    const totalPages = Math.ceil(totalCount / limitNumber);

    // Format results
    const formattedResults = (sittersResult as any[]).map((sitter: any) => ({
      ...sitter,
      sitter_image: sitter.sitter_images || [],
      sitter_pet_type: (sitter.pet_types || []).map((pt: any) => ({
        pet_type: { pet_type_name: pt.pet_type_name }
      })),
      averageRating: Number(sitter.average_rating) || 0
    }));

    if (formattedResults.length === 0) {
      return res.status(404).json({ 
        message: "ไม่พบข้อมูล",
        data: [],
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalCount: 0,
          totalPages: 0
        }
      });
    }

    return res.status(200).json({
      data: formattedResults,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error("❌ Error fetching sitters:", error);
    return res.status(500).json({ message: "Error fetching sitters" });
  }
}
