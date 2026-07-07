import type { Metadata, Viewport } from "next"
import { Geist_Mono, Manrope, Playfair_Display } from "next/font/google"

import "./globals.css"
import { ProgressSync } from "@/components/providers/progress-sync"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
})

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "VoxTome",
  description: "Your books, read aloud. Upload, listen, and read along.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VoxTome",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        manrope.variable,
        playfairDisplayHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <AuthSessionProvider>
            <ProgressSync />
            {children}
            <Toaster richColors closeButton position="top-center" />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
