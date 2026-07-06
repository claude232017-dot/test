import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ServiceWorkerRegister } from "@/components/providers/sw-register"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "DayFlow — Personal Dashboard",
  description: "Track your daily activity, notes, todos, habits, and more.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "DayFlow" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  // Required for env(safe-area-inset-*) to report real values on notched
  // iPhones; combined with the black-translucent status bar it keeps the
  // installed PWA's top bar out from under the notch. No effect on desktop.
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full relative">
        <ThemeProvider>
          <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="bg-blob w-96 h-96 bg-purple-600/8 -top-32 -left-32" />
            <div className="bg-blob w-80 h-80 bg-blue-600/6 top-1/2 -right-20" />
            <div className="bg-blob w-64 h-64 bg-cyan-600/5 bottom-0 left-1/3" />
          </div>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!bg-card !text-card-foreground !border-border",
            }}
          />
        </ThemeProvider>
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  )
}
