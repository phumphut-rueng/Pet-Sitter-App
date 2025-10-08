import Image from "next/image";
import AlertConfirm from "@/components/modal/AlertConfirm";
import type { BookingCardProps, BookingStatus } from "@/components/cards/ATestBookingCard";

/** ใช้ config/สี/ข้อความให้ตรงกับการ์ดเดิม */
const STATUS_CONFIG = {
  waiting:  { dot: "bg-pink",  text: "text-pink",  label: "Waiting for confirm" },
  in_service:{ dot: "bg-blue", text: "text-blue", label: "In service" },
  success:  { dot: "bg-green", text: "text-green", label: "Success" },
  canceled: { dot: "bg-red",  text: "text-red",  label: "Canceled" },
} as const;

/** ไอคอนจากการ์ดเดิม (edit) + เพิ่ม map pin เล็กน้อย */
const ICONS = {
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
  mapPin:
    "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z",
};

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={d} />
    </svg>
  );
}

export interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** ส่ง booking ที่เลือกเข้ามา (อิง type เดิม) */
  booking: (BookingCardProps & { totalTHB?: number; transactionNo?: string }) | null;

  /** action เสริม */
  onChangeDateTime?: () => void;
  onViewMap?: () => void;
}

export default function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  onChangeDateTime,
  onViewMap,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  const statusCfg = STATUS_CONFIG[booking.status as BookingStatus];

  return (
    <AlertConfirm
      open={open}
      onOpenChange={onOpenChange}
      width={600}
      maxWidth="90vh"
      title="Booking Detail"
      description={
        <div className="px-8 pt-3 pb-4 text-[16px] font-medium">

          {/* สถานะ (ใช้สี/ข้อความตามการ์ดเดิม) */}
          <div className={`mb-6 ${statusCfg.text} text-[16px] font-medium`}>
            <span className={`mr-2 inline-block h-2 w-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </div>

          {/* ข้อมูลธุรกรรม (เทาอ่อน) */}
          <div className="mb-6 text-[16px] leading-5 font-medium text-gray-4">
            <div>Transaction date: {booking.transactionDate}</div>
            <div>Transaction No.: {booking.transactionNo ?? "—"}</div>
          </div>

          {/* Pet Sitter */}
          <Section label="Pet Sitter:">
            <div className="flex items-center justify-between gap-4">
              <div className="truncate text-gray-9">
                {booking.title} <span className="text-gray-9">By</span> {booking.sitterName}
              </div>

              {/* View Map */}
              <button
                className="flex shrink-0 items-center gap-2 text-[14px] font-semibold text-orange-5 hover:text-orange-6"
                onClick={onViewMap}
              >
                <Icon d={ICONS.mapPin} className="h-4 w-4" />
                View Map
              </button>
            </div>
          </Section>

          {/* Date & Time */}
          <Section label="Date & Time:">
            <div className="flex items-center justify-between gap-4">
              <div className="text-gray-9">{booking.dateTime}</div>

              {/* ปุ่ม Change แสดงเฉพาะ status=waiting เท่านั้น */}
              {booking.status === "waiting" && (
                <button
                  onClick={onChangeDateTime}
                  className="flex shrink-0 items-center gap-2 text-[14px] font-semibold text-orange-5 hover:text-orange-6"
                >
                  <Icon d={ICONS.edit} className="h-4 w-4" />
                  Change
                </button>
              )}
            </div>
          </Section>

          {/* Duration */}
          <Section label="Duration:">
            <div className="text-gray-9">{booking.duration}</div>
          </Section>

          {/* Pet */}
          <Section label="Pet:">
            <div className="text-gray-9">{booking.pet}</div>
          </Section>

          {/* เส้นคั่น & Total */}
          <div className="mt-6 border-t border-gray-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-medium text-black">Total</span>
              {typeof booking.totalTHB === "number" ? (
                <span className="text-[14px] font-bold text-gray-9">
                  {booking.totalTHB.toLocaleString()} THB
                </span>
              ) : (
                <span className="text-[18px] font-bold text-ink">— THB</span>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}

/** label เทาอ่อน + spacing ให้เหมือนภาพ */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-1 text-[14px] font-medium text-gray-6">{label}</div>
      {children}
    </div>
  );
}
