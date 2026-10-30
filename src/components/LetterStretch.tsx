'use client'

import { motion } from 'framer-motion'

interface LetterStretchProps {
  text: string
  className?: string
}

export default function LetterStretch({ text, className = '' }: LetterStretchProps) {
  return (
    <div className={`flex ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block cursor-default"
          whileHover={{
            scaleX: 1.4,
            scaleY: 0.9,
            color: '#28558a',
            transition: { type: 'spring', stiffness: 400, damping: 10 }
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  )
}
