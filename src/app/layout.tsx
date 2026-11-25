import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Request Hub",
    template: "%s – Request Hub",
  },
  description: "Submit, track and manage internal service requests for IT, HR and Administration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${publicSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-md focus:outline-2 focus:outline-ring"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        {/* Pinned to light until dark mode exists, so toasts never render dark on a light page. */}
        <Toaster theme="light" position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
