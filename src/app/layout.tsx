import ImageProtector from '../components/ImageProtector'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeChiro — Illustrator & Character Artist',
  description: 'Hand-drawn character art, playful illustrations, and tiny worlds made by SeChiro.',
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
