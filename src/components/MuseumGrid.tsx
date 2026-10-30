'use client'

import { motion } from 'framer-motion'
import ArtFrame from './ArtFrame'

interface ArtItem {
  id: string
  title: string
  category: string
  aspectRatio: string // Tailwind aspect ratio or span
  colSpan?: string
  rowSpan?: string
  color: string
}

const mockArtworks: ArtItem[] = [
  { id: '1', title: 'CYBER ARCHIVES', category: 'ILLUSTRATION', aspectRatio: 'aspect-[4/5]', colSpan: 'md:col-span-1', color: 'from-[#fff2a3] to-[#f6df58]' },
  { id: '2', title: 'BRUTAL VOID', category: 'TYPOGRAPHY', aspectRatio: 'aspect-[16/9]', colSpan: 'md:col-span-2', color: 'from-[#dce9f7] to-[#9bbce0]' },
  { id: '3', title: 'ORGANIC MOTION', category: 'VISUAL IDENTITY', aspectRatio: 'aspect-square', colSpan: 'md:col-span-1', color: 'from-[#fff2a3] to-[#dce9f7]' },
  { id: '4', title: 'SYNTHETIC DREAMS', category: 'GENERATIVE', aspectRatio: 'aspect-[3/4]', colSpan: 'md:col-span-1', color: 'from-[#9bbce0] to-[#dce9f7]' },
  { id: '5', title: 'MONOLITH', category: 'SCULPTURE', aspectRatio: 'aspect-[16/10]', colSpan: 'md:col-span-2', color: 'from-[#f6df58] to-[#fff2a3]' },
]

export default function MuseumGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-[minmax(250px,auto)]">
      {mockArtworks.map((art, idx) => (
        <motion.div
          key={art.id}
          className={`${art.colSpan || 'col-span-1'} relative`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.1 }}
        >
          <ArtFrame aspectRatio={art.aspectRatio}>
            <div className={`w-full h-full bg-gradient-to-br ${art.color} flex flex-col justify-end p-6 relative group overflow-hidden border border-white/5`}>
              {/* Background detail */}
              <div className="absolute inset-0 bg-[#28558a]/10 group-hover:bg-transparent transition-colors duration-500" />
              
              {/* Art Meta */}
              <div className="relative z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs font-mono tracking-widest text-white/50 block mb-1">
                  [{art.category}]
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-black tracking-tight text-[#28558a] group-hover:text-[#28558a] transition-colors">
                  {art.title}
                </h3>
              </div>
            </div>
          </ArtFrame>
        </motion.div>
      ))}
    </div>
  )
}
