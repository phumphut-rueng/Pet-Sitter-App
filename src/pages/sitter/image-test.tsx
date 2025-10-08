import { useState } from "react";
import AvatarUploader from "@/components/form/AvatarUpload";
import ImageGallery from "@/components/form/ImageGalleryUpload";
import { uploadToCloudinary } from "@/lib/cloudinary/upload-to-cloudinary";

export default function UploadExamplePage() {
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-6">
      {/* Profile Image Upload */}
      <div>
        <h2 className="text-xl font-bold mb-2">Profile Image Upload</h2>
        <AvatarUploader
          imageUrl={profileImageUrl}
          onChange={async (file) => {
            if (file) {
              const url = await uploadToCloudinary(file);
              setProfileImageUrl(url);
            }
          }}
        />
      </div>

      {/* Image Gallery Upload */}
      <div>
        <h2 className="text-xl font-bold mb-2">Gallery Image Upload</h2>
        <ImageGallery
          initialImageUrls={galleryUrls}
          onChange={async (state) => {
            const uploadedUrls: string[] = [];
            for (const file of state.newImageFiles) {
              const url = await uploadToCloudinary(file);
              uploadedUrls.push(url);
            }
            setGalleryUrls([...state.existingImageUrls, ...uploadedUrls]);
          }}
        />
      </div>
    </div>
  );
}