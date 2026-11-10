'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function NavBar() {
  const { scrollYProgress } = useScroll()
  const sparkleRotation = useTransform(scrollYProgress, [0, 1], [0, 360])
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const dark = localStorage.getItem('sechiro_dark') === '1'
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add('dark-theme')
    }
  }, [])

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
      <Link className="wordmark" href="#top" aria-label="SeChiro home">
        <span className="wordmark-mark">S<span>✳</span></span>
        <span>SeChiro</span>
      </Link>
      <span className="header-note">CHARACTER ART &amp; PLAYFUL WORLDS</span>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="nav-commission-btn"
          style={{ background: isDark ? '#f6df58' : '#28558a', color: isDark ? '#28558a' : '#fff' }}
          aria-label="Toggle Theme"
        >
          <span>{isDark ? '☀️ LIGHT' : '🌙 DARK'}</span>
        </button>
        <a href="https://discord.gg/GPbmCVhJW" target="_blank" rel="noopener noreferrer" className="nav-commission-btn">
          <span>DISCORD CHAT</span>
          <span className="star">💬</span>
        </a>
        <motion.span className="nav-orbit" aria-hidden="true" style={{ rotate: sparkleRotation }}>✳</motion.span>
      </div>
    </header>
    </>
  )
}
