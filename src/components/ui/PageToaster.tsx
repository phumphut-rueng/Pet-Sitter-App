import { Toaster } from "react-hot-toast";

export default function PageToaster() {
  const orange      = "var(--brand-orange, #FF7037)";
  const orange50    = "var(--brand-orange-50, #FFE8DC)";
  const orange200   = "var(--brand-orange-200, #FFD1BC)";
  const slate50     = "var(--slate-50, #F8FAFC)";
  const slate200    = "var(--slate-200, #E2E8F0)";
  const rose50      = "var(--rose-50, #FFF1F2)";
  const rose200     = "var(--rose-200, #FECDD3)";
  const rose700     = "var(--rose-700, #BE123C)";
  const rose500     = "var(--rose-500, #F43F5E)";

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2500,
        style: {
          borderRadius: 14,
          padding: "10px 14px",
          boxShadow: "0 10px 30px rgba(16,24,40,.12)",
        },


        success: {
          style: {
            background: orange50,
            color: orange,
            border: `1px solid ${orange200}`,
          },
          iconTheme: { primary: orange, secondary: "#fff" },
        },


        error: {
          style: {
            background: rose50,
            color: rose700,
            border: `1px solid ${rose200}`,
          },
          iconTheme: { primary: rose500, secondary: "#fff" },
        },


        loading: {
          style: {
            background: slate50,
            color: "var(--ink, #111827)",
            border: `1px solid ${slate200}`,
          },
        },
      }}
    />
  );
}