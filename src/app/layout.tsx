import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BalancePilot",
  description: "A local-first safe-to-spend personal finance assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
