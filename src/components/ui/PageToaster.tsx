import { Toaster } from "react-hot-toast";

export default function PageToaster() {
  
  const green = "var(--green, #1CCD83)";
  const greenBg = "var(--green-bg, #E7FDF4)";
  const greenBorder = "rgba(28, 205, 131, 0.3)";
  
  const red = "var(--red, #EA1010)";
  const pinkBg = "var(--pink-bg, #FFF0F1)";
  const redBorder = "rgba(234, 16, 16, 0.3)";
  
  const gray1 = "var(--gray-1, #F6F6F9)";
  const gray2 = "var(--gray-2, #DCDFED)";
  const ink = "var(--ink, #060D18)";

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
            background: greenBg,
            color: green,
            border: `1px solid ${greenBorder}`,
          },
          iconTheme: { primary: green, secondary: "#fff" },
        },

        error: {
          style: {
            background: pinkBg,
            color: red,
            border: `1px solid ${redBorder}`,
          },
          iconTheme: { primary: red, secondary: "#fff" },
        },

        loading: {
          style: {
            background: gray1,
            color: ink,
            border: `1px solid ${gray2}`,
          },
        },
      }}
    />
  );
}