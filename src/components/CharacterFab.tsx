'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CharacterFab() {
  return (
    <Link href="/characters">
      <motion.div 
        className="character-nav-fab"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3, duration: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="View Character List"
      >
        <span>✧</span>
      </motion.div>
    </Link>
  )
}
