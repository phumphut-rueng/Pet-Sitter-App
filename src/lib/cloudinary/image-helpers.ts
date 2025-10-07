export const isHttpUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);
export const isDataUrl = (s?: string) => !!s && /^data:image\/[a-zA-Z]+;base64,/.test(s);

export async function dataUrlToFile(dataUrl: string, filename = "upload.png"): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}