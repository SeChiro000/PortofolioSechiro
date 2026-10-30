'use client'

import { motion } from 'framer-motion'

interface BoldTextProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'span'
  stagger?: boolean
}

export default function BoldText({
  children,
  className = '',
  as: Tag = 'h1',
  stagger = false,
}: BoldTextProps) {
  const words = typeof children === 'string' ? children.split(' ') : []

  if (stagger && typeof children === 'string') {
    return (
      <Tag className={className}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-3"
            initial={{ opacity: 0, y: 40, skewY: 10 }}
            whileInView={{ opacity: 1, y: 0, skewY: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Tag className={className}>{children}</Tag>
    </motion.div>
  )
}