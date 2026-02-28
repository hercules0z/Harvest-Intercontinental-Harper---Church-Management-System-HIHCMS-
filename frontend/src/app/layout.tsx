import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HICHMS | Harvest Intercontinental Church Harper Management System",
  description: "Harvest Intercontinental Church Harper Management System",
  icons: {
    icon: "/harvest-logo.svg",
    shortcut: "/harvest-logo.svg",
    apple: "/harvest-logo.svg",
  },
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
