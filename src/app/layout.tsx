import ImageProtector from '../components/ImageProtector'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeChiro — Character Illustrator & Artist',
  description: 'Hand-drawn character art, playful illustrations, and colorful little worlds. Commissions open — original characters, fanart, and expressive character illustration by SeChiro.',
  keywords: ['SeChiro', 'character illustration', 'anime art', 'digital illustration', 'character artist', 'commission', 'original characters', 'fanart'],
  authors: [{ name: 'SeChiro' }],
  creator: 'SeChiro',
  openGraph: {
    title: 'SeChiro — Character Illustrator & Artist',
    description: 'A little odd. A lot of heart. Character illustrations, playful objects, and colorful little worlds.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SeChiro Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeChiro — Character Illustrator & Artist',
    description: 'A little odd. A lot of heart. Character illustrations, playful objects, and colorful little worlds.',
    creator: '@Kukurubarchive',
  },
  robots: {
    index: true,
    follow: true,
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
