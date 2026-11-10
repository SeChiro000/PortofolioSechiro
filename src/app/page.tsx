'use client'

import Image from 'next/image'

import GuestbookSection from '@/components/GuestbookSection'

import { useCallback, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '../components/NavBar'
import IntroLoader from '../components/IntroLoader'
import ScrollModelScene from '../components/ScrollModelScene'
import WorkGallery from '../components/WorkGallery'
import CharacterFab from '../components/CharacterFab'
import ProximityText from '../components/ProximityText'

const socials = [
  { name: 'DISCORD', handle: 'chat with me', icon: '💬', url: 'https://discord.gg/GPbmCVhJW' },
  { name: 'TIKTOK', handle: '@chirodisme', icon: '♪', url: 'https://www.tiktok.com/@chirodisme' },
  { name: 'X', handle: '@Kukurubarchive', icon: '𝕏', url: 'https://x.com/Kukurubarchive' },
]

export default function Home() {
  const [modelReady, setModelReady] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [aboutData, setAboutData] = useState({
    eyebrow: 'THE ARTIST BEHIND THE DOODLES',
    name: 'SECHIRO.',
    description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
    image: '/gallery/aboutme.png'
  })
  const markModelReady = useCallback(() => setModelReady(true), [])

  useEffect(() => {
    fetch('/api/site-settings', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.about) setAboutData(data.about) })
      .catch(() => {})
  }, [])

  return (
    <main className="main-wrapper">
      <div className="paper-overlay" />
      <IntroLoader modelReady={modelReady} />
      <NavBar />
      <ScrollModelScene onModelReady={markModelReady} />

      {/* Marquee Banner */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>
            DRAWN WITH FEELING <i>✳</i> CHARACTER ARTIST <i>✳</i> ILLUSTRATION & 3D <i>✳</i> MADE TO MAKE YOU SMILE <i>✳</i> A LITTLE BIT PLAYFUL <i>✳</i>{' '}
          </span>
          <span>
            DRAWN WITH FEELING <i>✳</i> CHARACTER ARTIST <i>✳</i> ILLUSTRATION & 3D <i>✳</i> MADE TO MAKE YOU SMILE <i>✳</i> A LITTLE BIT PLAYFUL <i>✳</i>{' '}
          </span>
        </div>
      </div>

      {/* Manifesto */}
      <section className="manifesto">
        <span className="manifesto-star star-left" aria-hidden="true">✳</span>
        <span className="manifesto-star star-right" aria-hidden="true">✦</span>
        <motion.p className="eyebrow" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          A PERSONAL ART UNIVERSE
        </motion.p>
        <ProximityText
          as="h2"
          className="manifesto-h2"
          proximity={300}
          scaleTo={1.15}
          glow={true}
          glowColor="#28558a"
          stagger={true}
        >
          A LITTLE ODD. A LOT OF HEART<span className="yellow-dot">✳</span>
        </ProximityText>
        <motion.p className="manifesto-note" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}>
          Character illustrations, playful objects, and colorful little worlds.
        </motion.p>
      </section>

      {/* Selected Work with Project Details */}
      <WorkGallery />

      {/* Guestbook Section temporarily disabled for security */}
      {/* <GuestbookSection /> */}

      {/* Floating UI Elements */}
      <div className="floating-buttons-container">
        <CharacterFab />
        <button type="button" className="floating-about" aria-label="Open About me" onClick={() => setAboutOpen(true)}>
          <span className="floating-about-label">ABOUT ME</span>
          <motion.span className="floating-about-star" aria-hidden="true">✳</motion.span>
        </button>
      </div>
      <AnimatePresence>
        {aboutOpen && (
          <motion.div
            className="about-popup-backdrop"
            role="presentation"
            onClick={() => setAboutOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="about-popup"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-popup-title"
              onClick={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.96, rotate: -1 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <button type="button" className="about-popup-close" onClick={() => setAboutOpen(false)} aria-label="Close About me">×</button>
              
              <div className="about-popup-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <span className="about-popup-spark" aria-hidden="true">✳</span>
                  <p className="eyebrow">{aboutData.eyebrow}</p>
                  <h2 id="about-popup-title">HI, I’M <span style={{ color: "transparent", WebkitTextStroke: "1.5px var(--blue)" }}>{aboutData.name}</span></h2>
                </div>
                
                <motion.div
                  className="about-popup-main-art"
                  initial={{ opacity: 0, scale: 0.4, y: -20, x: -20, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
                  style={{ 
                    width: 'min(475px, 76vw)', 
                    height: 'min(475px, 76vw)', 
                    borderRadius: '48px', 
                    border: 'none', 
                    overflow: 'hidden', 
                    flexShrink: '0', 
                    background: 'transparent', 
                    position: 'absolute',
                    top: 'calc(-1 * min(475px, 76vw) + 125px)',
                    left: 'clamp(-130px, -8vw, -40px)',
                    boxShadow: 'none',
                    zIndex: 10
                  }}
                >
                  <Image src={aboutData.image} alt="SeChiro" fill style={{ objectFit: 'cover' }} />
                </motion.div>
              </div>

              <p className="about-popup-copy" style={{ textAlign: 'left' }}>{aboutData.description}</p>
              <div style={{ textAlign: 'left' }}>
                <a className="about-popup-link" href="#social" onClick={() => setAboutOpen(false)}>FIND ME ELSEWHERE <span aria-hidden="true">↗</span></a>
              </div>
              <motion.div
                className="about-photo-snapshot"
                initial={{ opacity: 0, rotate: 8, y: 18, scale: 0.92 }}
                animate={{ opacity: 1, rotate: 8, y: 0, scale: 1 }}
                transition={{ delay: 0.28, type: 'spring', stiffness: 260, damping: 20 }}
                style={{
                  position: 'absolute',
                  width: 'clamp(180px, 29vw, 280px)',
                  height: 'clamp(220px, 36vw, 340px)',
                  right: 'clamp(-130px, -9vw, -36px)',
                  bottom: 'clamp(-115px, -8vw, -30px)',
                  padding: '9px 9px 28px',
                  background: '#fffdf5',
                  border: '1px solid rgba(40, 85, 137, .25)',
                  boxShadow: '0 12px 28px rgba(20, 45, 76, .22)',
                  zIndex: 11,
                }}
              >
                <Image src="/gallery/content-2.jpg" alt="Foto tambahan" fill sizes="280px" style={{ objectFit: 'cover', padding: '9px 9px 28px' }} />
              </motion.div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Section */}
      <section className="social-section" id="social">
        <div className="social-heading">
          <div>
            <p className="eyebrow">ELSEWHERE ON THE INTERNET</p>
            <h2>
              LET’S BE<br />
              <span>FRIENDS.</span>
            </h2>
          </div>
          <span className="social-spark" aria-hidden="true">✳</span>
        </div>
        <div className="social-grid">
          {socials.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
            >
              <span className="social-icon" aria-hidden="true">{social.icon}</span>
              <span className="social-name">{social.name}</span>
              <span className="social-handle">{social.handle}</span>
              <span className="social-arrow" aria-hidden="true">↗</span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <span className="footer-mark">
          SeChiro<span>✳</span>
        </span>
        <p>DRAWN WITH CARE, ON EARTH.</p>
        <a href="#top">BACK TO TOP ↑</a>
        <small>© 2026 SeChiro</small>
      </footer>
    </main>
  )
}
