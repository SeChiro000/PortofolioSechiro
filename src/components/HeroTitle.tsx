'use client'

import { motion } from 'framer-motion'

interface HeroTitleProps {
  text: string
  className?: string
}

export default function HeroTitle({ text, className = '' }: HeroTitleProps) {
  // Split into characters, using non-breaking space for spaces
  const chars = text.split('')

  return (
    <div className={`flex justify-center items-center overflow-hidden ${className}`}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block cursor-default whitespace-pre"
          initial={{ scaleX: 1 }}
          whileHover={{
            scaleX: 1.5, // Stretching horizontally
            color: '#28558a',
            transition: { type: 'spring', stiffness: 300, damping: 15 }
          }}
          style={{ transformOrigin: 'center' }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  )
}
