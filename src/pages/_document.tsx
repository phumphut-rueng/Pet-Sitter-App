import { Html, Head, Main, NextScript } from "next/document";
import { satoshi, notoThai } from "@/fonts";

export default function Document() {
  return (
    <Html className={`${satoshi.variable} ${notoThai.variable}`}>
      <Head>
        {/* เพิ่ม Omise Script */}
        <script src="https://cdn.omise.co/omise.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}