//เดะมีแก้อีก
import * as React from "react";

export type Status = "waiting" | "in_service" | "success";
export type Layout = "wide" | "compact";

type ActionKey = "message" | "call" | "change" | "review" | "report";
type Action = {
  key: ActionKey;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export interface BookingCardProps {
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


const ICal = (cls = "h-4 w-4") => (
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
    <path d="M7 2h2v3H7V2Zm8 0h2v3h-2V2ZM3 8h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Zm2-3h14a2 2 0 0 1 2 2v1H3V7a2 2 0 0 1 2-2Z" />
  </svg>
);
const IClock = (cls = "h-4 w-4") => (
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10V7h-2v7h6v-2h-4Z" />
  </svg>
);
const IPaw = (cls = "h-4 w-4") => (
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
    <path d="M12 13c3 0 6 1.7 6 4v2H6v-2c0-2.3 3-4 6-4Zm-5.2-6.6a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Zm10.4 0a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM9.5 3.5A2 2 0 1 1 7.5 6a2 2 0 0 1 2-2.5Zm5 0A2 2 0 1 1 12.5 6a2 2 0 0 1 2-2.5Z" />
  </svg>
);
const IPhone = (cls = "h-4 w-4") => (
  <svg viewBox="0 0 24 24" className={cls} fill="currentColor">
    <path d="M6.62 10.79a15 15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.07 22 2 13.93 2 3a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z" />
  </svg>
);


type StatusUI = {
  dot: string;
  text: string;
  capsuleBg: string;         
  border?: string;         
  successBox?: string;       
  successText?: string;   
};

const STATUS: Record<Status, StatusUI> = {
  waiting: {
    dot: "bg-pink",
    text: "text-pink",
    border: "border-orange-200",
    capsuleBg: ""
  },
  
  in_service: {
    dot: "bg-indigo-500",
    text: "text-indigo-600",
    capsuleBg: ""
  },
  success: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    capsuleBg: "",
    successBox: "bg-emerald-50 ring-emerald-200",
    successText: "text-emerald-700",
  },
};


const Field = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-[#DCDFED]">
    <div className="flex items-center gap-2 text-[12px] text-gray-500">
      {icon}
      {label}
    </div>
    <div className="text-[12px] text-[#323640]">{value}</div>
  </div>
);

const Cta = ({
  children,
  onClick,
  disabled,
  variant = "brand",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "brand" | "muted";
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      "inline-flex items-center rounded-full px-4 py-2 text-[12px] font-medium",
      variant === "brand"
        ? "bg-orange-500 text-white hover:brightness-95"
        : "bg-white ring-1 ring-[#DCDFED] text-[#323640]",
      "disabled:opacity-50 disabled:pointer-events-none",
    ].join(" ")}
  >
    {children}
  </button>
);


const ActionChip = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="rounded-full bg-orange-1 px-5 py-2 text-[12px] font-medium text-orange-6 hover:brightness-95"
  >
    {children}
  </button>
);


const IconChip = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="grid h-9 w-9 place-items-center rounded-full bg-orange-1 text-orange-6"
  >
    {children}
  </button>
);


const BookingCard = (p: BookingCardProps) => {
  const st = STATUS[p.status];
  const layout = p.layout ?? "wide";
  const isWide = layout === "wide";

  return (
    <div
      className={[
        "rounded-2xl border bg-white p-5 shadow-sm",
        st.border ?? "border-[#DCDFED]",
        p.className || "",
      ].join(" ")}
    >

      <div className="flex items-start gap-3">
        {p.avatarUrl && (
          <img
            src={p.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-1 ring-[#DCDFED]"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[16px] font-semibold text-[#323640]">
                {p.title}
              </div>
              <div className="text-[12px] text-gray-500">By {p.sitterName}</div>
            </div>


            <div className="text-right">
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px]",
                  st.capsuleBg,
                  st.text,
                ].join(" ")}
              >
                <span className={["h-2 w-2 rounded-full", st.dot].join(" ")} />
                {p.status === "waiting" ? "Waiting for confirm" :
                 p.status === "in_service" ? "In service" : "Success"}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                Transaction date: {p.transactionDate}
              </div>
            </div>
          </div>


          <div
            className={`mt-3 grid ${
              isWide ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-1"
            } gap-2`}
          >
            <Field icon={ICal()} label="Date & Time:" value={p.dateTime} />
            <Field icon={IClock()} label="Duration:" value={p.duration} />
            <Field icon={IPaw()} label="Pet:" value={p.pet} />
          </div>

          {p.status === "waiting" && p.note && (
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[12px] text-gray-600 ring-1 ring-[#DCDFED]">
              {p.note}
            </div>
          )}

          {p.status === "success" && p.successDate && (
            <div
              className={[
                "mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-[12px] ring-1",
                st.successBox ?? "bg-emerald-50 ring-emerald-200",
              ].join(" ")}
            >
              <span className={st.successText ?? "text-emerald-700"}>
                Success date: {p.successDate}
              </span>

              <div className="flex items-center gap-3">

                {p.actions?.some(a => a.key === "report") && (
                  <button
                    onClick={p.actions?.find(a => a.key === "report")?.onClick}
                    className="text-[12px] font-medium text-orange-6"
                  >
                    {p.actions?.find(a => a.key === "report")?.label ?? "Report"}
                  </button>
                )}

                {p.actions?.some(a => a.key === "review") && (
                  <ActionChip onClick={p.actions?.find(a => a.key === "review")?.onClick}>
                    {p.actions?.find(a => a.key === "review")?.label ?? "Your Review"}
                  </ActionChip>
                )}

                {p.actions?.some(a => a.key === "call") && (
                  <IconChip onClick={p.actions?.find(a => a.key === "call")?.onClick}>
                    {IPhone("h-4 w-4")}
                  </IconChip>
                )}
              </div>
            </div>
          )}


          {!!p.actions?.length && p.status !== "success" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {p.actions
                ?.filter(a => a.key !== "review" && a.key !== "report")
                .map(a => (
                  <Cta
                    key={a.key}
                    onClick={a.onClick}
                    disabled={a.disabled}
                    variant={a.key === "message" ? "brand" : "muted"}
                  >
                    {a.label ??
                      ({
                        message: "Send Message",
                        call: "Call",
                        change: "Change",
                        review: "Review",
                        report: "Report",
                      } as Record<ActionKey, string>)[a.key]}
                  </Cta>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;