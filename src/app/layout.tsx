import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
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
}

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="h-full relative">
        {/* Ambient background blobs */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="bg-blob w-96 h-96 bg-purple-600/8 -top-32 -left-32" />
          <div className="bg-blob w-80 h-80 bg-blue-600/6 top-1/2 -right-20" />
          <div className="bg-blob w-64 h-64 bg-cyan-600/5 bottom-0 left-1/3" />
        </div>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  )
}
