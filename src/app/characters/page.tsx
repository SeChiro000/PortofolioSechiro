'use client'

import './../carousel.css'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CharactersPage() {
  const [characters, setCharacters] = useState<any[]>([
    { id: 1, name: 'Iroha', role: 'ILLUSTRATION', mood: 'Soft & Whimsical', description: 'A playful illustration study focusing on soft forms.', initials: 'IR', image: '/gallery/ProfilePIcture.jpg' },
    { id: 2, name: 'Karasu', role: '2D CHARACTER', mood: 'Sharp & Celestial', description: 'A character concept with sharp lines and a celestial mood.', initials: 'KR', image: '/karasu-illustration.jpg' },
    { id: 3, name: 'Momo', role: 'CHIBI', mood: 'Cute & Vibrant', description: 'A chibi study with cute proportions and a bright personality.', initials: 'MM', image: '/gallery/aboutme.png' }
  ])
  const [activeVinylId, setActiveVinylId] = useState<any | null>(null)
  const musicRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        const mapped = data.map((item: any, idx: number) => ({
          id: idx + 1,
          name: item.title,
          role: item.category || 'ILLUSTRATION',
          mood: item.description || 'Custom Vibe',
          description: item.description || 'Hand-crafted character artwork.',
          initials: item.title ? item.title.substring(0, 2).toUpperCase() : 'ART',
          image: item.image?.startsWith('/') || item.image?.startsWith('http') ? item.image : `/gallery/${item.image}`
        }))
        setCharacters(mapped)
      })
      .catch(() => {})
  }, [])


  const [isPlayingMusic, setIsPlayingMusic] = useState(false)

  useEffect(() => () => musicRef.current?.pause(), [])

  const toggleMusic = () => {
    const music = musicRef.current
    if (!music) return
    if (isPlayingMusic) {
      music.pause()
      music.currentTime = 0
      setIsPlayingMusic(false)
      return
    }
    music.play().then(() => setIsPlayingMusic(true)).catch(() => setIsPlayingMusic(false))
  }

  const activeChar = characters.find(c => c.id === activeVinylId)

  return (
    <motion.div 
        className="studio-page"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="paper-overlay" />
      <audio ref={musicRef} src="/gallery/monarch-of-the-street.ogg" loop preload="none" />
      <header className="studio-header">
        <div className="studio-brand">SeChiro<span>STUDIO</span></div>
        <Link href="/" className="studio-back-link">← BACK TO HOME</Link>
      </header>
      
      <section className="characters-content">
        <div className="characters-heading">
          <div className="characters-heading-copy">
            <p className="eyebrow">MEET THE CAST</p>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.06em', margin: 0 }}
          >
            CHARACTER <span>COLLECTION</span>
          </motion.h2>
            <p className="characters-intro">Choose a record to meet a character and explore their artwork.</p>
          </div>

          <button
            type="button"
            className={`crackle-toggle ${isPlayingMusic ? 'is-playing' : ''}`}
            onClick={toggleMusic}
            aria-pressed={isPlayingMusic}
          >
            <span aria-hidden="true">{isPlayingMusic ? '♫' : '♪'}</span>
            {isPlayingMusic ? 'MUSIC ON' : 'PLAY MUSIC'}
          </button>
        </div>

        <div className="vinyl-studio-container">
          {/* STAGE: Turntable + Character Info */}
          <motion.div 
            className="vinyl-stage"
          >
            
            {/* Minimalist Cell-shaded Turntable */}
            <motion.div 
              className="turntable-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="turntable-platter">
                {activeChar ? (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeChar.id}
                      className="vinyl-disc spinning"
                      initial={{ scale: 0.94, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.96, opacity: 0 }}
                      transition={{ duration: 0.32, ease: 'easeOut' }}
                    >
                      <div className="vinyl-label">
                        {activeChar.image ? <img src={activeChar.image} alt="" className="vinyl-label-art" /> : <span className="vinyl-label-initials">{activeChar.initials}</span>}
                        <span className="vinyl-label-text">{activeChar.name}</span>
                        <div className="vinyl-center-hole" />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                  >
                    <div className="empty-spindle" />
                    <span className="empty-text" style={{ marginTop: '12px' }}>PICK A RECORD</span>
                    <span className="platter-invite">Choose a character below<br />to start listening</span>
                  </motion.div>
                )}
              </div>

              {/* Tonearm */}
              <div className={`tonearm ${activeChar ? 'active' : ''}`}>
                <div className="tonearm-base" />
                <div className="tonearm-stick" />
                <div className="tonearm-cartridge" />
              </div>

              <div className="turntable-badge">
                {activeChar ? '33 RPM (PLAYING)' : 'READY'}
              </div>
              <div className={`turntable-light ${activeChar ? 'on' : ''}`} />
            </motion.div>

            {/* Character Info Box (Appears on RIGHT when a vinyl is playing) */}
            <AnimatePresence>
              {activeChar && (
                <motion.div 
                  className="character-info-box"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <div className="info-photo-frame">
                    {activeChar.image ? (
                      <img src={activeChar.image} alt={activeChar.name} className="w-full h-auto block" />
                    ) : (
                      <div className="info-photo-placeholder">
                        {activeChar.initials}
                      </div>
                    )}
                  </div>

                  <div className="info-header">
                    <h3 className="info-name">{activeChar.name}</h3>
                    <span className="info-role-badge">{activeChar.role}</span>
                  </div>

                  <div className="character-vibe"><span>CHARACTER VIBE</span><strong>{activeChar.mood}</strong></div>
                  <p className="info-description">{activeChar.description}</p>

                  <button className="eject-btn" onClick={() => setActiveVinylId(null)}>
                    EJECT RECORD ⏏ <span>✳</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* HORIZONTAL VINYL TRACK (CROSSES ACROSS IN FRONT/BELOW) */}
          <motion.div 
            className="vinyl-track-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="track-heading">
              <div><span className="track-kicker">THE LINEUP</span><span className="track-label">{activeChar ? 'Pick another character' : 'Choose a record to begin'}</span></div>
              <span className="track-count">{characters.length.toString().padStart(2, '0')} CHARACTERS</span>
            </div>
            <div className="vinyl-track">
              {characters.map((char) => {
                const isActive = char.id === activeVinylId
                return (
                  <div
                    key={char.id}
                    className={`track-vinyl-item ${isActive ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Play ${char.name}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveVinylId(char.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setActiveVinylId(char.id)
                      }
                    }}
                  >
                    <div className="track-vinyl-disc" style={{ overflow: 'hidden', position: 'relative' }}>
                      {char.image ? (
                        <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="track-vinyl-label">{char.initials}</div>
                      )}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '18px', height: '18px', background: 'var(--blue)', border: '2.5px solid var(--white)', borderRadius: '50%', pointerEvents: 'none', boxShadow: '0 0 0 2px rgba(0,0,0,0.1)' }} />
                    </div>
                    <span className="track-vinyl-name">{char.name}</span>
                    <span className="track-vinyl-role">{char.role}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
