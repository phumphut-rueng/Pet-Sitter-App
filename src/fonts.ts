import localFont from "next/font/local";
import { Noto_Sans_Thai } from "next/font/google";

export const satoshi = localFont({
  src: [
    { path: "./assets/fonts/satoshi/Satoshi-Regular.woff", weight: "400", style: "normal" },
    { path: "./assets/fonts/satoshi/Satoshi-Medium.woff",  weight: "500", style: "normal" },
    { path: "./assets/fonts/satoshi/Satoshi-Bold.woff",    weight: "700", style: "normal" },
    { path: "./assets/fonts/satoshi/Satoshi-Black.woff",   weight: "900", style: "normal" }, 
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const notoThai = Noto_Sans_Thai({
  weight: ["400", "500", "700"],
  subsets: ["thai"],
  variable: "--font-noto-thai",
  display: "swap",
});