import * as React from "react";
import Image from "next/image";


export type BookingStatus = "waiting" | "in_service" | "success";
export type BookingLayout = "wide" | "compact";
export type ActionKey = "message" | "call" | "change" | "review" | "report";


export interface BookingAction {
  key: ActionKey;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BookingCardProps {
  layout?: BookingLayout;
  status: BookingStatus;
  title: string;
  sitterName: string;
  avatarUrl?: string;
  transactionDate: string;
  dateTime: string;
  duration: string;
  pet: string;
  note?: string;
  successDate?: string;
  actions?: BookingAction[];
  className?: string;
}


const ICON_PATHS = {
  calendar:
    "M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-3h14a2 2 0 0 1 2 2v1H3V7a2 2 0 0 1 2-2Z",
  clock:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V7h-2v7h6v-2h-4Z",
  paw: "M12 13c3 0 6 1.7 6 4v2H6v-2c0-2.3 3-4 6-4Zm-5.2-6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm10.4 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM9.5 3.5A2 2 0 1 1 7.5 6a2 2 0 0 1 2-2.5Zm5 0A2 2 0 1 1 12.5 6a2 2 0 0 1 2-2.5Z",
  phone:
    "M6.62 10.79a15 15 0 0 0 6.59 6.59l2.20-2.20a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
} as const;

const STATUS_CONFIG = {
  waiting: {
    dot: "bg-pink",
    text: "text-pink",
    label: "Waiting for confirm",
    bg: "bg-pink-bg",
  },
  in_service: {
    dot: "bg-blue",
    text: "text-blue",
    label: "In service",
    bg: "bg-blue-bg",
  },
  success: {
    dot: "bg-green",
    text: "text-green",
    label: "Success",
    bg: "bg-green-bg",
  },
} as const;

const STYLES = {
  card: {
    base:
      "group rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md hover:ring-1 ring-brand",
    desktop: "w-full p-6",
    mobile: "w-[375px] p-5",
  },
  button: {
    primary:
      "h-12 rounded-full bg-brand text-[16px] font-bold text-brand-text hover:brightness-95 hover:shadow-md transition disabled:opacity-50 cursor-pointer px-8",
    call:
      "grid h-12 w-12 place-items-center rounded-full hover:ring-2 hover:ring-brand transition cursor-pointer",
    ghost:
      "inline-flex h-8 items-center gap-1 rounded-full px-3 text-[14px] font-medium text-orange-6 bg-white/0 hover:bg-orange-1/20 hover:shadow-sm transition disabled:opacity-50 cursor-pointer",
    report:
      "text-[16px] font-bold leading-[24px] text-orange-6 hover:opacity-80 transition cursor-pointer",
  },
  text: {
    title: "text-[16px] font-bold text-ink",
    subtitle: "text-[12px] text-muted-text",
    label: "text-[14px] font-medium text-muted-text",
    value: "text-[16px] font-medium leading-[24px] text-ink",
    transaction: "text-[12px] text-muted-text",
  },
  divider: "h-px bg-border",
  separator: "h-10 w-px bg-border/60",
} as const;



const parseDateTime = (dateTime: string) => {
  const [left, right] = dateTime.split("|").map((part) => part.trim());
  return { left, right };
};

const useActionsLookup = (actions?: BookingAction[]) =>
  React.useMemo(() => {
    const map = new Map<ActionKey, BookingAction>();
    actions?.forEach((a) => map.set(a.key, a));
    return {
      get: (k: ActionKey) => map.get(k),
      message: map.get("message"),
      call: map.get("call"),
      change: map.get("change"),
      review: map.get("review"),
      report: map.get("report"),
    };
  }, [actions]);


const Icon: React.FC<{ path: string; className?: string }> = React.memo(
  ({ path, className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
);
Icon.displayName = "Icon";


const Avatar: React.FC<{ src: string; alt: string; size: number; showRing?: boolean }> = React.memo(
  ({ src, alt, size, showRing = true }) => (
    <div
      className={`relative overflow-hidden rounded-full ${showRing ? "ring-1 ring-border" : ""}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} width={size} height={size} className="object-cover" />
    </div>
  )
);
Avatar.displayName = "Avatar";

const StatusBadge: React.FC<{ status: BookingStatus }> = React.memo(({ status }) => {
  const config = STATUS_CONFIG[status];
  return (
    <div className={`inline-flex items-center gap-2 text-[12px] ${config.text}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </div>
  );
});
StatusBadge.displayName = "StatusBadge";

const FormattedDateTime: React.FC<{ dateTime: string }> = React.memo(({ dateTime }) => {
  const { left, right } = React.useMemo(() => parseDateTime(dateTime), [dateTime]);
  return (
    <span className="text-ink">
      {left}
      {right && <span className="px-2 text-muted-text">|</span>}
      {right}
    </span>
  );
});
FormattedDateTime.displayName = "FormattedDateTime";

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = React.memo(
  ({ label, children }) => (
    <div>
      <div className={STYLES.text.label}>{label}</div>
      <div className={`mt-1 ${STYLES.text.value}`}>{children}</div>
    </div>
  )
);
InfoField.displayName = "InfoField";

const CallButton: React.FC<{ onClick: () => void; disabled?: boolean; strong?: boolean }> = React.memo(
  ({ onClick, disabled, strong }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Call"
      className={`${STYLES.button.call} ${strong ? "bg-orange-1 text-orange-6" : "bg-orange-1/60 text-orange-6"} disabled:opacity-50`}
    >
      <Icon path={ICON_PATHS.phone} className="h-5 w-5" />
    </button>
  )
);
CallButton.displayName = "CallButton";

const ChangeButton: React.FC<{ onClick: () => void; label?: string; disabled?: boolean }> = React.memo(
  ({ onClick, label = "Change", disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled} className={STYLES.button.ghost}>
      <Icon path={ICON_PATHS.edit} className="h-4 w-4" />
      {label}
    </button>
  )
);
ChangeButton.displayName = "ChangeButton";

const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string }> =
  React.memo(({ onClick, children, disabled, className = "" }) => (
    <button type="button" onClick={onClick} disabled={disabled} className={`${STYLES.button.primary} ${className}`}>
      {children}
    </button>
  ));
PrimaryButton.displayName = "PrimaryButton";


const WaitingSection: React.FC<{
  note?: string;
  actions: BookingAction[];
  isDesktop: boolean;
  status?: BookingStatus;
}> = React.memo(({ note, actions, isDesktop, status = "waiting" }) => {
  const cfg = STATUS_CONFIG[status];
  const { message: messageAction, call: callAction } = useActionsLookup(actions);

  if (!note && !messageAction && !callAction) return null;

  return (
    <div className={`mt-6 rounded-xl p-4 ring-1 ring-border ${cfg.bg}`}>
      <div className={`flex items-center ${isDesktop ? "" : "flex-col gap-3"}`}>
        {note && (
          <div className={`text-[14px] font-medium leading-[22px] text-muted-text ${isDesktop ? "grow" : ""}`}>
            {note}
          </div>
        )}
        <div className="flex items-center gap-3">
          {messageAction && (
            <PrimaryButton onClick={messageAction.onClick} disabled={messageAction.disabled} className={isDesktop ? "" : "px-6 text-[14px]"}>
              {messageAction.label || "Send Message"}
            </PrimaryButton>
          )}
          {callAction && <CallButton onClick={callAction.onClick} disabled={callAction.disabled} strong />}
        </div>
      </div>
    </div>
  );
});
WaitingSection.displayName = "WaitingSection";

const SuccessSection: React.FC<{ successDate: string; actions: BookingAction[]; isDesktop: boolean }> = React.memo(
  ({ successDate, actions, isDesktop }) => {
    const { report: reportAction, review: reviewAction, call: callAction } = useActionsLookup(actions);

    return (
      <div className="mt-6 rounded-xl p-4 ring-1 ring-green/60 bg-green-bg">
        <div className={`flex items-center ${isDesktop ? "" : "flex-col gap-3"}`}>
          <div className={isDesktop ? "grow" : ""}>
            <div className="text-[14px] font-medium leading-[24px] text-green">Success date:</div>
            <div className="text-[14px] font-medium leading-[24px] text-green">{successDate}</div>
          </div>
          <div className="flex items-center gap-6">
            {reportAction && (
              <button onClick={reportAction.onClick} disabled={reportAction.disabled} className={STYLES.button.report}>
                {reportAction.label || "Report"}
              </button>
            )}
            {reviewAction && <PrimaryButton onClick={reviewAction.onClick} disabled={reviewAction.disabled}>{reviewAction.label || "Review"}</PrimaryButton>}
            {callAction && <CallButton onClick={callAction.onClick} disabled={callAction.disabled} strong />}
          </div>
        </div>
      </div>
    );
  }
);
SuccessSection.displayName = "SuccessSection";


const DesktopLayout: React.FC<BookingCardProps> = React.memo((props) => {
  const {
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
  } = props;

  const { change: changeAction } = useActionsLookup(actions);

  return (
    <div className={`${STYLES.card.base} ${STYLES.card.desktop} ${className}`}>
      <div className="flex items-start gap-3">
        {avatarUrl && <Avatar src={avatarUrl} alt={sitterName} size={64} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`truncate ${STYLES.text.title}`}>{title}</h3>
              <p className={`truncate ${STYLES.text.subtitle}`}>By {sitterName}</p>
            </div>
            <div className="text-right">
              <div className={STYLES.text.transaction}>Transaction date: {transactionDate}</div>
              <div className="mt-1">
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>
      </div>

  
      <div className={`my-5 ${STYLES.divider}`} />

  
      <div className="flex items-start">
        <div className="flex-1 pr-6">
          <div className="flex items-center justify-between">
            <div className={STYLES.text.label}>Date &amp; Time:</div>
            {status === "waiting" && changeAction && (
              <ChangeButton onClick={changeAction.onClick} label={changeAction.label} disabled={changeAction.disabled} />
            )}
          </div>
          <div className={`mt-1 ${STYLES.text.value}`}>
            <FormattedDateTime dateTime={dateTime} />
          </div>
        </div>

        <div className={`mx-6 ${STYLES.separator}`} />

        <div className="flex-1 pr-6">
          <InfoField label="Duration:">{duration}</InfoField>
        </div>

        <div className={`mx-6 ${STYLES.separator}`} />

        <div className="flex-1">
          <InfoField label="Pet:">{pet}</InfoField>
        </div>
      </div>

 
      {(status === "waiting" || status === "in_service") && (
        <WaitingSection note={note} actions={actions} isDesktop={true} status={status} />
      )}

      {status === "success" && successDate && <SuccessSection successDate={successDate} actions={actions} isDesktop={true} />}
    </div>
  );
});
DesktopLayout.displayName = "DesktopLayout";

const MobileLayout: React.FC<BookingCardProps> = React.memo((props) => {
  const {
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
  } = props;

  const { change: changeAction } = useActionsLookup(actions);

  return (
    <div className={`${STYLES.card.base} ${STYLES.card.mobile} ${className}`}>
      <div className="flex flex-col gap-3">
        {/* Avatar + Title */}
        <div className="flex gap-3">
          {avatarUrl && <Avatar src={avatarUrl} alt={sitterName} size={36} />}
          <div className="flex flex-col">
            <div className="truncate text-[18px] leading-[24px] font-bold text-ink">{title}</div>
            <div className="truncate text-[14px] leading-[22px] font-medium text-ink">By {sitterName}</div>
          </div>
        </div>


        <div>
          <div className={STYLES.text.transaction}>Transaction date: {transactionDate}</div>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>

          <div className={`mt-3 ${STYLES.divider}`} />


          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[14px] font-medium leading-[22px] text-muted-text">
                  <Icon path={ICON_PATHS.calendar} className="h-4 w-4 text-muted-text" />
                  Date &amp; Time:
                </div>
                {status === "waiting" && changeAction && (
                  <ChangeButton onClick={changeAction.onClick} label={changeAction.label} disabled={changeAction.disabled} />
                )}
              </div>
              <div className="mt-1 text-[16px] font-medium leading-[28px] text-ink">
                <FormattedDateTime dateTime={dateTime} />
              </div>
            </div>

            <InfoField label="Duration:">{duration}</InfoField>
            <InfoField label="Pet:">{pet}</InfoField>
          </div>
        </div>
      </div>


      {(status === "waiting" || status === "in_service") && (
        <WaitingSection note={note} actions={actions} isDesktop={false} status={status} />
      )}

      {status === "success" && successDate && <SuccessSection successDate={successDate} actions={actions} isDesktop={false} />}
    </div>
  );
});
MobileLayout.displayName = "MobileLayout";


export const BookingCard: React.FC<BookingCardProps> = React.memo((props) => {
  const { layout = "wide" } = props;
  const isDesktop = layout === "wide";
  return isDesktop ? <DesktopLayout {...props} /> : <MobileLayout {...props} />;
});
BookingCard.displayName = "BookingCard";

export default BookingCard;