import type { Metadata, Viewport } from "next";
import { Noto_Serif_HK } from "next/font/google";
import { ArchiveProvider } from "@/lib/archive";
import "./globals.css";

const notoSerif = Noto_Serif_HK({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "remarkeble",
    template: "%s · remarkeble",
  },
  description: "香港本地食肆的策展檔案。一間餐廳，一頁。",
  applicationName: "remarkeble",
};

export const viewport: Viewport = {
  themeColor: "#f2f2f7",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${notoSerif.variable} h-full antialiased`}>
      <body className="h-dvh overflow-hidden bg-paper font-sans text-ink">
        <ArchiveProvider>
          <div className="flex h-dvh w-full flex-col bg-paper">{children}</div>
        </ArchiveProvider>
      </body>
    </html>
  );
}
