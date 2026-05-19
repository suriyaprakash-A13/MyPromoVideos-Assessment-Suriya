import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Benchmark Intelligence",
  description: "Premium competitor intelligence for public video channel analysis and strategic reporting."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
