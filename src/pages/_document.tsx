import { Html, Head, Main, NextScript } from "next/document";
import { satoshi, notoThai } from "@/fonts";

export default function Document() {
  return (
    <Html lang="th" className={`${satoshi.variable} ${notoThai.variable}`}>
      <Head />
      <body><Main /><NextScript /></body>
    </Html>
  );
}