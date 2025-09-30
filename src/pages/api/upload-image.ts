import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import { cloudinary } from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err || !files.file) return res.status(400).json({ message: "Invalid upload" });

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "pet-sitter-app",
      });

      return res.status(200).json({ url: upload.secure_url });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Upload failed" });
    }
  });
}