import * as React from "react";
import Image from "next/image";

export type BookingStatus = "waiting" | "in_service" | "success" | "canceled";
export type BookingLayout = "wide" | "compact";
export type ActionKey = "message" | "call" | "change" | "review" | "report";

export interface BookingAction {
  key: ActionKey;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface BookingCardProps {
  id: number;
  layout?: BookingLayout;
  status: BookingStatus;
  title: string;
  sitterName: string;
  avatarUrl?: string;
  transactionDate: string;
  dateTime: string; // "Tue, 25 Aug 2023 | 7 AM - 10 AM"
  duration: string;
  pet: string;
  successDate?: string;
  canceledReason?: string;
  className?: string;
  onReport?: () => void;
  onReview?: () => void;
}

/* ---------- Icons ---------- */
const ICON_PATHS = {
  calendar:
    "M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-3h14a2 2 0 0 1 2 2v1H3V7a2 2 0 0 1 2-2Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V7h-2v7h6v-2h-4Z",
  paw: "M12 13c3 0 6 1.7 6 4v2H6v-2c0-2.3 3-4 6-4Zm-5.2-6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm10.4 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM9.5 3.5A2 2 0 1 1 7.5 6a2 2 0 0 1 2-2.5Zm5 0A2 2 0 1 1 12.5 6a2 2 0 0 1 2-2.5Z",
  phone:
    "M6.62 10.79a15 15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z",
  edit:
    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z",
} as const;

/* ---------- Config ---------- */
const STATUS_CONFIG = {
  waiting: {
    dot: "bg-pink",
    text: "text-pink",
    label: "Waiting for confirm",
    bg: "bg-gray-1",
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
  canceled: {
    dot: "bg-red",
    text: "text-red",
    label: "Canceled",
    bg: "bg-red-bg",
  },
} as const;

const STATUS_NOTES: Record<BookingStatus, string | undefined> = {
  waiting: "Waiting Pet Sitter for confirm booking",
  in_service: "Your pet is already in Pet Sitter care!",
  success: undefined,
  canceled: "This booking has been canceled.",
};

const STATUS_ACTIONS: Record<BookingStatus, ActionKey[]> = {
  waiting: ["message", "call", "change"],
  in_service: ["message", "call"],
  success: ["review", "report", "call"],
  canceled: ["report", "message"], // ✅ Report + Message
};

const STYLES = {
  card: {
    base: "group rounded-2xl border border-gray-2 bg-white shadow-sm transition-colors duration-200 ease-out hover:shadow-lg hover:ring-1 hover:ring-orange-400 hover:bg-orange-1/15",
    desktop: "w-full p-6",
    mobile: "w-[375px] p-5",
  },
  button: {
    primary:
      "h-12 rounded-full bg-brand text-[16px] font-bold text-brand-text hover:brightness-95 hover:shadow-md transition px-8 cursor-pointer",
    call: "grid h-12 w-12 place-items-center rounded-full hover:ring-2 hover:ring-brand transition cursor-pointer",
    ghost:
      "inline-flex h-4 items-center gap-1 rounded-full px-2 text-[14px] font-medium text-orange-5 hover:text-orange-6 cursor-pointer",
    report:
      "text-[16px] font-bold leading-[24px] text-orange-5 hover:opacity-80 cursor-pointer",
  },
  text: {
    title: "text-[24px] font-bold text-ink",
    subtitle: "text-[18px] text-ink",
    label: "text-[14px] font-medium text-muted-text",
    value: "text-[16px] font-medium leading-[24px] text-gray-9",
    transaction: "text-[14px] text-muted-text",
  },
  divider: "h-px bg-border",
  separator: "h-10 w-px bg-border/60",
} as const;

/* ---------- Helpers ---------- */
const buildActions = (status: BookingStatus): BookingAction[] =>
  STATUS_ACTIONS[status].map((key) => ({
    key,
    onClick: () => console.log(`${key} clicked`),
  }));

/* ---------- UI Atoms ---------- */
const Icon: React.FC<{ path: string; className?: string }> = ({
  path,
  className = "h-4 w-4",
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d={path} />
  </svg>
);

const Avatar: React.FC<{ src: string; alt: string; size: number }> = ({
  src,
  alt,
  size,
}) => (
  <div
    className="relative overflow-hidden rounded-full ring-1 ring-border"
    style={{ width: size, height: size }}
  >
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="object-cover"
    />
  </div>
);

const CallButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className={`${STYLES.button.call} bg-orange-1 text-orange-6`}
  >
    <Icon path={ICON_PATHS.phone} className="h-5 w-5" />
  </button>
);

const ChangeButton: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = "Change",
}) => (
  <button onClick={onClick} className={STYLES.button.ghost}>
    <Icon path={ICON_PATHS.edit} className="h-4 w-4" />
    {label}
  </button>
);

const PrimaryButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button onClick={onClick} className={STYLES.button.primary}>
    {children}
  </button>
);

/* ---------- Common UI ---------- */
const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={`inline-flex items-center gap-2 text-[16px] font-semibold ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </div>
  );
};

const FormattedDateTime: React.FC<{ dateTime: string }> = ({ dateTime }) => {
  const [left, right] = dateTime.split("|").map((p) => p.trim());
  return (
    <span className="whitespace-nowrap">
      {left}
      {right && <span className="px-2 text-muted-text">|</span>}
      {right}
    </span>
  );
};

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div>
    <div className={STYLES.text.label}>{label}</div>
    <div className={`mt-1 ${STYLES.text.value}`}>{children}</div>
  </div>
);

/* ---------- Layouts ---------- */
const DesktopLayout: React.FC<BookingCardProps> = (props) => {
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
    className = "",
  } = props;
  const actions = buildActions(status);

  return (
    <div className={`${STYLES.card.base} ${STYLES.card.desktop} ${className}`}>
      <div className="flex items-start gap-3">
        {avatarUrl && <Avatar src={avatarUrl} alt={sitterName} size={64} />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`truncate ${STYLES.text.title}`}>{title}</h3>
              <p className={`truncate ${STYLES.text.subtitle}`}>
                By {sitterName}
              </p>
            </div>
            <div className="text-right">
              <div className={STYLES.text.transaction}>
                Transaction date: {transactionDate}
              </div>
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
            {status === "waiting" && <ChangeButton onClick={() => {}} />}
          </div>
          <div className={`mt-1 ${STYLES.text.value} whitespace-nowrap`}>
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

      {/* Waiting */}
      {status === "waiting" && (
        <div
          className={`mt-6 rounded-xl p-4 ring-1 ring-border ${STATUS_CONFIG[status].bg}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-muted-text">
              {STATUS_NOTES[status]}
            </div>
            <div className="flex gap-3">
              <PrimaryButton onClick={actions[0].onClick}>
                Send Message
              </PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {/* In Service */}
      {status === "in_service" && (
        <div
          className={`mt-6 rounded-xl p-4 ring-1 ring-border ${STATUS_CONFIG[status].bg}`}
        >
          <div className="flex items-center justify-between">
            <div className="text-[14px] text-muted-text">
              {STATUS_NOTES[status]}
            </div>
            <div className="flex gap-3">
              <PrimaryButton onClick={actions[0].onClick}>
                Send Message
              </PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {status === "success" && successDate && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-green/60 bg-green-bg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] text-muted-text">
                {/* system note (optional) */}
                {/* You can put STATUS_NOTES.success here if needed */}
              </div>
              <div className="text-[14px] text-green">Success date:</div>
              <div className="text-[14px] text-green">{successDate}</div>
            </div>
            <div className="flex gap-4">
              <button className={STYLES.button.report} onClick={props.onReport}>Report</button>
              <PrimaryButton onClick={props.onReview ?? (() => {})}>Review</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Canceled */}
      {status === "canceled" && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-border bg-red-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[14px] font-medium leading-[22px] text-red-500">
                {STATUS_NOTES.canceled}
              </div>
              {canceledReason && (
                <div className="text-[14px] font-medium leading-[22px] mt-1 text-gray-6">
                  Reason: {canceledReason}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button className={STYLES.button.report} onClick={props.onReport} >Report</button>
              <PrimaryButton onClick={() => {}}>Send Message</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileLayout: React.FC<BookingCardProps> = (props) => {
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
    className = "",
  } = props;
  const actions = buildActions(status);

  return (
    <div className={`${STYLES.card.base} ${STYLES.card.mobile} ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          {avatarUrl && <Avatar src={avatarUrl} alt={sitterName} size={36} />}
          <div className="flex flex-col">
            <div className="truncate text-[18px] font-bold text-ink">
              {title}
            </div>
            <div className="truncate text-[14px] text-ink">By {sitterName}</div>
          </div>
        </div>

        <div>
          <div className={STYLES.text.transaction}>
            Transaction date: {transactionDate}
          </div>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>

          <div className={`mt-3 ${STYLES.divider}`} />

          <div className="mt-4 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-[14px] font-medium text-muted-text">
                  <Icon path={ICON_PATHS.calendar} className="h-4 w-4" />
                  Date &amp; Time:
                </div>
                {status === "waiting" && <ChangeButton onClick={() => {}} />}
              </div>
              <div className="mt-1 text-[16px] font-medium text-ink whitespace-nowrap">
                <FormattedDateTime dateTime={dateTime} />
              </div>
            </div>

            <InfoField label="Duration:">{duration}</InfoField>
            <InfoField label="Pet:">{pet}</InfoField>
          </div>
        </div>
      </div>

      {/* Waiting */}
      {status === "waiting" && (
        <div
          className={`mt-6 rounded-xl p-4 ring-1 ring-border ${STATUS_CONFIG[status].bg}`}
        >
          <div className="flex flex-col gap-3">
            <div className="text-[14px] text-muted-text">
              {STATUS_NOTES[status]}
            </div>
            <div className="flex gap-3">
              <PrimaryButton onClick={actions[0].onClick}>
                Send Message
              </PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {/* In Service */}
      {status === "in_service" && (
        <div
          className={`mt-6 rounded-xl p-4 ring-1 ring-border ${STATUS_CONFIG[status].bg}`}
        >
          <div className="flex flex-col gap-3">
            <div className="text-[14px] text-muted-text">
              {STATUS_NOTES[status]}
            </div>
            <div className="flex gap-3">
              <PrimaryButton onClick={actions[0].onClick}>
                Send Message
              </PrimaryButton>
              <CallButton onClick={actions[1].onClick} />
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {status === "success" && successDate && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-green/60 bg-green-bg">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[14px] text-green">Success date:</div>
              <div className="text-[14px] text-green">{successDate}</div>
            </div>
            <div className="flex gap-4">
              <button className={STYLES.button.report} onClick={props.onReport} >Report</button>
              <PrimaryButton onClick={() => {}}>Review</PrimaryButton>
              <CallButton onClick={() => {}} />
            </div>
          </div>
        </div>
      )}

      {/* Canceled */}
      {status === "canceled" && (
        <div className="mt-6 rounded-xl p-4 ring-1 ring-border bg-red-100">
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[14px] font-medium leading-[22px] text-gray-5">
                {STATUS_NOTES.canceled}
              </div>
              {canceledReason && (
                <div className="text-[14px] font-medium leading-[22px] mt-1 text-red">
                  Reason: {canceledReason}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button className={STYLES.button.report} onClick={props.onReport} >Report</button>
              <PrimaryButton onClick={() => {}}>Send Message</PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Root ---------- */
export const BookingCard: React.FC<BookingCardProps> = (props) => {
  const { layout = "wide" } = props;
  return layout === "wide" ? (
    <DesktopLayout {...props} />
  ) : (
    <MobileLayout {...props} />
  );
};

export default BookingCard;
