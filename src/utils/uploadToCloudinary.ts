// uploadToCloudinary.ts
import { api } from "@/lib/api/axios";

export type UploadImageResponse = {
  url: string;
  public_id?: string;
  message?: string;
};

// ใช้ endpoint ที่ "ไม่" ขึ้นต้นด้วย /api เพราะ baseURL = "/api" อยู่แล้ว
const UPLOAD_ENDPOINT = "/upload-image";

export async function uploadToCloudinary(
  file: File,
  opts?: { folder?: string; oldPublicId?: string }
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  if (opts?.folder) fd.append("folder", opts.folder);
  if (opts?.oldPublicId) fd.append("oldPublicId", opts.oldPublicId);

  const { data } = await api.post<UploadImageResponse>(UPLOAD_ENDPOINT, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!data?.url) throw new Error("Upload failed: missing URL");
  return data.url;
}

export async function uploadToCloudinaryEx(
  file: File,
  opts?: { folder?: string; oldPublicId?: string }
): Promise<UploadImageResponse> {
  const fd = new FormData();
  fd.append("file", file);
  if (opts?.folder) fd.append("folder", opts.folder);
  if (opts?.oldPublicId) fd.append("oldPublicId", opts.oldPublicId);

  const { data } = await api.post<UploadImageResponse>(UPLOAD_ENDPOINT, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!data?.url) throw new Error("Upload failed: missing URL");
  return data;
}