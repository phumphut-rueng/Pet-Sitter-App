import * as React from "react";

export type Status = "waiting" | "in_service" | "success";
export type Layout = "wide" | "compact";
type ActionKey = "message" | "call" | "change" | "review" | "report";

export interface Action {
  key: ActionKey;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BookingCardProps {
  /** wide = Desktop, compact = Mobile */
  layout?: Layout;
  status: Status;
  title: string;
  sitterName: string;
  avatarUrl?: string;
  transactionDate: string;
  dateTime: string;
  duration: string;
  pet: string;
  /** ใช้กับ waiting / in_service */
  note?: string;
  /** ใช้กับ success */
  successDate?: string;
  actions?: Action[];
  className?: string;
}

const Icon = ({ d, className = "h-4 w-4" }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d={d} />
  </svg>
);

const icons = {
  calendar:
    "M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-3h14a2 2 0 0 1 2 2v1H3V7a2 2 0 0 1 2-2Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V7h-2v7h6v-2h-4Z",
  paw: "M12 13c3 0 6 1.7 6 4v2H6v-2c0-2.3 3-4 6-4Zm-5.2-6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm10.4 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM9.5 3.5A2 2 0 1 1 7.5 6a2 2 0 0 1 2-2.5Zm5 0A2 2 0 1 1 12.5 6a2 2 0 0 1 2-2.5Z",
  phone:
    "M6.62 10.79a15 15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z",
  edit:
    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
};

const statusTokens = {
  waiting: { dot: "bg-pink", text: "text-pink", label: "Waiting for confirm" },
  in_service: { dot: "bg-blue", text: "text-blue", label: "In service" },
  success: { dot: "bg-green", text: "text-green", label: "Success" },
} as const;

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[14px] font-medium leading-[22px] text-muted-text">{label}</div>
    <div className="mt-1 text-[16px] font-medium leading-[24px] text-ink">{children}</div>
  </div>
);

const CallButton: React.FC<{ onClick: () => void; disabled?: boolean; strong?: boolean }> = ({
  onClick,
  disabled,
  strong,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Call"
    className={`grid h-12 w-12 place-items-center rounded-full ${
      strong ? "bg-orange-1 text-orange-6" : "bg-orange-1/60 text-orange-6"
    } disabled:opacity-50 hover:ring-2 hover:ring-orange-3 transition cursor-pointer`}
  >
    <Icon d={icons.phone} className="h-5 w-5" />
  </button>
);

const GhostChangeBtn: React.FC<{ onClick: () => void; label?: string; disabled?: boolean }> = ({
  onClick,
  label = "Change",
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[14px] font-medium text-orange-6 bg-white/0 hover:bg-orange-1/20 hover:shadow-sm transition disabled:opacity-50 cursor-pointer"
  >
    <Icon d={icons.edit} className="h-4 w-4" />
    {label}
  </button>
);

const OrangeBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className, children, ...rest }) => (
  <button
    {...rest}
    className={`h-12 rounded-full bg-brand px-8 text-[16px] font-bold text-white hover:brightness-95 hover:shadow-md transition disabled:opacity-50 cursor-pointer ${className || ""}`}
  >
    {children}
  </button>
);

const splitDateTime = (s: string) => {
  const [left, right] = s.split("|").map((v) => v.trim());
  return { left, right };
};

const renderDateTime = (s: string) => {
  const { left, right } = splitDateTime(s);
  return (
    <span className="text-ink">
      {left}
      {right && <span className="px-2 text-muted-text">|</span>}
      {right}
    </span>
  );
};

const pick = (actions: Action[] | undefined, key: ActionKey) => actions?.find((a) => a.key === key);

export const BookingCard: React.FC<BookingCardProps> = ({
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
  className = "",
}) => {
  const isDesktop = layout === "wide";
  const tok = statusTokens[status];

  const actMessage = pick(actions, "message");
  const actChange = pick(actions, "change");
  const actReport = pick(actions, "report");
  const actReview = pick(actions, "review");
  const actCall = pick(actions, "call");

  /* ------------- DESKTOP ------------- */
  if (isDesktop) {
    return (
      <div
        className={`group w-full rounded-2xl border border-border bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-blue-300 ${className}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-1 ring-border" // 64x64
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[16px] font-bold text-ink">{title}</h3>
                <p className="truncate text-[12px] text-muted-text">By {sitterName}</p>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-muted-text">Transaction date: {transactionDate}</div>
                <div className={`mt-1 inline-flex items-center gap-2 text-[12px] ${tok.text}`}>
                  <span className={`h-2 w-2 rounded-full ${tok.dot}`} />
                  {tok.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-border" />

        <div className="flex items-start">

          <div className="flex-1 pr-6">
            <div className="flex items-center justify-between">
              <div className="text-[14px] font-medium text-muted-text">Date &amp; Time:</div>
              {status === "waiting" && actChange && (
                <GhostChangeBtn
                  onClick={actChange.onClick}
                  label={actChange.label || "Change"}
                  disabled={actChange.disabled}
                />
              )}
            </div>
            <div className="mt-1 text-[16px] leading-[24px] text-ink">{renderDateTime(dateTime)}</div>
          </div>

          <div className="mx-6 h-10 w-px bg-border/60" />


          <div className="flex-1 pr-6">
            <Field label="Duration:">{duration}</Field>
          </div>

          <div className="mx-6 h-10 w-px bg-border/60" />

          <div className="flex-1">
            <Field label="Pet:">{pet}</Field>
          </div>
        </div>


        {(status === "waiting" || status === "in_service") && (
          <div className="mt-6 rounded-xl bg-[#F6F6F9] p-4 ring-1 ring-border">
            <div className="flex items-center">
              <div className="grow text-[14px] font-medium leading-[22px] text-muted-text">{note}</div>
              <div className="flex items-center gap-3">
                {actMessage && <OrangeBtn onClick={actMessage.onClick} disabled={actMessage.disabled}> {actMessage.label || "Send Message"} </OrangeBtn>}
                {actCall && <CallButton onClick={actCall.onClick} disabled={actCall.disabled} strong />}
              </div>
            </div>
          </div>
        )}

        {status === "success" && successDate && (
          <div className="mt-6 rounded-xl bg-[#E9FFF6] p-4 ring-1 ring-green/60">
            <div className="flex items-center">
              <div className="grow">
                <div className="text-[14px] font-medium leading-[24px] text-green">Success date:</div>
                <div className="text-[14px] font-medium leading-[24px] text-green">{successDate}</div>
              </div>
              <div className="flex items-center gap-6">
                {actReport && (
                  <button
                    onClick={actReport.onClick}
                    disabled={actReport.disabled}
                    className="text-[16px] font-bold leading-[24px] text-orange-6 hover:opacity-80 transition cursor-pointer"
                  >
                    {actReport.label || "Report"}
                  </button>
                )}
                {actReview && <OrangeBtn onClick={actReview.onClick} disabled={actReview.disabled}>{actReview.label || "Review"}</OrangeBtn>}
                {actCall && <CallButton onClick={actCall.onClick} disabled={actCall.disabled} strong />}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------- MOBILE ------------- */
  return (
    <div className={`group w-[375px] rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-blue-300 ${className}`}>
      <div className="flex flex-col gap-3">
        {/* Avatar + Title */}
        <div className="flex gap-3">
          {avatarUrl && <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-border" />}
          <div className="flex flex-col">
            <div className="truncate text-[18px] leading-[24px] font-bold text-ink">{title}</div>
            <div className="truncate text-[14px] leading-[22px] font-medium text-ink">By {sitterName}</div>
          </div>
        </div>


        <div>
          <div className="text-[14px] font-medium text-muted-text">Transaction date: {transactionDate}</div>
          <div className={`mt-1 inline-flex items-center gap-2 text-[16px] leading-[24px] font-medium ${tok.text}`}>
            <span className={`h-2 w-2 rounded-full ${tok.dot}`} />
            {tok.label}
          </div>


          <div className="mt-3 h-px bg-border" />

          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[14px] font-medium leading-[22px] text-muted-text">
                  <Icon d={icons.calendar} className="h-4 w-4 text-muted-text" />
                  Date &amp; Time:
                </div>
                {status === "waiting" && actChange && (
                  <GhostChangeBtn onClick={actChange.onClick} label={actChange.label || "Change"} disabled={actChange.disabled} />
                )}
              </div>
              <div className="mt-1 text-[16px] font-medium leading-[28px] text-ink">{renderDateTime(dateTime)}</div>
            </div>

            <Field label="Duration:">{duration}</Field>
            <Field label="Pet:">{pet}</Field>
          </div>
        </div>
      </div>


      {(status === "waiting" || status === "in_service") && (
        <div className="mx-auto mt-4 w-full rounded-xl bg-[#F6F6F9] p-4 ring-1 ring-border">
          <div className="text-[14px] font-medium leading-[22px] text-muted-text">{note}</div>
          <div className="mt-3 flex items-center">
            <div className="flex items-center gap-2">
              {actMessage && (
                <OrangeBtn onClick={actMessage.onClick} disabled={actMessage.disabled} className="px-6 text-[14px]">
                  {actMessage.label || "Send Message"}
                </OrangeBtn>
              )}
              
            </div>
            {actCall && <CallButton onClick={actCall.onClick} disabled={actCall.disabled} strong />}
          </div>
        </div>
      )}


      {status === "success" && successDate && (
        <div className="mx-auto mt-4 w-full rounded-xl bg-[#E9FFF6] p-4 ring-1 ring-green/60">
          <div className="text-[14px] font-medium leading-[24px] text-green">Success date:</div>
          <div className="text-[14px] font-medium leading-[24px] text-green">{successDate}</div>

          <div className="mt-3 flex items-center">
            <div className="flex items-center gap-6">
              {actReport && (
                <button
                  onClick={actReport.onClick}
                  disabled={actReport.disabled}
                  className="text-[16px] font-bold leading-[24px] text-orange-6 hover:opacity-80 transition cursor-pointer"
                >
                  {actReport.label || "Report"}
                </button>
              )}
              {actReview && <OrangeBtn onClick={actReview.onClick} disabled={actReview.disabled}>{actReview.label || "Review"}</OrangeBtn>}
            </div>
            {actCall && <CallButton onClick={actCall.onClick} disabled={actCall.disabled} strong />}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;