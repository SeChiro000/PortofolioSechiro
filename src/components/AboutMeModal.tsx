'use client'

import { motion } from 'framer-motion'

export default function AboutMeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null
  return (
    <div className="about-popup-backdrop" onClick={onClose}>
      <motion.div 
        className="about-popup" 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">ABOUT SECHIRO</p>
        <h2>CHARACTER <span>DESIGNS</span></h2>
        <p style={{ margin: '20px 0 30px', opacity: 0.7 }}>
          Character illustrations, playful objects, and colorful little worlds. Explore the evolution of my character concepts in the studio.
        </p>
        <button className="primary-btn" onClick={onClose}>CLOSE</button>
      </motion.div>
    </div>
  )
}
