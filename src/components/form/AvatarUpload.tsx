import { useMemo, useRef, useState } from "react";
import Image, { ImageLoaderProps } from "next/image";

type AvatarUploaderProps = {
  imageUrl?: string; // รูปเดิมจากระบบ
  onChange?: (selectedFile: File | null) => void;
  diameterPx?: number;
};

const ACCEPTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_IMAGE_SIZE_MB = 2;
const passThroughLoader = ({ src }: ImageLoaderProps) => src;

export default function AvatarUploader({
  imageUrl,
  onChange,
  diameterPx = 176,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : imageUrl || ""),
    [selectedFile, imageUrl]
  );

  const openFilePicker = () => fileInputRef.current?.click();

  const validateImageFile = (file: File) => {
    if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
      alert("Only .jpg, .jpeg or .png files are supported.");
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert(`File size must not exceed ${MAX_IMAGE_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelected = (file?: File) => {
    if (!file) return;
    if (!validateImageFile(file)) return;
    setSelectedFile(file);
    onChange?.(file);
  };

  return (
    <div className="relative inline-block">
      <div
        style={{ width: diameterPx, height: diameterPx }}
        className="relative rounded-full bg-gray-2 overflow-hidden grid place-items-center"
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="avatar"
            fill
            sizes={`${diameterPx}px`}
            className="object-cover w-full h-full"
            unoptimized
            loader={passThroughLoader}
          />
        ) : (
          <Image
            src="/icons/avatar-placeholder.svg"
            alt="placeholder"
            width={Math.round(diameterPx / 2)}
            height={Math.round(diameterPx / 2)}
            priority
            className="w-20 h-20"
          />
        )}
      </div>

      <button
        type="button"
        onClick={openFilePicker}
        className="absolute -bottom-1 right-1 h-11 w-11 rounded-full bg-orange-1 hover:bg-orange-2 text-orange-5 text-2xl cursor-pointer"
        title="upload image"
      >
        +
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />
    </div>

    
  );
}
