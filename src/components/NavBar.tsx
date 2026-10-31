'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function NavBar() {
  const { scrollYProgress } = useScroll()
  const sparkleRotation = useTransform(scrollYProgress, [0, 1], [0, 360])

  return (
    <>
    <header className="site-header">
      <Link className="wordmark" href="#top" aria-label="SeChiro home">
        <span className="wordmark-mark">S<span>✳</span></span>
        <span>SeChiro</span>
      </Link>
      <span className="header-note">CHARACTER ART &amp; PLAYFUL WORLDS</span>
      <div className="header-actions">
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
