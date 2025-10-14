import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { Prisma, report_status as ReportStatusValue } from "@prisma/client";
import type { report_status as ReportStatus } from "@prisma/client";

type Ok = {
  reports: Array<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    reporter: {
      id: number;
      name: string | null;
      email: string;
      profileImage: string | null;
    };
    reportedUser: {
      id: number;
      name: string | null;
      email: string;
      profileImage: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type Err = { message: string };

/** แปลงค่าจาก query ให้เป็น enum report_status (ถ้าไม่แมตช์ คืน undefined) */
function normalizeStatus(v: unknown): ReportStatus | undefined {
  if (typeof v !== "string") return undefined;
  const raw = v.trim().toLowerCase();
  //rejected map เป็น canceled
  const mapped = raw === "rejected" ? "canceled" : raw;

  // runtime enum object ของ Prisma 
  const allowed = new Set<string>(Object.values(ReportStatusValue));
  return allowed.has(mapped) ? (mapped as ReportStatus) : undefined;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { status, q, page = "1", limit = "10" } = req.query;

    // pagination
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // keyword
    const keyword = typeof q === "string" ? q.trim() : "";

    // แปลง status (ถ้าเป็น "all" ไม่กรอง)
    const statusEnum = status === "all" || !status ? undefined : normalizeStatus(status);

    // สร้าง where condition
    const where: Prisma.reportWhereInput = {};

    if (statusEnum) {
      where.status = statusEnum;
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        {
          reporter: {
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { email: { contains: keyword, mode: "insensitive" } },
            ],
          },
        },
        {
          reported_user: {
            OR: [
              { name: { contains: keyword, mode: "insensitive" } },
              { email: { contains: keyword, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_image: true,
          },
        },
        reported_user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_image: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limitNum,
    });

    const total = await prisma.report.count({ where });

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status,
        reporter: {
          id: r.reporter.id,
          name: r.reporter.name,
          email: r.reporter.email,
          profileImage: r.reporter.profile_image,
        },
        reportedUser: r.reported_user
          ? {
              id: r.reported_user.id,
              name: r.reported_user.name,
              email: r.reported_user.email,
              profileImage: r.reported_user.profile_image,
            }
          : null,
        createdAt: r.created_at.toISOString(),
        updatedAt: (r.updated_at ?? r.created_at).toISOString(),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (err: unknown) {
    console.error(" Error fetching reports:", err);
    if (err instanceof Error) {
      console.error("Stack:", err.stack);
    }
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
}