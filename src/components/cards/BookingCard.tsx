import * as React from "react";
import Image from "next/image";

export type BookingStatus = "waiting" |  "waiting_for_service" | "in_service" | "success" | "canceled";
export type ActionKey = "message" | "call" | "change" | "review" | "report";

export interface BookingAction {
  key: ActionKey;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BookingCardProps {
  id: number;
  status: BookingStatus;
  title: string;
  sitterName: string;
  avatarUrl?: string;
  transactionDate: string;
  dateTime: string;
  duration: string;
  pet: string;
  successDate?: string;
  canceledReason?: string;
  className?: string;
  sitterId?: number | null;       // ใช้ส่งไปรีวิว (table sitter.id)
  sitterUserId?: number | null;   // ใช้ส่ง report (table user.id ของ sitter)
  onReport?: () => void;
  onReview?: () => void;
  onChange?: () => void;
  onMessage?: () => void;
  dateStart?: string; 
  dateEnd?: string
  sitterLat?: number;
  sitterLng?: number;
  hasUserReview?: boolean;
  userReview?: {
    rating: number;
    comment: string;
    date: string;
  };
}

/* ---------- Icons ---------- */
const ICON_PATHS = {
  phone:
    "M6.62 10.79a15 15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z",
  edit:
    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
} as const;

/* ---------- Config ---------- */
const STATUS_CONFIG = {
  waiting: { dot: "bg-pink", text: "text-pink", label: "Waiting for Confirm", bg: "bg-pink-50" },
  waiting_for_service: { dot: "bg-yellow", text: "text-yellow", label: "Waiting for Service", bg: "bg-yellow-50" },
  in_service: { dot: "bg-blue", text: "text-blue", label: "In Service", bg: "bg-blue-bg" },
  success: { dot: "bg-green", text: "text-green", label: "Success", bg: "bg-green-bg" },
  canceled: { dot: "bg-red", text: "text-red", label: "Canceled", bg: "bg-red-bg" },
} as const;

const STATUS_NOTES: Record<BookingStatus, string | undefined> = {
  waiting: "Waiting Pet Sitter for confirm booking",
  waiting_for_service: "Payment received. Waiting for the service date.",
  in_service: "Your pet is already in Pet Sitter care!",
  success: undefined,
  canceled: "This booking has been canceled.",
};

const STATUS_ACTIONS: Record<BookingStatus, ActionKey[]> = {
  waiting: ["message", "call", "change"],
  waiting_for_service: ["message", "call", "change"],
  in_service: ["message", "call"],
  success: ["review", "report", "call"],
  canceled: ["report", "message"],
};

/* ---------- Atoms ---------- */
const Avatar: React.FC<{ src?: string; alt: string; size?: number }> = ({ src, alt, size = 64 }) => (
  <div
    className="relative overflow-hidden rounded-full ring-1 ring-border flex-shrink-0"
    style={{ width: size, height: size }}
  >
    {src ? (
      <Image src={src} alt={alt} width={size} height={size} className="object-cover" />
    ) : (
      <div className="bg-gray-200 w-full h-full" />
    )}
  </div>
);

const Icon: React.FC<{ path: string; className?: string }> = ({
  path,
  className = "h-4 w-4",
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const ChangeButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 text-[14px] font-medium text-orange-5 hover:text-orange-6"
  >
    <Icon path={ICON_PATHS.edit} className="h-4 w-4" />
    Change
  </button>
);

const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className="h-12 rounded-full bg-orange-5 text-white text-[16px] font-bold px-8 hover:brightness-95 hover:shadow-md transition"
  >
    {children}
  </button>
);

const CallButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="grid h-12 w-12 place-items-center rounded-full bg-orange-1 text-orange-6 hover:ring-2 hover:ring-orange-4 transition"
  >
    <Icon path={ICON_PATHS.phone} className="h-5 w-5" />
  </button>
);

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={`inline-flex items-center gap-2 text-[14px] md:text-[16px] font-semibold ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </div>
  );
};

const FormattedDateTime: React.FC<{ dateTime: string }> = ({ dateTime }) => {
  const [left, right] = dateTime.split("|").map((p) => p.trim());
  return (
    <span className="whitespace-normal break-words md:whitespace-nowrap">
      {left}
      {right && <span className="px-2 text-gray-500">|</span>}
      {right}
    </span>
  );
};

/* ---------- Main Layout ---------- */
export const BookingCard: React.FC<BookingCardProps> = (props) => {
  const {
    status,
    title,
    sitterName,
    avatarUrl,
    transactionDate,
    dateTime,
    duration,
    pet,
    successDate,
    canceledReason,
    onChange,
    onReport,
    onReview,
    className = "",
  } = props;

  const actions = STATUS_ACTIONS[status].map((key) => ({ key, onClick: () => console.log(`${key} clicked`) }));
  const cfg = STATUS_CONFIG[status];

  function truncateText(text: string, maxLength: number) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  return (
    <div
      className={`group rounded-2xl border border-gray-2 bg-white shadow-sm hover:shadow-lg hover:ring-1 hover:ring-orange-400 hover:bg-orange-1/10 w-full max-w-[375px] md:max-w-none p-5 md:p-6 mx-auto ${className}`}
    >
      {/* ---------- Header ---------- */}
      <div className="flex items-start gap-3 md:gap-4">
        {avatarUrl && <Avatar src={avatarUrl} alt={sitterName} size={64} />}

        <div className="flex-1 min-w-0">
          {/* Title + sitter */}
          <h3 className="text-[18px] md:text-[24px] font-bold text-ink" title={title}>
  {truncateText(title, 30)}
</h3>
<p
  className="text-[14px] md:text-[18px] text-ink"
  title={sitterName} // hover แล้วจะเห็นชื่อเต็ม
>
  By {truncateText(sitterName, 20)}
</p>

          {/* ✅ Mobile: transaction + status under name */}
          <div className="mt-2 md:hidden">
            <p className="text-[13px] text-gray-500">Transaction date: {transactionDate}</p>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        {/* ✅ Desktop: right aligned */}
        <div className="hidden md:block text-right">
          <p className="text-[14px] text-gray-500">Transaction date: {transactionDate}</p>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 md:my-5 h-px bg-gray-2" />

      {/* ---------- Info Section ---------- */}
      <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-0">
        {/* Date & Time */}
        <div className="flex-1 md:pr-6">
          <div className="flex flex-wrap items-center justify-between gap-y-1">
            <p className="text-[14px] font-medium text-gray-6">Date &amp; Time:</p>
            {(status === "waiting" || status === "waiting_for_service") && <ChangeButton onClick={onChange ?? (() => {})} />}
          </div>
          <p className="mt-1 text-[15px] md:text-[16px] font-medium text-gray-9 break-words">
            <FormattedDateTime dateTime={dateTime} />
          </p>
        </div>

        <div className="hidden md:block mx-6 h-10 w-px bg-border/60" />

        {/* Duration */}
        <div className="flex-1 md:pr-6">
          <p className="text-[14px] font-medium text-gray-6">Duration:</p>
          <p className="text-[16px] font-medium text-gray-9 mt-1">{duration}</p>
        </div>

        <div className="hidden md:block mx-6 h-10 w-px bg-border/60" />

        {/* Pet */}
        <div className="flex-1">
          <p className="text-[14px] font-medium text-gray-6">Pet:</p>
          <p className="text-[16px] font-medium text-gray-9 mt-1">{pet}</p>
        </div>
      </div>

      {/* ---------- Footer (Status Section) ---------- */}
      {status === "waiting" && (
        <div className={`mt-6 rounded-xl p-4 ring-1 ring-border ${cfg.bg}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[13px] md:text-[14px] text-pink text-center md:text-left">
              {STATUS_NOTES.waiting}
            </p>
            <div className="flex justify-center md:justify-end gap-3">
              <PrimaryButton onClick={props.onMessage ?? (() => {})}>Send Message</PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {/* 💗 Waiting for service */}
{status === "waiting_for_service" && (
  <div className={`mt-6 rounded-xl p-4 ring-1 ring-border ${cfg.bg}`}>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <p className="text-[13px] md:text-[14px] text-yellow text-center md:text-left">
        {STATUS_NOTES.waiting_for_service}
      </p>
      <div className="flex justify-center md:justify-end gap-3">
        <PrimaryButton onClick={props.onMessage ?? (() => {})}>Send Message</PrimaryButton>
        <CallButton onClick={actions[1].onClick} />
      </div>
    </div>
  </div>
)}

      {status === "in_service" && (
        <div className={`mt-6 rounded-xl p-4 ring-1 ring-border ${cfg.bg}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-[13px] md:text-[14px] text-blue text-center md:text-left">
              {STATUS_NOTES.in_service}
            </p>
            <div className="flex justify-center md:justify-end gap-3">
              <PrimaryButton onClick={props.onMessage ?? (() => {})}>Send Message</PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {status === "success" && successDate && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-green/60 bg-green-bg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-[14px] text-green">Success date:</p>
              <p className="text-[14px] text-green">{successDate}</p>
            </div>
            <div className="flex justify-center md:justify-end gap-4">
              <button
                className="text-[16px] font-bold text-orange-5 hover:opacity-80"
                onClick={onReport}
              >
                Report
              </button>
              <PrimaryButton onClick={onReview ?? (() => {})}>
          {props.hasUserReview ? "Your Review" : "Review"}
        </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {status === "canceled" && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-border bg-red-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium leading-[22px] text-red-500">
                {STATUS_NOTES.canceled}
              </p>
              {canceledReason && (
                <p className="text-[14px] font-medium leading-[22px] mt-1 text-gray-6">
                  Reason: {canceledReason}
                </p>
              )}
            </div>
            <div className="flex justify-center md:justify-end gap-4">
              <button
                className="text-[15px] font-semibold text-orange-5 hover:opacity-80"
                onClick={onReport}
              >
                Report
              </button>
              <PrimaryButton onClick={props.onMessage ?? (() => {})}>Send Message</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
