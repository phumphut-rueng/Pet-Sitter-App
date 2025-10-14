import { Toaster } from "react-hot-toast";

export default function PageToaster() {
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
            background: "var(--green-bg)",
            color: "var(--green)",
            border: "1px solid rgba(28, 205, 131, 0.3)",
          },
          iconTheme: { 
            primary: "var(--green)", 
            secondary: "#fff" 
          },
        },

        error: {
          style: {
            background: "var(--pink-bg)",
            color: "var(--red)",
            border: "1px solid rgba(234, 16, 16, 0.3)",
          },
          iconTheme: { 
            primary: "var(--red)", 
            secondary: "#fff" 
          },
        },

        loading: {
          style: {
            background: "var(--gray-1)",
            color: "var(--ink)",
            border: "1px solid var(--gray-2)",
          },
        },
      }}
    />
  );
}