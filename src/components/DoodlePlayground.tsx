'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Stamp {
  id: number
  x: number
  y: number
  symbol: string
  color: string
  size: number
  rotation: number
}

const symbols = ['✳', '✦', '♪', '❀', '⚡', '♡', '◎', '★', 'Bē', 'P']
const colors = ['#28558a', '#f6df58', '#e85d04', '#70e000', '#3a0ca3']

export default function DoodlePlayground() {
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [selectedSymbol, setSelectedSymbol] = useState('✳')

  const addStamp = (x: number, y: number) => {
    const newStamp: Stamp = {
      id: Date.now() + Math.random(),
      x,
      y,
      symbol: selectedSymbol,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.floor(Math.random() * 20) + 24,
      rotation: Math.floor(Math.random() * 60) - 30,
    }

    setStamps((prev) => [...prev.slice(-18), newStamp])
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    addStamp(e.clientX - rect.left, e.clientY - rect.top)
  }

  const handleCanvasKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    addStamp(e.currentTarget.clientWidth / 2, e.currentTarget.clientHeight / 2)
  }

  const handleClear = () => setStamps([])

  return (
    <section className="doodle-section">
      <div className="doodle-header">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          INTERACTIVE PLAYGROUND
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          STAMP A <span>DOODLE</span><i>✳</i>
        </motion.h2>
        <p className="doodle-subtitle">
          Pick a doodle, then click the frame—or press Enter or Space—to leave your mark.
        </p>
      </div>

      <div className="doodle-toolbar">
        <div className="symbol-selector">
          {symbols.map((sym) => (
            <button
              key={sym}
              type="button"
              className={`symbol-btn ${selectedSymbol === sym ? 'active' : ''}`}
              onClick={() => setSelectedSymbol(sym)}
            >
              {sym}
            </button>
          ))}
        </div>

        <button type="button" className="clear-btn" onClick={handleClear}>
          CLEAR CANVAS ✕
        </button>
      </div>

      <div
        className="doodle-canvas"
        onClick={handleCanvasClick}
        onKeyDown={handleCanvasKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Interactive doodle canvas"
      >
        <div className="canvas-watermark">
          [ CLICK OR PRESS ENTER / SPACE TO STAMP {selectedSymbol} ]
        </div>

        <AnimatePresence>
          {stamps.map((stamp) => (
            <motion.span
              key={stamp.id}
              className="doodle-stamp"
              initial={{ scale: 0, rotate: stamp.rotation - 40, opacity: 0 }}
              animate={{ scale: 1, rotate: stamp.rotation, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{
                left: stamp.x,
                top: stamp.y,
                color: stamp.color,
                fontSize: `${stamp.size}px`,
              }}
            >
              {stamp.symbol}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
