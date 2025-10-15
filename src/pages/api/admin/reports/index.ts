import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma/prisma";
import { Prisma, report_status as ReportStatusValue } from "@prisma/client";
import type { report_status as ReportStatus } from "@prisma/client";

function sendError(res: NextApiResponse, status: number, message: string) {
  return res.status(status).json({ message });
}

function toPositiveInt(v: unknown, fallback: number): number {
  const n = Number(v);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return fallback;
}

function normalizeStatus(v: unknown): ReportStatus | undefined {
  if (typeof v !== "string") return undefined;
  const raw = v.trim().toLowerCase();
  const mapped = raw === "rejected" ? "canceled" : raw;

  const allowed = new Set<string>(Object.values(ReportStatusValue));
  return allowed.has(mapped) ? (mapped as ReportStatus) : undefined;
}

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
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
type Err = { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const page = Math.max(1, toPositiveInt(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, toPositiveInt(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const keyword = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const statusParam = req.query.status;
    const statusEnum =
      statusParam === "all" || statusParam == null ? undefined : normalizeStatus(statusParam);

    const where: Prisma.reportWhereInput = {};
    if (statusEnum) where.status = statusEnum;
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

    const [rows, total] = await Promise.all([
      prisma.report.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          created_at: true,
          updated_at: true,
          reporter: { select: { id: true, name: true, email: true, profile_image: true } },
          reported_user: { select: { id: true, name: true, email: true, profile_image: true } },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return res.status(200).json({
      reports: rows.map((r) => ({
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
        updatedAt: r.updated_at?.toISOString() ?? r.created_at.toISOString(),
      })),
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error("Reports list error:", err);
    return sendError(res, 500, "Failed to fetch reports");
  }
}