import type { Metadata } from "next"
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  )
}
