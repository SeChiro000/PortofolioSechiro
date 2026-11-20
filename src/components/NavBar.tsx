'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'WORK', href: '#work' },
  { label: 'ABOUT', href: '#about' },
  { label: 'COMMISSION', href: '#commission' },
  { label: 'CONTACT', href: '#contact' },
]

export default function NavBar() {
  const { scrollYProgress } = useScroll()
  const sparkleRotation = useTransform(scrollYProgress, [0, 1], [0, 360])
  const [isDark, setIsDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const dark = localStorage.getItem('sechiro_dark') === '1'
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark-theme')
    }
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 760 && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [menuOpen])

  // Close mobile menu on escape key
  useEffect(() => {
    if (!menuOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('sechiro_dark', next ? '1' : '0')
    if (next) {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  }

  return (
    <>
      <header className="site-header">
        <Link className="wordmark" href="#top" aria-label="SeChiro home" onClick={() => setMenuOpen(false)}>
          <span className="wordmark-mark">S<span>✳</span></span>
          <span>SeChiro</span>
        </Link>

        <span className="header-note">CHARACTER ART &amp; PLAYFUL WORLDS</span>

        {/* Desktop navigation */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-theme-toggle"
            style={{ background: isDark ? '#f6df58' : '#28558a', color: isDark ? '#28558a' : '#fff' }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span>{isDark ? '☀️' : '🌙'}</span>
          </button>
          <a
            href="https://discord.com/users/829157863288078336"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-commission-btn desktop-only"
          >
            <span>DISCORD</span>
            <span className="star">💬</span>
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-bar bar-top${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger-bar bar-mid${menuOpen ? ' open' : ''}`} />
            <span className={`hamburger-bar bar-bot${menuOpen ? ' open' : ''}`} />
          </button>

          <motion.span className="nav-orbit desktop-only" aria-hidden="true" style={{ rotate: sparkleRotation }}>✳</motion.span>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              className="mobile-nav"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <span className="mobile-nav-number">{String(i + 1).padStart(2, '0')}</span>
                  {link.label}
                </motion.a>
              ))}
              <div className="mobile-nav-footer">
                <a
                  href="https://discord.com/users/829157863288078336"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-nav-discord"
                  onClick={() => setMenuOpen(false)}
                >
                  💬 DISCORD CHAT <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
