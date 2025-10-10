import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      searchTerm,      // คำค้นหาทั่วไป
      status,          // สถานะ approval เช่น "waiting", "approved", "rejected"
      page = 1,        // หน้าปัจจุบัน
      limit = 8,      // จำนวนรายการต่อหน้า
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // สร้าง WHERE conditions
    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];
    let paramIndex = 1;

    // ไม่แสดงข้อมูล Pending submission
    whereConditions.push(`sas.status_name != 'Pending submission'`);

    // 1) Search term (เฉพาะ user name)
    if (searchTerm) {
      whereConditions.push(`u.name ILIKE $${paramIndex}`);
      queryParams.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // 2) Status filter
    if (status && status !== "all") {
      // แปลง status จาก frontend เป็น status_name ที่ตรงกับ database
      let statusName = '';
      switch (status) {
        case 'pending':
          statusName = 'Pending submission';
          break;
        case 'waiting':
          statusName = 'Waiting for approve';
          break;
        case 'approved':
          statusName = 'Approved';
          break;
        case 'rejected':
          statusName = 'Rejected';
          break;
        default:
          statusName = String(status);
      }

      whereConditions.push(`sas.status_name = $${paramIndex}`);
      queryParams.push(statusName);
      paramIndex++;
    }

    // สร้าง WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query สำหรับนับจำนวนทั้งหมด
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM "user" u
      LEFT JOIN sitter_approval_status sas ON u.approval_status_id = sas.id
      ${whereClause}
    `;

    // Query หลักสำหรับดึงข้อมูล
    const mainQuery = `
      SELECT 
        u.*,
        sas.status_name as approval_status,
        sas.description as status_description,
        COALESCE((
          SELECT AVG(r.rating)::numeric(3,2)
          FROM review r 
          JOIN sitter s ON r.sitter_id = s.id
          WHERE s.user_sitter_id = u.id
        ), 0) as average_rating,
        (
          SELECT json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'address_province', s.address_province,
              'address_district', s.address_district
            )
          )
          FROM sitter s 
          WHERE s.user_sitter_id = u.id
        ) as sitter_profiles,
        (
          SELECT json_agg(
            json_build_object(
              'pet_type_name', pt.pet_type_name
            )
          )
          FROM sitter s
          JOIN sitter_pet_type spt ON s.id = spt.sitter_id
          JOIN pet_type pt ON spt.pet_type_id = pt.id
          WHERE s.user_sitter_id = u.id
        ) as pet_types
      FROM "user" u
      LEFT JOIN sitter_approval_status sas ON u.approval_status_id = sas.id
      ${whereClause}
      ORDER BY u.status_updated_at DESC NULLS LAST, u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Execute queries
    const [countResult, usersResult] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...queryParams),
      prisma.$queryRawUnsafe(mainQuery, ...queryParams, limitNumber, offset)
    ]);

    const totalCount = Number((countResult as { total_count: string }[])[0].total_count);
    const totalPages = Math.ceil(totalCount / limitNumber);

    // Format results
    const formattedResults = (usersResult as Record<string, unknown>[]).map((user: Record<string, unknown>) => ({
      ...user,
      sitter_profiles: user.sitter_profiles || [],
      pet_types: ((user.pet_types as Record<string, unknown>[]) || []).map((pt: Record<string, unknown>) => ({
        pet_type: { pet_type_name: pt.pet_type_name }
      })),
      averageRating: Number(user.average_rating) || 0
    }));

    if (formattedResults.length === 0) {
      return res.status(200).json({
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
    console.error("❌ Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users" });
  }
}
