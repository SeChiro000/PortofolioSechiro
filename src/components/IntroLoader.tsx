'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function IntroLoader({ modelReady }: { modelReady: boolean }) {
  const [pageReady, setPageReady] = useState(false)
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const markPageReady = () => setPageReady(true)
    if (document.readyState === 'complete') markPageReady()
    else window.addEventListener('load', markPageReady, { once: true })

    const minimumTimer = window.setTimeout(() => setMinimumTimeElapsed(true), 1500)
    const fallbackTimer = window.setTimeout(() => setLeaving(true), 7000)
    return () => {
      window.removeEventListener('load', markPageReady)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    if (pageReady && modelReady && minimumTimeElapsed) setLeaving(true)
  }, [pageReady, modelReady, minimumTimeElapsed])

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setVisible(false), 650)
    return () => window.clearTimeout(timer)
  }, [leaving])

  if (!visible) return null

  return (
    <motion.div
      className="site-intro"
      role="status"
      aria-live="polite"
      aria-label="Loading SeChiro portfolio"
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="intro-content">
        <motion.span
          className="intro-spark"
          aria-hidden="true"
          animate={{ rotate: 360, scale: [1, 1.16, 1] }}
          transition={{ rotate: { duration: 5, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } }}
        >✳</motion.span>
        <div className="intro-wordmark" aria-label="SeChiro">
          {'SECHIRO'.split('').map((letter, index) => (
            <motion.span
              key={letter + index}
              initial={{ opacity: 0, y: 24, rotate: 8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.55, delay: 0.12 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <p className="intro-caption">A LITTLE ART UNIVERSE IS WAKING UP</p>
        <div className="intro-progress" aria-hidden="true"><span /></div>
      </div>
    </motion.div>
  )
}
