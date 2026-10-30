'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const characters = [
  { id: 1, name: 'Iroha', role: 'Character Design', description: 'A playful design study focusing on soft forms, expressive silhouettes, and a whimsical color palette.' },
  { id: 2, name: 'Karasu', role: 'Character Design', description: 'A character concept emphasizing sharp, angular lines and a celestial-inspired aesthetic.' },
]

export default function AboutMe() {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <section className="about-me-section" id="about">
      <div className="about-heading">
        <p className="eyebrow">DESIGN STUDIES</p>
        <h2>CHARACTER <span>DESIGNS</span></h2>
      </div>

      <div className="characters-grid">
        {characters.map((char) => (
          <motion.div
            key={char.id}
            layoutId={`card-${char.id}`}
            className="character-card"
            onClick={() => setSelectedId(char.id)}
            whileHover={{ scale: 1.02 }}
            style={{ cursor: 'pointer' }}
          >
            <h3>{char.name}</h3>
            <span className="role">{char.role}</span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`card-${selectedId}`}
              className="character-detail"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const char = characters.find(c => c.id === selectedId)
                return char ? (
                  <>
                    <h3>{char.name}</h3>
                    <span className="role">{char.role}</span>
                    <p>{char.description}</p>
                    <button className="close-btn" onClick={() => setSelectedId(null)}>CLOSE</button>
                  </>
                ) : null
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
