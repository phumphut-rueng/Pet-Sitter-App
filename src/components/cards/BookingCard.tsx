//ยังไม่เสร็จ
import { FC, ReactNode } from "react";

type Status = "waiting" | "in_service" | "success";
type Layout = "wide" | "compact";

interface Action {
  key: "message" | "call" | "change" | "review" | "report";
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

interface BookingCardProps {
  layout?: Layout;
  status: Status;
  title: string;
  sitterName: string;
  avatarUrl?: string;
  transactionDate: string;
  dateTime: string;
  duration: string;
  pet: string;
  note?: string;
  successDate?: string;
  actions?: Action[];
  className?: string;
}

// Icons
const CalendarIcon: FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-3h14a2 2 0 0 1 2 2v1H3V7a2 2 0 0 1 2-2Z" />
  </svg>
);

const ClockIcon: FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V7h-2v7h6v-2h-4Z" />
  </svg>
);

const PawIcon: FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 13c3 0 6 1.7 6 4v2H6v-2c0-2.3 3-4 6-4Zm-5.2-6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm10.4 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM9.5 3.5A2 2 0 1 1 7.5 6a2 2 0 0 1 2-2.5Zm5 0A2 2 0 1 1 12.5 6a2 2 0 0 1 2-2.5Z" />
  </svg>
);

const PhoneIcon: FC<{ className?: string }> = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M6.62 10.79a15 15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z" />
  </svg>
);

// Util
const statusConfig = {
  waiting: {
    dot: "bg-pink",
    text: "text-pink", 
    border: "border-orange-2",
    label: "Waiting for confirm",
    successBox: undefined
  },
  in_service: {
    dot: "bg-blue",
    text: "text-blue",
    border: undefined,
    label: "In service",
    successBox: undefined
  },
  success: {
    dot: "bg-green",
    text: "text-green",
    border: undefined,
    successBox: "bg-green-bg ring-green text-green",
    label: "Success"
  }
} as const;

const actionLabels = {
  message: "Send Message",
  call: "Call", 
  change: "Change",
  review: "Your Review",
  report: "Report"
} as const;

// Components
const InfoField: FC<{ icon: ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-border">
    <div className="flex items-center gap-2 text-[12px] text-muted-text">
      {icon}
      {label}
    </div>
    <div className="text-[12px] text-ink">{value}</div>
  </div>
);

const Button: FC<{ 
  children: ReactNode; 
  onClick: () => void; 
  disabled?: boolean;
  variant?: "primary" | "secondary";
}> = ({ children, onClick, disabled = false, variant = "primary" }) => {
  const baseClasses = "inline-flex h-10 items-center rounded-full px-4 text-[12px] font-medium select-none transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-4";
  
  const variantClasses = variant === "primary" 
    ? "bg-brand text-brand-text hover:brightness-95"
    : "bg-white ring-1 ring-border text-ink hover:bg-muted/40";
    
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "cursor-pointer active:scale-[.98]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses}`}
    >
      {children}
    </button>
  );
};

const ChipButton: FC<{ children: ReactNode; onClick: () => void; disabled?: boolean }> = ({ 
  children, 
  onClick, 
  disabled = false 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-full px-5 h-10 text-[12px] font-medium transition ${
      disabled 
        ? "opacity-50 cursor-not-allowed pointer-events-none" 
        : "bg-orange-1 text-orange-6 hover:brightness-95 cursor-pointer"
    }`}
  >
    {children}
  </button>
);

const IconButton: FC<{ children: ReactNode; onClick: () => void; disabled?: boolean }> = ({ 
  children, 
  onClick, 
  disabled = false 
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`grid h-9 w-9 place-items-center rounded-full transition ${
      disabled 
        ? "bg-orange-1/60 text-orange-6/60 cursor-not-allowed pointer-events-none" 
        : "bg-orange-1 text-orange-6 hover:brightness-95 cursor-pointer"
    }`}
  >
    {children}
  </button>
);

// Main Compo
export const BookingCard: FC<BookingCardProps> = ({
  layout = "wide",
  status,
  title,
  sitterName,
  avatarUrl,
  transactionDate,
  dateTime,
  duration,
  pet,
  note,
  successDate,
  actions = [],
  className = ""
}) => {
  const config = statusConfig[status];
  const isWide = layout === "wide";
  
  const reviewAction = actions.find(a => a.key === "review");
  const reportAction = actions.find(a => a.key === "report");
  const callAction = actions.find(a => a.key === "call");
  
  const otherActions = actions.filter(a => !["review", "report"].includes(a.key));

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${config.border || "border-border"} ${className}`}>
      <div className="flex items-start gap-3">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={`${sitterName} avatar`} 
            className="h-10 w-10 rounded-full object-cover ring-1 ring-border" 
          />
        )}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-semibold text-ink">{title}</h3>
              <p className="text-[12px] text-muted-text">By {sitterName}</p>
            </div>

            <div className="text-right">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] ${config.text}`}>
                <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                {config.label}
              </div>
              <p className="mt-1 text-[11px] text-muted-text">Transaction date: {transactionDate}</p>
            </div>
          </div>


          <div className={`mt-3 grid gap-2 ${isWide ? "grid-cols-3" : "grid-cols-1"}`}>
            <InfoField icon={<CalendarIcon />} label="Date & Time:" value={dateTime} />
            <InfoField icon={<ClockIcon />} label="Duration:" value={duration} />
            <InfoField icon={<PawIcon />} label="Pet:" value={pet} />
          </div>


          {status === "waiting" && note && (
            <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-[12px] text-muted-text ring-1 ring-border">
              {note}
            </div>
          )}


          {status === "success" && successDate && (
            <div className={`mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-[12px] ring-1 ${config.successBox || ""}`}>
              <span>Success date: {successDate}</span>
              <div className="flex items-center gap-3">
                {reportAction && (
                  <button
                    type="button"
                    onClick={reportAction.onClick}
                    className="text-[12px] font-medium text-orange-6 hover:underline cursor-pointer"
                  >
                    {reportAction.label || actionLabels.report}
                  </button>
                )}
                
                {reviewAction && (
                  <ChipButton onClick={reviewAction.onClick} disabled={reviewAction.disabled}>
                    {reviewAction.label || actionLabels.review}
                  </ChipButton>
                )}
                
                {callAction && (
                  <IconButton onClick={callAction.onClick} disabled={callAction.disabled}>
                    <PhoneIcon />
                  </IconButton>
                )}
              </div>
            </div>
          )}


          {otherActions.length > 0 && status !== "success" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {otherActions.map(action => (
                <Button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  variant={action.key === "message" ? "primary" : "secondary"}
                >
                  {action.label || actionLabels[action.key]}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;