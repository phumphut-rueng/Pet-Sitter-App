import * as React from "react";

export type Status = "waiting" | "in_service" | "success";
export type Layout = "wide" | "compact";

type ActionKey = "message" | "call" | "change" | "review" | "report";
type Action = { key: ActionKey; label?: string; onClick?: () => void; disabled?: boolean };

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

type StatusUI = {
  label: string;
  pill: string;
  highlight?: string;
  successBg?: string;
};

const STATUS: Record<Status, StatusUI> = {
  waiting: {
    label: "Waiting for confirm",
    pill: "bg-orange-50 text-orange-600 border-orange-200",
    highlight: "border-orange-200",
  },
  in_service: {
    label: "In service",
    pill: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  success: {
    label: "Success",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    successBg: "bg-emerald-50 ring-emerald-200",
  },
};

const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-[#DCDFED]">
    <div className="flex items-center gap-2 text-gray-500 text-[12px]">
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
      variant === "brand" ? "bg-orange-500 text-white hover:brightness-95" : "bg-white ring-1 ring-[#DCDFED] text-[#323640]",
      "disabled:opacity-50 disabled:pointer-events-none",
    ].join(" ")}
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
        "rounded-2xl border bg-white shadow-sm",
        st.highlight ?? "border-[#DCDFED]",
        "p-5",
        p.className || "",
      ].join(" ")}
    >
      
      <div className="flex items-start gap-3">
        {p.avatarUrl && <img src={p.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-[#DCDFED]" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[16px] font-semibold text-[#323640] truncate">{p.title}</div>
              <div className="text-[12px] text-gray-500">By {p.sitterName}</div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] ${st.pill}`}>{st.label}</div>
              <div className="text-[11px] text-gray-500 mt-1">Transaction date: {p.transactionDate}</div>
            </div>
          </div>

         
          <div className={`mt-3 grid ${isWide ? "grid-cols-[1fr_1fr_1fr]" : "grid-cols-1"} gap-2`}>
            <Field icon={ICal()} label="Date & Time:" value={p.dateTime} />
            <Field icon={IClock()} label="Duration:" value={p.duration} />
            <Field icon={IPaw()} label="Pet:" value={p.pet} />
          </div>

       
          {p.note && <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-[12px] text-gray-600 ring-1 ring-[#DCDFED]">{p.note}</div>}

     
          {p.status === "success" && p.successDate && (
            <div className={`mt-3 rounded-lg px-3 py-2 text-[12px] ring-1 ${st.successBg ?? "bg-emerald-50 ring-emerald-200"} flex items-center justify-between`}>
              <span className="text-emerald-700">Success date: {p.successDate}</span>
              <div className="flex gap-2">
                {p.actions
                  ?.filter((a) => a.key === "report" || a.key === "review")
                  .map((a) => (
                    <Cta key={a.key} onClick={a.onClick} disabled={a.disabled} variant={a.key === "review" ? "brand" : "muted"}>
                      {a.label ?? (a.key === "review" ? "Review" : "Report")}
                    </Cta>
                  ))}
              </div>
            </div>
          )}

    
          {!!p.actions?.length && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {p.actions
                ?.filter((a) => !(p.status === "success" && (a.key === "report" || a.key === "review")))
                .map((a) => (
                  <Cta key={a.key} onClick={a.onClick} disabled={a.disabled} variant={a.key === "message" ? "brand" : "muted"}>
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