import { Html, Head, Main, NextScript } from "next/document";
import { satoshi, notoThai } from "@/fonts";

export default function Document() {
  return (
    <Html className={`${satoshi.variable} ${notoThai.variable}`}>
      <Head>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}