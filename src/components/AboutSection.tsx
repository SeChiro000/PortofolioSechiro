'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

  // Remove tools array to clean up code

const specializations = [
  'Character Illustration',
  'Original Characters',
  'Visual Storytelling',
  'Expression Studies',
  'Color Theory',
  'Character Interaction',
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
}

export default function AboutSection() {
  return (
    <section className="about-full-section" id="about">
      <span className="about-full-star star-tl" aria-hidden="true">✳</span>
      <span className="about-full-star star-br" aria-hidden="true">✦</span>

      <div className="about-full-container">
        {/* Header */}
        <div className="about-full-header">
          <motion.p className="eyebrow" {...fadeUp}>THE ARTIST BEHIND THE DOODLES</motion.p>
          <motion.h2 className="about-full-title" {...fadeUp} transition={{ delay: 0.08 }}>
            MEET <span>SECHIRO</span><i aria-hidden="true">✳</i>
          </motion.h2>
        </div>

        {/* Two-column layout */}
        <div className="about-full-grid">
          {/* Left: Image + quick facts */}
          <motion.div
            className="about-full-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            <div className="about-full-image-frame">
              <Image
                src="/gallery/aboutme.png"
                alt="SeChiro — Character Illustrator"
                fill
                sizes="(max-width: 760px) 80vw, 360px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="about-full-image-tag">
              <span className="tag-star" aria-hidden="true">✳</span>
              <span>ILLUSTRATOR & CHARACTER ARTIST</span>
            </div>

            {/* Photo snapshot decoration */}
            <motion.div
              className="about-full-snapshot"
              initial={{ opacity: 0, rotate: 8, y: 18 }}
              whileInView={{ opacity: 1, rotate: 6, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Image
                src="/gallery/content-2.jpg"
                alt="Additional artwork"
                fill
                sizes="180px"
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
          </motion.div>

          {/* Right: Content blocks */}
          <motion.div
            className="about-full-right"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18, duration: 0.6 }}
          >
            {/* Intro */}
            <div className="about-block about-intro-block">
              <p>
                I&apos;m SeChiro — an independent character illustrator who loves bringing characters to life
                through expressive art, playful interactions, and colorful little worlds.
              </p>
              <p>
                My work focuses on capturing emotion and personality in every illustration. Whether it&apos;s an
                original character, fanart, or a personal project, I aim to create art that makes you feel something
                — art that&apos;s a little odd, but full of heart.
              </p>
            </div>

            {/* Philosophy */}
            <div className="about-block about-philosophy-block">
              <h3><span className="block-icon" aria-hidden="true">✳</span> ARTISTIC PHILOSOPHY</h3>
              <p>
                Every character has a story, and every illustration should tell it. I believe in making art
                that&apos;s expressive, playful, and full of personality — art that feels alive and makes you smile.
              </p>
            </div>

            {/* Tools */}
            <div className="about-block about-tools-block">
              <h3><span className="block-icon" aria-hidden="true">✳</span> TOOLS & SOFTWARE</h3>
              <div className="about-chip-grid">
                {tools.map((tool) => (
                  <motion.span
                    key={tool.name}
                    className="about-chip tool-chip"
                    whileHover={{ y: -3, scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="chip-icon" aria-hidden="true">{tool.icon}</span>
                    {tool.name}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Specialization */}
            <div className="about-block about-spec-block">
              <h3><span className="block-icon" aria-hidden="true">✳</span> SPECIALIZATION</h3>
              <div className="about-chip-grid">
                {specializations.map((spec) => (
                  <motion.span
                    key={spec}
                    className="about-chip spec-chip"
                    whileHover={{ y: -3, scale: 1.04 }}
                    transition={{ duration: 0.2 }}
                  >
                    {spec}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="about-block">
              <a href="#commission" className="about-cta-btn">
                SEE COMMISSION INFO <span aria-hidden="true">↓</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
