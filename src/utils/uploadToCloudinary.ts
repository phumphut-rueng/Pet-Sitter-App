export async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url as string;
  }
  