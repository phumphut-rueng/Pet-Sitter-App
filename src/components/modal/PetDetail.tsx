import React from "react";

type PetDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  petName: string;
  petType?: string;
  sex?: string;
  color?: string;
  about?: string;
  breed?: string;
  age?: string;
  weight?: string;
  avatarUrl?: string;
};

export default function PetDetailModal({
  isOpen,
  onClose,
  petName,
  petType,
  sex,
  color,
  about,
  breed,
  age,
  weight,
  avatarUrl,
}: PetDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-2 flex items-center justify-center z-50">
      <div className="w-150 bg-white rounded-xl shadow-lg py-6 relative">
        <div className="border-b border-gray-2 px-8">
          {/* ปุ่มปิด */}
          <button
            onClick={onClose}
            className="absolute top-5 right-8 text-gray-9 hover:text-gray-4 text-2xl"
          >
            ✕
          </button>

          {/* ชื่อหัว */}
          <h2 className="text-2xl font-bold mb-4">{petName}</h2>
        </div>

        {/* เนื้อหา */}
        <div className="flex items-start justify-between gap-7 px-8 mt-7">
          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <img
              src={avatarUrl}
              alt={petName}
              className="w-42 h-42 rounded-full object-cover"
            />
            <p className="text-black font-semibold">{petName}</p>
          </div>

          {/* รายละเอียด */}
          <div className="flex bg-gray-1 rounded-xl pl-6 pr-10 py-6 gap-16">
            <div className="flex flex-col gap-6">
            <div>
              <p className="text-gray-4 text-xl font-bold">Pet Type</p>
              <p className="text-black">{petType}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Sex</p>
              <p className="text-black">{sex}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Color</p>
              <p className="text-black">{color}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">About</p>
              <p className="text-black">{about}</p>
            </div>
            </div>
            <div className="flex flex-col gap-6">
            <div>
              <p className="text-gray-4 text-xl font-bold">Breed</p>
              <p className="text-black">{breed}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Age</p>
              <p className="text-black">{age}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Weight</p>
              <p className="text-black">{weight}</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
