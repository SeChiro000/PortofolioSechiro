'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export interface Artwork {
  id: string
  title: string
  category: string
  year: string
  description?: string
  image: string
  aspectRatio: string
  tools?: string[]
}

const FILTER_CATEGORIES = [
  { value: 'ALL', label: 'All' },
  { value: 'CHARACTER_ILLUSTRATION', label: 'Character Illustration' },
  { value: 'ORIGINAL_CHARACTERS', label: 'Original Characters' },
  { value: 'FANART', label: 'Fanart' },
  { value: 'PERSONAL_PROJECTS', label: 'Personal Projects' },
] as const

type FilterValue = typeof FILTER_CATEGORIES[number]['value']

/* Map legacy categories to new filter system for backward compat */
function mapCategory(cat: string): FilterValue {
  const upper = cat.toUpperCase()
  const mapping: Record<string, FilterValue> = {
    'SIMPLE': 'CHARACTER_ILLUSTRATION',
    'COMPLEX': 'CHARACTER_ILLUSTRATION',
    'CHIBI': 'CHARACTER_ILLUSTRATION',
    'CHARACTER': 'ORIGINAL_CHARACTERS',
    'ILLUSTRATION': 'CHARACTER_ILLUSTRATION',
    'CHARACTER_ILLUSTRATION': 'CHARACTER_ILLUSTRATION',
    'ORIGINAL_CHARACTERS': 'ORIGINAL_CHARACTERS',
    'FANART': 'FANART',
    'PERSONAL_PROJECTS': 'PERSONAL_PROJECTS',
  }
  return mapping[upper] || 'CHARACTER_ILLUSTRATION'
}

/* Display label for a category */
function categoryLabel(cat: string): string {
  const mapped = mapCategory(cat)
  const found = FILTER_CATEGORIES.find(f => f.value === mapped)
  return found?.label || cat
}

const artworks: Artwork[] = [
  {
    id: 'karasu',
    title: 'KARASU',
    category: 'CHARACTER_ILLUSTRATION',
    year: '2026',
    description: 'Original character illustration featuring sharp lines and expressive mood.',
    image: '/karasu-illustration.jpg',
    aspectRatio: 'aspect-[0.94/1]',
    tools: ['Clip Studio Paint'],
  },
]

export default function WorkGallery() {
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
  const [uploadedArtworks, setUploadedArtworks] = useState<Artwork[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL')

  const playClickSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch {}
  }

  const handleOpenArtwork = (piece: Artwork) => {
    playClickSound()
    setActiveArtwork(piece)
  }

  /* Close lightbox on Escape */
  useEffect(() => {
    if (!activeArtwork) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveArtwork(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [activeArtwork])

  /* Lock body scroll when lightbox is open */
  useEffect(() => {
    if (activeArtwork) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [activeArtwork])

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
  const filteredArtworks = useMemo(() => {
    if (activeFilter === 'ALL') return allArtworks
    return allArtworks.filter((piece) => mapCategory(piece.category) === activeFilter)
  }, [allArtworks, activeFilter])

  return (
    <section className="work-section" id="work">
      <div className="section-heading">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          A FEW THINGS I&apos;VE MADE
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

        {/* Category Filter Bar */}
        <div className="gallery-filter-bar">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`filter-pill${activeFilter === cat.value ? ' active' : ''}`}
              onClick={() => setActiveFilter(cat.value)}
            >
              {activeFilter === cat.value && <span className="filter-star" aria-hidden="true">✳</span>}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="work-gallery">
        <AnimatePresence>
          {filteredArtworks.map((piece, index) => (
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
              onClick={() => handleOpenArtwork(piece)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleOpenArtwork(piece)
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
                  unoptimized={piece.image.startsWith('/api/portfolio/file/') || piece.image.startsWith('data:')}
                />
              </div>

              {/* Hover overlay */}
              <div className="piece-overlay">
                <span className="overlay-cat">{categoryLabel(piece.category)}</span>
                <span className="overlay-title">{piece.title}</span>
                <span className="overlay-view">VIEW ↗</span>
              </div>

              <span className="art-spark" aria-hidden="true">✳</span>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {filteredArtworks.length === 0 && (
        <motion.p
          className="gallery-empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No artwork in this category yet. Check back soon! ✳
        </motion.p>
      )}

      {/* Enhanced Artwork Lightbox Modal */}
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
              initial={{ scale: 0.82, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280, mass: 0.8 }}
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
                {/* Image column */}
                <div className="modal-image-col">
                  <div className="modal-image-frame">
                    <Image
                      src={activeArtwork.image}
                      alt={activeArtwork.title}
                      fill
                      className="object-contain"
                      unoptimized={activeArtwork.image.startsWith('/api/portfolio/file/') || activeArtwork.image.startsWith('data:')}
                    />
                  </div>
                </div>

                {/* Info column */}
                <div className="modal-info-col">
                  <div>
                    <div className="modal-badge-row">
                      <span className="modal-tag">{categoryLabel(activeArtwork.category)}</span>
                      <span className="modal-year">{activeArtwork.year}</span>
                    </div>
                    <h3 className="modal-title" id="artwork-modal-title">{activeArtwork.title}</h3>
                    <p className="modal-desc">
                      {activeArtwork.description || 'Original artwork by SeChiro.'}
                    </p>

                    {/* Tools */}
                    {activeArtwork.tools && activeArtwork.tools.length > 0 && (
                      <div className="modal-tools">
                        <span className="tools-label">TOOLS</span>
                        <div className="tools-tags">
                          {activeArtwork.tools.map((tool) => (
                            <span key={tool} className="tool-chip">{tool}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Commission CTA */}
                  <div className="modal-cta-box">
                    <p className="modal-cta-prompt">Like this style? Commission something similar!</p>
                    <a href="#commission" className="modal-commission-btn" onClick={() => setActiveArtwork(null)}>
                      ✳ VIEW COMMISSION INFO
                    </a>
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
