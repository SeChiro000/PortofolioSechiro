'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommissionTier {
  tag: string
  icon: string
  title: string
  price: string
  timeframe: string
  description: string
  features: string[]
}

const tiers: CommissionTier[] = [
  {
    tag: 'STARTER',
    icon: '✦',
    title: 'Simple Illustration',
    price: '$25 – $40',
    timeframe: '3–5 days',
    description: 'Clean character illustration with simple background or flat colors. Great for profile pictures and social media.',
    features: [
      'Single character',
      'Simple shading',
      'Flat or minimal background',
      '2 revisions included',
    ],
  },
  {
    tag: 'POPULAR',
    icon: '✳',
    title: 'Complex Illustration',
    price: '$50 – $80',
    timeframe: '5–10 days',
    description: 'Detailed character illustration with full rendering, lighting, and background. Perfect for key visuals and special artwork.',
    features: [
      'Single or duo characters',
      'Full rendering & shading',
      'Detailed background',
      '3 revisions included',
      'Process timelapse',
    ],
  },
  {
    tag: 'SPECIAL',
    icon: '◈',
    title: 'Chibi / Mini',
    price: '$15 – $25',
    timeframe: '2–4 days',
    description: 'Cute chibi-style character illustration, perfect for profile pictures, emotes, and stickers.',
    features: [
      'Chibi proportions',
      'Simple or detailed style',
      'Transparent or colored bg',
      '2 revisions included',
    ],
  },
]

const processSteps = [
  {
    number: '01',
    title: 'INQUIRY',
    description: 'Send your idea through Discord. Share references, character details, and any preferences.',
  },
  {
    number: '02',
    title: 'SKETCH',
    description: 'I\'ll create a rough sketch based on your brief. You can request changes at this stage.',
  },
  {
    number: '03',
    title: 'DELIVERY',
    description: 'Once approved, I\'ll finish the illustration and deliver the final high-resolution file.',
  },
]

const guidelines = [
  'Payment is required upfront before starting the commission.',
  'Complex changes after the sketch stage may incur additional charges.',
  'Please allow the estimated timeframe — rush fees may apply for urgent requests.',
  'I reserve the right to decline a commission for any reason.',
  'Finished artwork may be posted on my portfolio and social media unless otherwise agreed.',
  'Commercial use requires a separate agreement and pricing.',
]

export default function CommissionSection() {
  const [selectedTier, setSelectedTier] = useState<number | null>(1)
  const [guidelinesOpen, setGuidelinesOpen] = useState(false)

  return (
    <section className="commission-section" id="commission">
      <div className="commission-container">
        {/* Header */}
        <div className="commission-header">
          <motion.div
            className="commission-badge"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="status-dot green-pulse" />
            <span>COMMISSIONS OPEN</span>
            <span className="badge-star" aria-hidden="true">✳</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            LET&apos;S CREATE <span>TOGETHER</span>
          </motion.h2>

          <motion.p
            className="commission-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
          >
            Bring your characters and ideas to life. Choose a tier below and reach out through Discord to get started.
          </motion.p>
        </div>

        {/* Commission Tiers */}
        <div className="commission-grid">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.tag}
              className={`commission-card${selectedTier === index ? ' selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedTier(index)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedTier(index) } }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="card-top">
                <span className="tier-tag">{tier.tag}</span>
                <span className="tier-icon" aria-hidden="true">{tier.icon}</span>
              </div>
              <h3 className="tier-title">{tier.title}</h3>
              <div className="tier-pricing">
                <span className="price">{tier.price}</span>
                <span className="timeframe">• {tier.timeframe}</span>
              </div>
              <p className="tier-desc">{tier.description}</p>
              <ul className="tier-features">
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <span className="feature-check" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`tier-select-btn${selectedTier === index ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedTier(index) }}
              >
                {selectedTier === index ? 'SELECTED ✳' : 'SELECT'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Process Steps */}
        <motion.div
          className="commission-steps"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {processSteps.map((step) => (
            <div key={step.number} className="commission-step">
              <span className="step-number">STEP {step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Guidelines Accordion */}
        <motion.div
          className="commission-guidelines"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <button
            type="button"
            className="guidelines-toggle"
            onClick={() => setGuidelinesOpen(!guidelinesOpen)}
            aria-expanded={guidelinesOpen}
          >
            <span>TERMS & GUIDELINES</span>
            <span className="guidelines-arrow" aria-hidden="true">{guidelinesOpen ? '▲' : '▼'}</span>
          </button>
          <AnimatePresence>
            {guidelinesOpen && (
              <motion.ul
                className="guidelines-list"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {guidelines.map((guideline, i) => (
                  <li key={i}>{guideline}</li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Discord CTA */}
        <motion.div
          className="commission-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <p className="cta-text">
            Ready to commission? Reach out on Discord with your idea
            {selectedTier !== null ? ` — I&apos;d love to work on a ${tiers[selectedTier].title.toLowerCase()} with you!` : '!'}
          </p>
          <a
            href="https://discord.com/users/829157863288078336"
            target="_blank"
            rel="noopener noreferrer"
            className="commission-discord-btn"
          >
            <span>💬</span> OPEN DISCORD CHAT <span aria-hidden="true">↗</span>
          </a>
          <p className="discord-instructions">
            Send me a DM on Discord: mention the tier you&apos;re interested in, your character references, and any details.
            I&apos;ll get back to you as soon as possible!
          </p>
        </motion.div>
      </div>
    </section>
  )
}
