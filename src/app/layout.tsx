import ImageProtector from '../components/ImageProtector'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeChiro — Illustrator & Character Artist',
  description: 'Hand-drawn character art, playful illustrations, and tiny worlds made by SeChiro.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2328558a"/><text x="50%" y="58%" font-size="65" font-weight="bold" fill="%23f6df58" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif">S</text></svg>',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">
        <ImageProtector />
                {children}
      </body>
    </html>
  )
}
