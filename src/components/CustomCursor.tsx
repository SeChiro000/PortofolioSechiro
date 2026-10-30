'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springConfig = { damping: 100, stiffness: 2000, mass: 0.1 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 8)
      cursorY.set(e.clientY - 8)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY])

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <svg viewBox="0 0 24 24" fill="#f6df58" stroke="#28558a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8v4c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-3c0-1.1-.9-2-2-2s-2 .9-2 2v3c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-4z" />
        <path d="M8 8l2-2m4 0l2 2" />
      </svg>
    </motion.div>
  )
}
