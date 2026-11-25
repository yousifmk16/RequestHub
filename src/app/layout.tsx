import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const almarai = Almarai({
  variable: "--font-almarai",
  // Only Latin is preloaded; the Arabic faces are still declared (unicode-range)
  // and download only when Arabic text appears, e.g. in the planned RTL mode.
  subsets: ["latin"],
  weight: ["400", "700", "800"],
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
    // suppressHydrationWarning: next-themes sets the theme class on <html> before
    // React hydrates, so the server and client class lists differ by design.
    <html lang="en" className={`${almarai.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:shadow-md focus:outline-2 focus:outline-ring"
          >
            Skip to content
          </a>
          <SiteHeader />
          {/* tabIndex -1 lets the skip link move keyboard focus here, not just scroll. */}
          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </main>
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
