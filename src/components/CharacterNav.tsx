'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CharacterNav() {
  return (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link 
          href="/characters" 
          className="nav-commission-btn" 
          style={{ 
            fontSize: '12px', 
            padding: '12px 24px',
            textDecoration: 'none'
          }}
        >
          <span>VIEW CHARACTER LIST</span>
          <span className="star">✦</span>
        </Link>
      </motion.div>
    </div>
  )
}
