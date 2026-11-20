'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface ProcessStep {
  label: string
  image: string
  note: string
}

interface Project {
  id: string
  title: string
  category: string
  description: string
  concept: string
  finalImage: string
  steps: ProcessStep[]
  tools: string[]
}

/*
 * ──────────────────────────────────────────────
 *  ADD YOUR OWN PROJECTS HERE
 *  Each project shows the artistic process from
 *  concept → sketch → lineart → color → final.
 *  Replace the placeholder data below with your
 *  actual artwork and process images.
 * ──────────────────────────────────────────────
 */
const projects: Project[] = [
  {
    id: 'karasu-project',
    title: 'KARASU',
    category: 'ORIGINAL CHARACTER',
    description: 'Original character illustration featuring sharp lines, dramatic lighting, and an expressive mood that captures the character\'s intensity.',
    concept: 'The concept behind Karasu was to create a character that embodies quiet intensity — someone whose stillness speaks louder than action. The design focuses on sharp contrasts and muted tones with strategic pops of color.',
    finalImage: '/karasu-illustration.jpg',
    steps: [
      { label: 'CONCEPT', image: '/karasu-illustration.jpg', note: 'Initial concept exploring the character\'s silhouette and mood.' },
      { label: 'SKETCH', image: '/karasu-illustration.jpg', note: 'Rough sketch defining proportions, pose, and expression.' },
      { label: 'LINEART', image: '/karasu-illustration.jpg', note: 'Clean linework with emphasis on sharp, confident strokes.' },
      { label: 'FINAL', image: '/karasu-illustration.jpg', note: 'Full rendering with lighting, shading, and color adjustments.' },
    ],
    tools: ['Clip Studio Paint', 'Photoshop'],
  },
]

export default function FeaturedProjects() {
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  if (projects.length === 0) return null

  const toggleProject = (id: string) => {
    if (expandedProject === id) {
      setExpandedProject(null)
      setActiveStep(0)
    } else {
      setExpandedProject(id)
      setActiveStep(0)
    }
  }

  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        {/* Header */}
        <div className="section-heading">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            HOW THE ART COMES TO LIFE
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            FEATURED <span>PROJECTS</span><i aria-hidden="true">✳</i>
          </motion.h2>
          <p className="gallery-note">BEHIND THE SCENES <i>✳</i> CREATIVE PROCESS</p>
        </div>

        {/* Project Cards */}
        <div className="projects-list">
          {projects.map((project) => {
            const isExpanded = expandedProject === project.id

            return (
              <motion.article
                key={project.id}
                className={`project-card${isExpanded ? ' expanded' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                layout
              >
                {/* Card Header (always visible) */}
                <div
                  className="project-card-header"
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleProject(project.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleProject(project.id) } }}
                  aria-expanded={isExpanded}
                >
                  <div className="project-thumb">
                    <Image
                      src={project.finalImage}
                      alt={project.title}
                      fill
                      sizes="120px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="project-card-info">
                    <span className="project-cat">{project.category}</span>
                    <h3 className="project-name">{project.title}</h3>
                    <p className="project-brief">{project.description}</p>
                  </div>
                  <div className="project-expand-icon" aria-hidden="true">
                    <motion.span animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ duration: 0.2 }}>+</motion.span>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="project-detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Concept */}
                      <div className="project-concept">
                        <h4>CONCEPT & CREATIVE DIRECTION</h4>
                        <p>{project.concept}</p>
                      </div>

                      {/* Process Steps */}
                      <div className="project-process">
                        <div className="process-tabs">
                          {project.steps.map((step, index) => (
                            <button
                              key={step.label}
                              type="button"
                              className={`process-tab${activeStep === index ? ' active' : ''}`}
                              onClick={() => setActiveStep(index)}
                            >
                              <span className="tab-number">{String(index + 1).padStart(2, '0')}</span>
                              <span className="tab-label">{step.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="process-viewer">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeStep}
                              className="process-frame"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="process-image-wrap">
                                <Image
                                  src={project.steps[activeStep].image}
                                  alt={`${project.title} — ${project.steps[activeStep].label}`}
                                  fill
                                  sizes="(max-width: 760px) 90vw, 600px"
                                  style={{ objectFit: 'contain' }}
                                />
                              </div>
                              <p className="process-note">{project.steps[activeStep].note}</p>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Tools */}
                      <div className="project-tools">
                        <span className="tools-label">TOOLS USED</span>
                        <div className="tools-tags">
                          {project.tools.map((tool) => (
                            <span key={tool} className="tool-chip">{tool}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
