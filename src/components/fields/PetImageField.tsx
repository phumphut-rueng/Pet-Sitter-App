import * as React from "react";
import AvatarUploader from "@/components/form/AvatarUpload";
import { PET_FORM_STYLES } from "../features/pet/pet-form.config";

type PetImageFieldProps = {
  imageUrl: string;
  onChange: (file: File | null) => void;
};

export const PetImageField: React.FC<PetImageFieldProps> = ({ imageUrl, onChange }) => {
  return (
    <div className={`${PET_FORM_STYLES.imageContainer} cursor-pointer`}>
      <label className={`${PET_FORM_STYLES.imageLabel} cursor-pointer`}>Pet Image</label>
      <div className="inline-block cursor-pointer [&_button]:cursor-pointer [&_button]:outline-none">
        <AvatarUploader
          imageUrl={imageUrl}
          onChange={onChange}
          diameterPx={176}
          priority={true}
        />
      </div>
    </div>
  );
};