import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import type {
  BookingCardProps,
} from "@/components/cards/BookingCard";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking:
    | (BookingCardProps & {
        totalTHB?: number;
        transactionNo?: string;
        ownerName?: string;
        pets?: number;
        petsDetail?: Array<{
          id: number;
          name: string;
          img?: string | null;
          species?: string;
        }>;
      })
    | null;
  onChangeDateTime?: () => void;
  onViewMap?: () => void;
}

export default function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  const formatTHB = (n: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {booking.ownerName}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <InfoRow label="Pet Owner Name" value={booking.ownerName} />
          <InfoRow label="Pet(s)" value={booking.pets} />

          <div>
            <p className="text-sm text-gray-500 mb-2">Pet Detail</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {booking.petsDetail?.map((pet) => (
                <div
                  key={pet.id}
                  className="flex flex-col items-center w-full sm:w-[40%] text-center p-4 border rounded-xl"
                >
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={pet.img || "/images/avatar-default.png"}
                      alt={pet.name}
                      className="object-cover"
                    />
                    <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold mt-2">{pet.name}</p>
                  {pet.species && (
                    <span className="mt-1 text-sm text-green-600 bg-green-100 border border-green-200 px-3 py-0.5 rounded-full">
                      {pet.species}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <InfoRow label="Duration" value={booking.duration} />
          <InfoRow label="Booking Date" value={booking.dateTime} />

          <div className="pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="font-bold text-lg">
                {typeof booking.totalTHB === "number"
                  ? formatTHB(booking.totalTHB)
                  : "— THB"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
