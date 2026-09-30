import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InfoHub",
  description: "ศูนย์รวมข่าวสาร ข้อมูล และความรู้",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
