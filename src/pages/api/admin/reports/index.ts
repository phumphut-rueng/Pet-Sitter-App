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

/** ให้ TS เห็นฟิลด์relation  include เข้ามาจริง */
type ReportWithRelations = Prisma.reportGetPayload<{
  include: {
    reporter: { select: { id: true; name: true; email: true; profile_image: true } };
    reported_user: { select: { id: true; name: true; email: true; profile_image: true } };
  };
}>;

/** แปลงค่าจาก query ให้เป็น enum report_status (ถ้าไม่แมตช์ คืน undefined) */
function normalizeStatus(v: unknown): ReportStatus | undefined {
  if (typeof v !== "string") return undefined;
  const raw = v.trim().toLowerCase();
  // UI เก่าอาจส่ง rejected map เป็น canceled
  const mapped = raw === "rejected" ? "canceled" : raw;

  // runtime enum object ของ Prisma (ตัวพิมพ์เล็ก)
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

    // OR เงื่อนไขค้นหาแบบ type-safe
    const keywordOr: Prisma.reportWhereInput[] | undefined = keyword
      ? [
          {
            title: {
              contains: keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: keyword,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            reporter: {
              is: {
                OR: [
                  { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                  { email: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                ],
              },
            },
          },
          {
            reported_user: {
              is: {
                OR: [
                  { name: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                  { email: { contains: keyword, mode: Prisma.QueryMode.insensitive } },
                ],
              },
            },
          },
        ]
      : undefined;

    // แปลง status เป็น enum ของ Prisma (หรือ undefined ถ้าไม่กรอง)
    const statusEnum = normalizeStatus(status);

    // where เป็น Prisma.reportWhereInput จริง 
    const where: Prisma.reportWhereInput = {
      ...(statusEnum ? { status: statusEnum } : {}),
      ...(keywordOr ? { OR: keywordOr } : {}),
    };

    // ให้ TS infer tuple ด้วย as const (แก้ overload)
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, profile_image: true },
          },
          reported_user: {
            select: { id: true, name: true, email: true, profile_image: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.report.count({ where }),
    ] as const);

    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    return res.status(200).json({
      reports: (reports as ReportWithRelations[]).map((r) => ({
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
    console.error("Error fetching reports:", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
}