import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), "prisma", "erd.svg");
  if (!fs.existsSync(filePath)) {
    res.status(404).send("ERD not found. Run `npx prisma generate` first.");
    return;
  }

  const stats = fs.statSync(filePath);

  // 1) โหมด meta: ส่งข้อมูลไฟล์เป็น JSON
  if (req.query.meta === "1") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({
      updatedAtISO: stats.mtime.toISOString(),
      updatedAt: stats.mtime.toLocaleString(),
      size: stats.size
    });
    return;
  }

  // 2) โหมดดาวน์โหลด
  const download = req.query.download === "1";

  const svg = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Last-Modified", stats.mtime.toUTCString());
  res.setHeader("Cache-Control", "public, max-age=60"); // แคชเบา ๆ 60s
  if (download) {
    res.setHeader("Content-Disposition", `attachment; filename="pet-sitter-erd.svg"`);
  }

  res.send(svg);
}
