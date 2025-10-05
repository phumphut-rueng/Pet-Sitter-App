import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const {
      searchTerm,      // ค้นหาทั้ง pet sitter name และ full name
      status,          // สถานะ approval เช่น "waiting", "approved", "rejected"
      sortOrder = 'newest', // เรียงลำดับ newest หรือ oldest
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

    // 1) Search term (ค้นหาทั้ง pet sitter name และ full name)
    if (searchTerm) {
      whereConditions.push(`(s.name ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex + 1})`);
      queryParams.push(`%${searchTerm}%`);
      queryParams.push(`%${searchTerm}%`);
      paramIndex += 2;
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

    // สร้าง ORDER BY clause
    let orderByClause = '';
    if (sortOrder === 'oldest') {
      orderByClause = 'ORDER BY s.created_at ASC, s.status_updated_at ASC';
    } else {
      orderByClause = 'ORDER BY s.status_updated_at DESC NULLS LAST, s.created_at DESC';
    }

    // สร้าง WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query สำหรับนับจำนวนทั้งหมด
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM sitter s
      LEFT JOIN "user" u ON s.user_sitter_id = u.id
      LEFT JOIN sitter_approval_status sas ON s.approval_status_id = sas.id
      ${whereClause}
    `;

    // Query หลักสำหรับดึงข้อมูล
    const mainQuery = `
      SELECT 
        s.*,
        s.service_description,
        u.name as user_name,
        u.email as user_email,
        u.dob as user_dob,
        u.profile_image as user_profile_image,
        s.approval_status_id,
        sas.status_name as approval_status,
        sas.description as status_description,
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
      LEFT JOIN "user" u ON s.user_sitter_id = u.id
      LEFT JOIN sitter_approval_status sas ON s.approval_status_id = sas.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    // Execute queries
    const [countResult, sittersResult] = await Promise.all([
      prisma.$queryRawUnsafe(countQuery, ...queryParams),
      prisma.$queryRawUnsafe(mainQuery, ...queryParams, limitNumber, offset)
    ]);

    const totalCount = Number((countResult as { total_count: string }[])[0].total_count);
    const totalPages = Math.ceil(totalCount / limitNumber);

    // Format results
    const formattedResults = (sittersResult as Record<string, unknown>[]).map((sitter: Record<string, unknown>) => ({
      ...sitter,
      sitter_image: sitter.sitter_images || [],
      sitter_pet_type: ((sitter.pet_types as Record<string, unknown>[]) || []).map((pt: Record<string, unknown>) => ({
        pet_type: { pet_type_name: pt.pet_type_name }
      })),
      averageRating: Number(sitter.average_rating) || 0
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
    console.error("❌ Error fetching admin sitters:", error);
    return res.status(500).json({ message: "Error fetching admin sitters" });
  }
}
