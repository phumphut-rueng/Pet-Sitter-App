import axios, { AxiosError } from "axios";
import { extractPublicId } from "./client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type UploadApiResponse = {
  message?: string;
  data?: {
    public_id?: string;
    url?: string;
  };
  public_id?: string;
  url?: string;
};

export type UploadOptions = { 
  folder?: string; 
  signal?: AbortSignal; 
  timeoutMs?: number;
};

export type UploadResult = { 
  public_id: string; 
  url?: string;
};

/**
 * อัปโหลดรูปแล้วคืน public_id (Cloudinary)
 * รองรับทั้ง response แบบใหม่ { message, data: { ... } } และแบบเดิม { public_id, url }
 */
export async function uploadAndGetPublicId(
  file: File | Blob,
  folder = "owner-profile",
  opts: UploadOptions = {}
): Promise<UploadResult> {
  // ตรวจชนิดไฟล์
  if (!(file instanceof Blob)) {
    throw new Error("Invalid file");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  // Setup timeout
  const { signal: outerSignal, timeoutMs = 60_000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);

  // เชื่อม signal ภายนอก
  if (outerSignal) {
    if (outerSignal.aborted) {
      controller.abort(outerSignal.reason);
    }
    outerSignal.addEventListener(
      "abort",
      () => controller.abort(outerSignal.reason),
      { once: true }
    );
  }

  try {
    const response = await axios.post<UploadApiResponse>(
      `${API_BASE}/api/upload-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
        signal: controller.signal,
        timeout: timeoutMs,
      }
    );

    const payload = response.data;

    // รองรับทั้งสองรูปแบบ response
    let public_id: string | undefined;
    let url: string | undefined;

    // รูปแบบใหม่: { message, data: { public_id, url } }
    if (payload.data) {
      public_id = payload.data.public_id;
      url = payload.data.url;
    } 
    // รูปแบบเก่า: { public_id, url }
    else {
      public_id = payload.public_id;
      url = payload.url;
    }

    //  ถ้าไม่มี public_id แต่มี url ดึงจาก url
    public_id = public_id ?? extractPublicId(url);

    if (!public_id) {
      throw new Error("Upload succeeded but missing public_id");
    }

    return { public_id, url };
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      
      // ดึง message จาก response
      const message = 
        axiosError.response?.data?.message || 
        axiosError.message || 
        "Upload failed";
      
      throw new Error(message);
    }

    // Handle other errors
    const message = 
      error instanceof Error ? error.message : "Upload failed";
    throw new Error(message);
  } finally {
    clearTimeout(timer);
  }
}