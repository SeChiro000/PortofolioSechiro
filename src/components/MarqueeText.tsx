'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MarqueeTextProps {
  text: string
  direction?: 'left' | 'right'
  speed?: number
  pauseOnHover?: boolean
  className?: string
}

export default function MarqueeText({
  text,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  className = '',
}: MarqueeTextProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const duration = text.length / speed

  return (
    <div
      className="overflow-hidden whitespace-nowrap w-full"
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      <motion.div
        className="inline-flex whitespace-nowrap"
        initial={{ x: direction === 'left' ? '0%' : '-50%' }}
        animate={
          isMounted
            ? {
                x: direction === 'left' ? ['-50%', '0%'] : ['0%', '-50%'],
              }
            : { x: 0 }
        }
        transition={
          isMounted
            ? {
                duration: duration,
                repeat: Infinity,
                ease: 'linear',
                repeatType: 'loop',
              }
            : {}
        }
        style={{ willChange: 'transform' }}
      >
        <span className={`text-6xl md:text-8xl font-black tracking-tighter uppercase ${className}`}>
          {text}
        </span>
        <span className={`text-6xl md:text-8xl font-black tracking-tighter uppercase ${className}`}>
          {text}
        </span>
      </motion.div>
    </div>
  )
}