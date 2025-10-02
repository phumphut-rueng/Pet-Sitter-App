import { extractPublicId } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export type UploadOptions = { folder?: string };
export type UploadResult = { public_id: string; url?: string };

export async function uploadAndGetPublicId(
  file: File,
  folder = "owner-profile"
): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);

  const res = await fetch(`${API_BASE}/api/upload-image`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Upload failed"));

  const data = (await res.json()) as { public_id?: string; url?: string };
  const public_id = data.public_id ?? extractPublicId(data.url);
  if (!public_id) throw new Error("Upload success but missing public_id");
  return { public_id, url: data.url };
}