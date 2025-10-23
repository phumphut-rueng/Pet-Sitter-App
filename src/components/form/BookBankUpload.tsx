import { useEffect, useRef, useState } from "react";
import Image, { ImageLoaderProps } from "next/image";

export type BookBankState = {
  existingImageUrl?: string | null;
  newImageFile?: File | null;
};

type BookBankUploadProps = {
  initialImageUrl?: string | null;
  onChange?: (state: BookBankState) => void;
};

const ACCEPTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_IMAGE_SIZE_MB = 2;
const passThroughLoader = ({ src }: ImageLoaderProps) => src;

export default function BookBankUpload({
  initialImageUrl = null,
  onChange,
}: BookBankUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    onChange?.({
      existingImageUrl: previewUrl && !file ? previewUrl : undefined,
      newImageFile: file || undefined,
    });
  }, [previewUrl, file, onChange]);

  useEffect(() => {
    setPreviewUrl(initialImageUrl);
  }, [initialImageUrl]);

  const openFilePicker = () => fileInputRef.current?.click();

  const validateFile = (file: File) => {
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

  const handleFileChange = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const selected = fileList[0];
    if (!validateFile(selected)) return;

    const objectUrl = URL.createObjectURL(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setPreviewUrl(objectUrl);
    setFile(selected);
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
  };

  return (
    <div className="relative w-full max-w-[420px] h-[420px] bg-gray-1 rounded-xl flex items-center justify-center overflow-hidden">
      {/* 📘 Preview Area */}
      <div className="w-80 aspect-[3/4] flex items-center justify-center relative overflow-hidden">
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Book Bank Preview"
              fill
              className="object-contain"
              unoptimized
              loader={passThroughLoader}
            />
            {/* ปุ่มลบ */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-3 right-4 bg-gray-6 text-white w-7 h-7 rounded-full text-lg grid place-items-center hover:bg-gray-7"
              title="Remove image"
            >
              ×
            </button>
          </>
        ) : (
          <p className="text-gray-5 text-sm">No image uploaded</p>
        )}
      </div>
      
      <button
        type="button"
        onClick={openFilePicker}
        className="absolute bottom-4 right-4 bg-orange-1 hover:bg-orange-2 w-10 h-10 rounded-full flex items-center justify-center text-orange-5 text-2xl font-semibold shadow-sm"
      >
        +
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files)}
      />
    </div>
  );
}