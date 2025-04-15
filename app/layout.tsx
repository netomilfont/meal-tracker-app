import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Nunito } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meal Tracker",
  description: "Registre suas refeições aqui!",
  icons: { icon: "" },
};

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // adicione os pesos que você for usar
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${nunito.className}`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
