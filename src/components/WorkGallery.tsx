'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export interface Artwork {
  id: string
  title: string
  category: 'SIMPLE' | 'COMPLEX' | 'CHIBI'
  year: string
  description?: string
  image: string
  aspectRatio: string
}

const artworks: Artwork[] = [
  {
    id: 'karasu',
    title: 'KARASU',
    category: 'COMPLEX',
    year: '2026',
    description: 'Original character illustration featuring sharp lines and expressive mood.',
    image: '/karasu-illustration.jpg',
    aspectRatio: 'aspect-[0.94/1]',
  },
]

export default function WorkGallery() {
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
  const [uploadedArtworks, setUploadedArtworks] = useState<Artwork[]>([])

  useEffect(() => {
    fetch('/api/portfolio?fresh=1')
      .then(async (response) => {
        if (!response.ok) throw new Error('Portfolio storage unavailable')
        const items = await response.json()
        if (!Array.isArray(items)) return
        const mapped = items.map((item: Artwork) => ({
          ...item,
          description: item.description || 'Original artwork by SeChiro.',
        }))
        setUploadedArtworks(mapped)
      })
      .catch(() => {
        setUploadedArtworks([])
      })
  }, [])

  const allArtworks = useMemo(() => [...uploadedArtworks, ...artworks], [uploadedArtworks])

  return (
    <section className="work-section" id="work">
      <div className="section-heading">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          A FEW THINGS I’VE MADE
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
        >
          SELECTED <span>WORK</span><i>✳</i>
        </motion.h2>

        <p className="gallery-note">ORIGINAL CHARACTER <i>✳</i> DIGITAL ILLUSTRATION</p>
      </div>

      {/* Gallery Grid */}
      <div className="work-gallery">
        <AnimatePresence>
          {allArtworks.map((piece, index) => (
            <motion.figure
              key={piece.id}
              className="gallery-piece piece-illustration"
              role="button"
              tabIndex={0}
              aria-label={`View details for ${piece.title}`}
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => setActiveArtwork(piece)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setActiveArtwork(piece)
                }
              }}
            >
              <div className="piece-image-wrap">
                <Image
                  src={piece.image}
                  alt={piece.title}
                  fill
                  sizes="(max-width: 760px) 90vw, 44vw"
                  className="piece-img"
                  unoptimized={piece.image.startsWith('/api/portfolio/file/')}
                />
              </div>

              {/* Hover Badge / Overlay */}
              <div className="piece-overlay">
                <span className="overlay-cat">{piece.category}</span>
                <span className="overlay-view">EXPAND ↗</span>
              </div>

              <span className="art-spark" aria-hidden="true">✳</span>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* Artwork Lightbox Modal */}
      <AnimatePresence>
        {activeArtwork && (
          <motion.div
            className="artwork-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArtwork(null)}
          >
            <motion.div
              className="artwork-modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="artwork-modal-title"
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveArtwork(null)}
                aria-label="Close dialog"
              >
                ✕
              </button>

              <div className="modal-content-grid">
                <div className="modal-image-col">
                  <div className="modal-image-frame">
                    <Image
                      src={activeArtwork.image}
                      alt={activeArtwork.title}
                      fill
                      className="object-contain"
                      unoptimized={activeArtwork.image.startsWith('/api/portfolio/file/')}
                    />
                  </div>
                </div>

                <div className="modal-info-col">
                  <div className="modal-badge-row">
                    <span className="modal-tag">[{activeArtwork.category}]</span>
                    <span className="modal-year">{activeArtwork.year}</span>
                  </div>

                  <h3 id="artwork-modal-title" className="modal-title">{activeArtwork.title}</h3>

                  <div className="mt-4 pt-4 border-t-2 border-slate-200">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {activeArtwork.description || 'Hand-crafted digital artwork by SeChiro.'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
