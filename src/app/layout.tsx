import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mondee Compass",
  description: "AI-powered travel itinerary planning app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-gray-950 to-black text-gray-900 dark:text-gray-100`}
      >
        {/* Background elements */}
        <div className="fixed inset-0 bg-[url('/world-map.svg')] opacity-[0.07] bg-no-repeat bg-center bg-cover pointer-events-none"></div>
        
        {/* Decorative gradient blobs */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 z-0"></div>
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 z-0"></div>
        
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
