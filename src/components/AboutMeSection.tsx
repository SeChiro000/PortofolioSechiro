'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutMeSection() {
  return (
    <section className="about-me-section" id="about" style={{ textAlign: 'center', padding: '84px 6vw' }}>
      <p className="eyebrow">ABOUT SECHIRO</p>
      <h2>CHARACTER <span>DESIGNS</span></h2>
      <p style={{ margin: '20px 0 30px', opacity: 0.7, maxWidth: '600px', marginInline: 'auto' }}>
        Character illustrations, playful objects, and colorful little worlds. Explore the evolution of my character concepts in the studio.
      </p>
      <Link href="/characters" className="primary-btn">
        VIEW CHARACTER LIST
      </Link>
    </section>
  )
}
