import localFont from "next/font/local";
import { Noto_Sans_Thai } from "next/font/google";

export const satoshi = localFont({
  src: [
    { path: "../public/fonts/satoshi/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Medium.woff2",  weight: "500", style: "normal" },
    { path: "../public/fonts/satoshi/Satoshi-Bold.woff2",    weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const notoThai = Noto_Sans_Thai({
  weight: ["400","500","700"],
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});