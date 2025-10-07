import axios from "axios";

export const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);
export const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

/** แปลง data:image/...;base64,xxx → File โดยไม่ใช้ fetch */
export function dataUrlToFile(dataUrl: string, filename = "upload.png"): File {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");

  const mime = m[1] || "image/png";
  const b64  = m[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const blob = new Blob([bytes], { type: mime });
  return new File([blob], filename, { type: mime });
}

/** โหลดรูปจาก http/https → File (ใช้ axios), หรือ data URL → File (ไม่ใช้ fetch) */
export async function urlToFile(url: string, filename = "upload.png"): Promise<File> {
  if (isDataUrl(url)) {
    return dataUrlToFile(url, filename);
  }
  if (!isHttpUrl(url)) {
    throw new Error("Unsupported URL format");
  }
  const res = await axios.get(url, { responseType: "blob" });
  const mime = res.headers["content-type"] || res.data?.type || "application/octet-stream";
  return new File([res.data], filename, { type: mime });
}