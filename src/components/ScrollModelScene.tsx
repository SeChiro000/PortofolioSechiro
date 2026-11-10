'use client'

import React, { useRef } from 'react'

// Polyfill React internals
if (typeof window !== 'undefined') {
  const reactAny = React as any
  const internals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || reactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}
  if (!internals.ReactCurrentOwner) {
    internals.ReactCurrentOwner = { current: null }
  }
  if (!reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals
  }
}

import InteractiveText from './InteractiveText'
import ModelViewer from './ModelViewer'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'

export default function ScrollModelScene({ onModelReady }: { onModelReady: () => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  // Keep the model at a constant size; scrolling turns it gently in either direction.
  const scrollSpin = useTransform(scrollYProgress, [0, 1], [-0.55, 0.55])

  return (
    <section className="hero-scene" id="top" ref={sectionRef}>
      <div className="hero-scene-sticky">
        <div className="scene-halo" />
        
        {/* Animated Model Layer */}
        <motion.div className="scene-model">
          <ModelViewer scrollSpin={scrollSpin} onModelReady={onModelReady} />
        </motion.div>
        
        <div className="scene-topline">
          <span>INDEPENDENT ILLUSTRATOR</span>
        </div>

        {/* Oversized brand title */}
        <div className="scene-title">
          <InteractiveText text="SECHIRO" className="justify-center text-[clamp(80px,18vw,220px)] font-black tracking-tighter" />
        </div>

        <div className="scene-actions">
          <a href="#work">EXPLORE MY WORK <span aria-hidden="true">↓</span></a>
        </div>

        <span className="scene-doodle doodle-one" aria-hidden="true">✦</span>
        <span className="scene-doodle doodle-two" aria-hidden="true">✳</span>
        <span className="scene-doodle doodle-three" aria-hidden="true">◌</span>
      </div>
    </section>
  )
}
