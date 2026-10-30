'use client'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export default function InteractiveText({ text, className = '' }: { text: string, className?: string }) {
  const mouseX = useMotionValue(-1000)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div 
      ref={containerRef}
      className={`flex justify-center items-center ${className}`}
      onPointerMove={(e) => {
        mouseX.set(e.clientX)
      }}
      onPointerLeave={() => mouseX.set(-1000)}
    >
      {text.split('').map((char, i) => (
        <Char key={i} char={char} mouseX={mouseX} />
      ))}
    </div>
  )
}

function Char({ char, mouseX }: { char: string, mouseX: any }) {
  const ref = useRef<HTMLSpanElement>(null)
  const glyphRef = useRef<HTMLSpanElement>(null)
  const [baseWidth, setBaseWidth] = useState(0)
  useEffect(() => {
    const measure = () => {
      if (!ref.current || !glyphRef.current) return
      setBaseWidth(glyphRef.current.offsetWidth)
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (glyphRef.current) observer.observe(glyphRef.current)
    return () => observer.disconnect()
  }, [])

  const distance = useTransform(mouseX, (mx: number) => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? Math.abs(mx - (rect.left + baseWidth / 2)) : 1000
  })
  const scaleX = useTransform(distance, [0, 150], [1.8, 1], { clamp: true })
  const springScaleX = useSpring(scaleX, { stiffness: 400, damping: 25 })
  const expandedWidth = useTransform(springScaleX, (scale: number) => `${baseWidth * scale}px`)

  return (
    <motion.span
      ref={ref}
      style={{ display: 'inline-block', position: 'relative', flex: '0 0 auto', width: expandedWidth, height: '1em', marginRight: '-0.045em' }}
      className="whitespace-pre"
    >
      <motion.span
        ref={glyphRef}
        style={{ position: 'absolute', left: 0, top: 0, scaleX: springScaleX, transformOrigin: 'left center', whiteSpace: 'pre' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    </motion.span>
  )
}
