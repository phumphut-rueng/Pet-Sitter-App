import { useEffect, useRef, useState } from "react";
import Image, { ImageLoaderProps } from "next/image";

export type GalleryState = {
  existingImageUrls: string[]; // URL เดิมที่คงไว้
  newImageFiles: File[]; // ไฟล์ใหม่ที่ต้องอัปโหลด
};

type ImageGalleryProps = {
  initialImageUrls?: string[];
  onChange?: (state: GalleryState) => void;
  maximumItems?: number;
};

const ACCEPTED_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_IMAGE_SIZE_MB = 2;
const passThroughLoader = ({ src }: ImageLoaderProps) => src;

type GalleryItem =
  | { id: string; kind: "existingUrl"; displayUrl: string }
  | { id: string; kind: "newFile"; displayUrl: string; file: File };

export default function ImageGallery({
  initialImageUrls = [],
  onChange,
  maximumItems = 10,
}: ImageGalleryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>(
    initialImageUrls.map((url) => ({
      id: crypto.randomUUID(),
      kind: "existingUrl",
      displayUrl: url,
    }))
  );

  useEffect(() => {
    onChange?.({
      existingImageUrls: items
        .filter((i) => i.kind === "existingUrl")
        .map((i) => i.displayUrl),
      newImageFiles: items.flatMap((i) =>
        i.kind === "newFile" ? [i.file] : []
      ),
    });
  }, [items, onChange]);

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

  const addSelectedFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newItems: GalleryItem[] = [];
    for (const file of Array.from(fileList)) {
      if (!validateImageFile(file)) return;
      const objectUrl = URL.createObjectURL(file);
      newItems.push({
        id: crypto.randomUUID(),
        kind: "newFile",
        displayUrl: objectUrl,
        file,
      });
    }

    if (items.length + newItems.length > maximumItems) {
      alert(`You can upload up to ${maximumItems} images only.`);
      newItems.forEach((i) => URL.revokeObjectURL(i.displayUrl));
      return;
    }

    setItems((previous) => [...previous, ...newItems]);
  };

  const removeItem = (id: string) => {
    setItems((previous) => {
      const removed = previous.find((i) => i.id === id);
      if (removed && removed.kind === "newFile") {
        URL.revokeObjectURL(removed.displayUrl);
      }
      return previous.filter((i) => i.id !== id);
    });
  };

  useEffect(() => {
    return () => {
      items.forEach(
        (i) => i.kind === "newFile" && URL.revokeObjectURL(i.displayUrl)
      );
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={openFilePicker}
          className="w-42 h-42 rounded-md bg-orange-1 text-orange-5
                     grid place-items-center hover:bg-orange-2 transition"
          title="Upload image"
        >
          <div className="grid place-items-center gap-4">
            <Image
              src="/icons/upload-image.svg"
              alt="Upload"
              width={40}
              height={40}
              priority
            />
            <span className="font-semibold">Upload Image</span>
          </div>
        </button>

        {items.map((item) => (
          <div
            key={item.id}
            className="relative w-42 h-42 rounded-md overflow-visible bg-gray-2"
          >
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="absolute bottom-36 left-36 h-7 w-7 leading-none rounded-full bg-gray-6 text-white text-2xl grid z-10"
              title="delete image"
            >
              ×
            </button>
            <div className="absolute left-0 right-0 bottom-8 top-8 overflow-hidden">
            <Image
              src={item.displayUrl}
              alt="Preview"
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
              loader={passThroughLoader}
            />
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => addSelectedFiles(e.target.files)}
      />
    </div>
  );
}
