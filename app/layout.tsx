import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Ujjwal Talwar",
  description: "Network Production Engineer based in London, focused on building reliable, scalable infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="0" className={roboto.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
