import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/toaster'
import "./globals.css"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {(process.env.NODE_ENV === "development" && process.env.YB_ENABLE_REACT_SCAN === '1') && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
        </head>
      )}
      <body
        className={`antialiased`}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}
