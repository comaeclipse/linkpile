import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "link.pile - Social Bookmarking",
  description: "A simple and elegant bookmarking service inspired by del.icio.us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
