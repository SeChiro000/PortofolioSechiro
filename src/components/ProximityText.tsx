'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface ProximityTextProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
  proximity?: number // px - jarak efek proximity (default 200px)
  scaleFrom?: number // skala awal (default 1)
  scaleTo?: number // skala saat dekat (default 1.12)
  glow?: boolean // apakah ada glow effect
  glowColor?: string
  stagger?: boolean
}

export default function ProximityText({
  children,
  className = '',
  as: Tag = 'h2',
  proximity = 220,
  scaleFrom = 1,
  scaleTo = 1.12,
  glow = true,
  glowColor = '#28558a',
  stagger = false,
}: ProximityTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.4 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.4 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const proximityFactor = Math.max(0, 1 - distance / proximity)

      mouseX.set(proximityFactor)
      mouseY.set(proximityFactor)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, proximity])

  const scale = useTransform([smoothX, smoothY], ([x, y]) => {
    const v = Math.max(x as number, y as number)
    return scaleFrom + (scaleTo - scaleFrom) * v
  })

  const filter = useTransform([smoothX, smoothY], ([x, y]) => {
    const v = Math.max(x as number, y as number)
    return `blur(${0 + v * 2}px) brightness(${1 + v * 0.15})`
  })

  const textShadow = useTransform([smoothX, smoothY], ([x, y]) => {
    const v = Math.max(x as number, y as number)
    const spread = 2 + v * 18
    return `0 0 ${spread}px ${glowColor}aa`
  })

  if (stagger && typeof children === 'string') {
    const words = children.split(' ')
    return (
      <Tag className={className} ref={ref as React.RefObject<HTMLHeadingElement>}>
        {words.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block mr-3"
            style={{
              scale,
              filter,
              textShadow: glow ? (textShadow as any) : 'none',
              transformOrigin: 'center center',
            }}
            initial={{ opacity: 0, y: 40, skewY: 10 }}
            whileInView={{ opacity: 1, y: 0, skewY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag className={className} ref={ref}>
      <motion.div style={{ scale, filter, ...(glow ? { textShadow: textShadow as any } : {}) }}>
        {children}
      </motion.div>
    </Tag>
  )
}