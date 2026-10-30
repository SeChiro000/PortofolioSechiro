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
        <Link href="/commissions" className="nav-commission-btn">
          <span>COMMISSION ME</span>
          <span className="star">✳</span>
        </Link>
        <motion.span className="nav-orbit" aria-hidden="true" style={{ rotate: sparkleRotation }}>✳</motion.span>
      </div>
    </header>
    </>
  )
}
