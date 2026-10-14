import { Caveat } from "next/font/google"
import localFont from "next/font/local"

import "./globals.css"
import type { Metadata } from "next"

import { SmoothScroll } from "@/components/smooth-scroll"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nadie se casa",
  description:
    "Ceremonia, banquete, discursos, tarta y baile. Todo lo divertido de una boda, sin tener que conocer a los novios.",
}

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" })

const boska = localFont({
  src: [
    { path: "./fonts/Boska-Variable.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/Boska-VariableItalic.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-boska",
  adjustFontFallback: "Times New Roman",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("antialiased", caveat.variable, boska.variable)}
    >
      <body>
        <SmoothScroll />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
