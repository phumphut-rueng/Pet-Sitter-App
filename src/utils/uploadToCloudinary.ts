// [ADDED] ชนิดข้อมูลของ response จาก API (ไม่ใช้ any)
type UploadImageResponse = {
  url: string;
  public_id?: string;
  message?: string;
};

// [CHANGED] เพิ่มพารามิเตอร์ opts { folder?, oldPublicId? } เพื่อส่งไปกับ FormData
export async function uploadToCloudinary(
  file: File,
  opts?: { folder?: string; oldPublicId?: string }
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // [ADDED] แนบชื่อโฟลเดอร์ (และข้อมูลอื่น ๆ ถ้าต้องการ)
  if (opts?.folder) formData.append("folder", opts.folder);
  if (opts?.oldPublicId) formData.append("oldPublicId", opts.oldPublicId);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    // [CHANGED] อ่าน error จาก body ถ้ามี เพื่อ debug ง่ายขึ้น
    try {
      const err = (await res.json()) as Partial<UploadImageResponse>;
      throw new Error(err.message || "Upload failed");
    } catch {
      throw new Error("Upload failed");
    }
  }

  // [CHANGED] พาร์สแบบ typed (ไม่ cast ตรง ๆ เป็น any)
  const data = (await res.json()) as UploadImageResponse;

  // [CHANGED] กันกรณี API ไม่คืน url มา
  if (!data.url) {
    throw new Error("Upload failed: missing URL");
  }

  // [UNCHANGED] คืนค่า url เหมือนเดิม เพื่อไม่พังโค้ดส่วนอื่น
  return data.url;
}

/* -------------------------------------------------------
   [OPTIONAL] ถ้าอยากได้ทั้ง url + public_id กลับไปใช้งานต่อ
   (เช่น เก็บ public_id ใน DB เพื่อง่ายเวลาลบ/อัพเดตรูป)
-------------------------------------------------------- */
export async function uploadToCloudinaryEx(
  file: File,
  opts?: { folder?: string; oldPublicId?: string }
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (opts?.folder) formData.append("folder", opts.folder);
  if (opts?.oldPublicId) formData.append("oldPublicId", opts.oldPublicId);

  const res = await fetch("/api/upload-image", { method: "POST", body: formData });

  if (!res.ok) {
    try {
      const err = (await res.json()) as Partial<UploadImageResponse>;
      throw new Error(err.message || "Upload failed");
    } catch {
      throw new Error("Upload failed");
    }
  }

  const data = (await res.json()) as UploadImageResponse;
  if (!data.url) throw new Error("Upload failed: missing URL");
  return data;
}