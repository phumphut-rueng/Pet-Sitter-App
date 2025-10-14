import AlertConfirm from "@/components/modal/AlertConfirm";
import type {
  BookingCardProps,
  BookingStatus,
} from "@/components/cards/ATestBookingCard";

const STATUS_CONFIG = {
  waiting: { dot: "bg-pink", text: "text-pink", label: "Waiting for confirm" },
  in_service: { dot: "bg-blue", text: "text-blue", label: "In service" },
  success: { dot: "bg-green", text: "text-green", label: "Success" },
  canceled: { dot: "bg-red", text: "text-red", label: "Canceled" },
} as const;

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
  booking:
    | (BookingCardProps & { totalTHB?: number; transactionNo?: string })
    | null;
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
      maxWidth="95vw"
      title="Booking Detail"
      description={
        <div className="px-5 md:px-8 pt-3 pb-4 text-[15px] md:text-[16px] font-medium w-full max-w-full mx-auto overflow-x-hidden">
          {/* Status */}
          <div
            className={`mb-4 md:mb-6 ${statusCfg.text} text-[15px] md:text-[16px] font-medium`}
          >
            <span
              className={`mr-2 inline-block h-2 w-2 rounded-full ${statusCfg.dot}`}
            />
            {statusCfg.label}
          </div>

          {/* Transaction Info */}
          <div className="mb-5 md:mb-6 text-[14px] md:text-[16px] leading-5 font-medium text-gray-4">
            <div>Transaction date: {booking.transactionDate}</div>
            <div>Transaction No.: {booking.transactionNo ?? "—"}</div>
          </div>

          {/* Pet Sitter */}
          <Section label="Pet Sitter:">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              <div className="text-gray-9 text-[15px] min-w-0 md:truncate">
                {booking.title} <span className="text-gray-9">By</span>{" "}
                {booking.sitterName}
              </div>
              <button
                className="flex items-center gap-1 text-[14px] md:text-[16px] font-medium text-orange-5 hover:text-orange-6"
                onClick={onViewMap}
              >
                <Icon d={ICONS.mapPin} className="h-4 w-4" />
                View Map
              </button>
            </div>
          </Section>

          {/* Date & Time */}
          <Section label="Date & Time:">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              <div className="text-gray-9 text-[15px] md:text-[16px] break-words">
                {booking.dateTime}
              </div>
              {booking.status === "waiting" && (
                <button
                  onClick={onChangeDateTime}
                  className="flex items-center gap-1 text-[14px] md:text-[16px] font-medium text-orange-5 hover:text-orange-6"
                >
                  <Icon d={ICONS.edit} className="h-4 w-4" />
                  Change
                </button>
              )}
            </div>
          </Section>

          {/* Duration */}
          <Section label="Duration:">
            <div className="text-gray-9 text-[15px] md:text-[16px]">
              {booking.duration}
            </div>
          </Section>

          {/* Pet */}
          <Section label="Pet:">
            <div className="text-gray-9 text-[15px] md:text-[16px]">
              {booking.pet}
            </div>
          </Section>

          {/* Divider + Total */}
          <div className="mt-5 md:mt-6 border-t border-gray-2 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] md:text-[16px] font-medium text-black">
                Total
              </span>
              {typeof booking.totalTHB === "number" ? (
                <span className="text-[15px] md:text-[16px] font-bold text-gray-9">
                  {booking.totalTHB.toLocaleString()} THB
                </span>
              ) : (
                <span className="text-[16px] font-bold text-ink">— THB</span>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 md:mb-5">
      <div className="mb-1 text-[13px] md:text-[14px] font-medium text-gray-6">
        {label}
      </div>
      {children}
    </div>
  );
}
