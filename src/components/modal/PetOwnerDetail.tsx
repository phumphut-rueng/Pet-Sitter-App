import React from "react";

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
  email = "johnwick@mail.com",
  phone = "099 996 0734",
  idNumber = "1122 21 236 8654",
  dateOfBirth = "2 Sep 1964",
  avatarUrl = "/images/sitters/test3.svg",
}: PetOwnerDetailModalProps) {
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
        <h2 className="text-2xl font-bold mb-4">{ownerName}</h2>
        </div>

        {/* เนื้อหา */}
        <div className="flex items-start justify-between gap-7 px-8 mt-7">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={avatarUrl}
              alt={ownerName}
              className="w-42 h-42 rounded-full object-cover"
            />
          </div>

          {/* รายละเอียด */}
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
