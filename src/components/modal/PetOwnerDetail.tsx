import React from "react";
import Image from "next/image";

type PetOwnerDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ownerName: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
};

export default function PetOwnerDetailModal({
  isOpen,
  onClose,
  ownerName,
  email,
  phone,
  idNumber,
  dateOfBirth,
  avatarUrl,
}: PetOwnerDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-2 flex items-center justify-center z-50">
      <div className="w-150 bg-white rounded-xl shadow-lg py-6 relative">
        <div className="border-b border-gray-2 px-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-8 text-gray-9 hover:text-gray-4 text-2xl"
          >
            ✕
          </button>

          <h2 className="text-2xl font-semibold mb-4">{ownerName}</h2>
        </div>

        <div className="flex items-start justify-between gap-7 px-8 mt-7">
          <div className="w-44 h-44 rounded-full overflow-hidden bg-gray-1 flex-shrink-0">
          <Image
              src={avatarUrl || "/images/default-pet-avatar.png"}
              alt={ownerName}
              width={168}
              height={168}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
              className="w-full h-full object-cover object-center rounded-full"
            />
          </div>
          <div className="flex-1 bg-gray-1 rounded-xl p-6 space-y-6">
            <div>
              <p className="text-gray-4 text-xl font-bold">Pet Owner Name</p>
              <p className="text-black">{ownerName}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Email</p>
              <p className="text-black">{email}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Phone</p>
              <p className="text-black">{phone}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">ID Number</p>
              <p className="text-black">{idNumber}</p>
            </div>
            <div>
              <p className="text-gray-4 text-xl font-bold">Date of Birth</p>
              <p className="text-black">{dateOfBirth}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
