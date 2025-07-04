import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GitHub Webhook Dashboard",
  description: "Monitor GitHub repository events (Push, Pull Request, Merge)",
  icons: {
    icon: "/favicon.ico",
  },
  // Remove any Vercel branding from metadata
  generator: "GitHub Webhook Dashboard",
  applicationName: "GitHub Webhook Dashboard",
  authors: [{ name: "Raj Patil" }],
  creator: "Raj Patil",
  publisher: "Raj Patil",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Remove Vercel analytics and branding */}
        <meta name="powered-by" content="GitHub Webhook Dashboard" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
