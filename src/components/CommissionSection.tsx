'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CommissionTier {
  id: string
  title: string
  tag: string
  price: string
  timeframe: string
  description: string
  icon: string
  color: string
}

const tiers: CommissionTier[] = [
  {
    id: 'character',
    title: 'CHARACTER ART',
    tag: 'CHARACTER FOCUS',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'Expressive hand-drawn character illustrations tailored to your vision.',
    icon: '✦',
    color: 'bg-[#fff8d7]',
  },
  {
    id: 'illustration',
    title: 'CUSTOM ILLUSTRATION',
    tag: 'MADE FOR YOUR IDEA',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'A hand-drawn scene, object, or concept illustrated in a playful, colorful style.',
    icon: '✿',
    color: 'bg-[#f6df58]',
  },
  {
    id: 'doodles',
    title: 'DOODLE PACK & GRAPHICS',
    tag: 'CREATIVE',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'Custom playful doodle sets, icons, and visual assets for your brand.',
    icon: '♪',
    color: 'bg-white',
  },
]

export default function CommissionSection() {
  const [selectedTier, setSelectedTier] = useState<string>('character')
  const [copied, setCopied] = useState(false)
  const [customIdea, setCustomIdea] = useState('')
  const [commissionStatus, setCommissionStatus] = useState('COMMISSIONS ARE OPEN')
  const [queueList, setQueueList] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('sechiro_commission_status')
    if (saved) {
      if (saved === 'OPEN') setCommissionStatus('COMMISSIONS ARE OPEN')
      else if (saved === 'WAITLIST') setCommissionStatus('COMMISSION WAITLIST ACTIVE')
      else if (saved === 'CLOSED') setCommissionStatus('COMMISSIONS CURRENTLY CLOSED')
    }

    const savedQueue = localStorage.getItem('sechiro_commission_queue')
    if (savedQueue) {
      try { setQueueList(JSON.parse(savedQueue)) } catch (e) {}
    }

    fetch('/api/site-settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.saved) {
          if (data.commissionQueue && Array.isArray(data.commissionQueue)) {
            setQueueList(data.commissionQueue)
            localStorage.setItem('sechiro_commission_queue', JSON.stringify(data.commissionQueue))
          }
        }
      })
      .catch(() => {})
  }, [])

  const activeTierObj = tiers.find((t) => t.id === selectedTier) || tiers[0]

  const getInquiryText = () => {
    const text = `Hi SeChiro! I would like to commission a ${activeTierObj.title}.${customIdea ? ` Idea note: ${customIdea}` : ''}`
    return text
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(getInquiryText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handleDiscord = () => {
    window.open('https://discord.gg/GPbmCVhJW', '_blank', 'noopener,noreferrer')
    navigator.clipboard.writeText(getInquiryText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }).catch(() => {})
  }

  return (
    <section className="commission-section" id="commission">
      <div className="commission-container">
        {/* Header Badge & Title */}
        <div className="commission-header">
          <motion.div
            className="commission-badge"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="status-dot green-pulse" />
            <span className="badge-text">{commissionStatus}</span>
            <span className="badge-star">✳</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            LET’S WORK<br />
            <span>TOGETHER</span>
          </motion.h2>

          <motion.p
            className="commission-subtitle"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Have a character or illustration idea? Choose a service below, add a short brief, and send it to me on Discord.
          </motion.p>
        </div>

        {/* Tiers Grid */}
        <div className="commission-grid">
          {tiers.map((tier, idx) => {
            const isSelected = selectedTier === tier.id
            return (
              <motion.article
                key={tier.id}
                className={`commission-card ${isSelected ? 'selected' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="card-top">
                  <span className="tier-tag">{tier.tag}</span>
                  <span className="tier-icon">{tier.icon}</span>
                </div>

                <h3 className="tier-title">{tier.title}</h3>
                <div className="tier-pricing">
                  <span className="price">{tier.price}</span>
                  <span className="timeframe">• {tier.timeframe}</span>
                </div>

                <p className="tier-desc">{tier.description}</p>



                <button
                  type="button"
                  className={`tier-select-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedTier(tier.id)
                  }}
                >
                  {isSelected ? 'SELECTED ✳' : 'SELECT OPTION'}
                </button>
              </motion.article>
            )
          })}
        </div>

        <div className="commission-steps" aria-label="How to request a commission">
          <div className="commission-step">
            <span className="step-number">01</span>
            <h3>CHOOSE A SERVICE</h3>
            <p>Pick the kind of artwork you have in mind.</p>
          </div>
          <div className="commission-step">
            <span className="step-number">02</span>
            <h3>SHARE YOUR IDEA</h3>
            <p>Add a short note so I can understand your brief.</p>
          </div>
          <div className="commission-step">
            <span className="step-number">03</span>
            <h3>CHAT ON DISCORD</h3>
            <p>Join my server, find SeChiro, and send me your request.</p>
          </div>
        </div>

                {/* PUBLIC VGEN-STYLE WORKFLOW BOARD (ZERO SHADOWS) */}
        <motion.div 
          className="bg-white p-6 md:p-8 rounded-lg border-2 border-[#28558a] mb-12"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b-2 border-[#28558a]">
            <div>
              <span className="px-3 py-1 bg-yellow-200 text-slate-900 font-extrabold text-xs border border-[#28558a] rounded-md inline-block mb-1">
                LIVE COMMISSION TRACKER
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Workflow & Client Queue</h3>
            </div>
            <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-300">
              Total Orders: <span className="text-blue-600 font-black">{queueList.length}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'In Queue', label: 'In Queue', color: 'bg-yellow-50 border-[#28558a]' },
              { id: 'Sketching', label: 'Sketching', color: 'bg-purple-50 border-[#28558a]' },
              { id: 'In Progress', label: 'WIP (In Progress)', color: 'bg-blue-50 border-[#28558a]' },
              { id: 'Completed', label: 'Completed', color: 'bg-green-50 border-[#28558a]' },
            ].map(col => {
              const colItems = queueList.filter((i: any) => i.status === col.id)
              return (
                <div key={col.id} className={`p-4 rounded-xl border-2 border-[#28558a] flex flex-col gap-3 ${col.color}`}>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-300">
                    <h4 className="font-extrabold text-xs text-slate-900">{col.label}</h4>
                    <span className="w-5 h-5 bg-white border border-[#28558a] rounded-full font-black text-[11px] flex items-center justify-center">
                      {colItems.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {colItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">Kosong</p>
                    ) : (
                      colItems.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="bg-white p-3 rounded-xl border border-[#28558a] flex flex-col gap-1">
                          <span className="font-extrabold text-sm text-slate-900">{item.clientName}</span>
                          <span className="text-xs text-slate-600">{item.artType}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

                {/* FAQ & TERMS OF SERVICE (ZERO SHADOWS) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {/* FAQ Card */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#28558a]">
            <h4 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
              <span>❓</span> Frequently Asked Questions
            </h4>
            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">How long does a commission take?</p>
                <p>Timing is discussed and agreed together based on complexity (usually 1-2 weeks per artwork).</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">How many revisions are included?</p>
                <p>Revisions are handled during sketch & lineart phases so you have full control over the result.</p>
              </div>
            </div>
          </div>

          {/* Terms of Service Card */}
          <div className="bg-white p-6 rounded-lg border-2 border-[#28558a]">
            <h4 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
              <span>📝</span> Terms & Guidelines
            </h4>
            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">Usage Rights</p>
                <p>All artworks are for personal use by default unless commercial rights are discussed beforehand.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">Payment & Workflow</p>
                <p>We will discuss your brief on Discord first. Once agreed, we proceed with sketching and updates.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Inquiry Builder Box */}
        <motion.div
          className="inquiry-builder-box"
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="builder-header">
            <h3>
              <span>COMMISSION INQUIRY</span> [ {activeTierObj.title} ]
            </h3>
            <span className="builder-spark">✦</span>
          </div>

          <div className="builder-body">
            <label htmlFor="idea-input" className="input-label">
              Project Note / Brief Idea (Optional):
            </label>
            <input
              id="idea-input"
              type="text"
              placeholder="e.g. A playful character drinking banana milk in a retro jacket..."
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              className="builder-input"
            />

            <div className="prefilled-preview">
              <span className="preview-label">PRE-FILLED MESSAGE:</span>
              <p className="preview-text">&ldquo;{getInquiryText()}&rdquo;</p>
            </div>

            <div className="action-buttons">
              <button type="button" className="action-btn primary-btn" onClick={handleDiscord}>
                <span>{copied ? 'MESSAGE COPIED — JOIN DISCORD' : 'JOIN MY DISCORD SERVER'}</span>
                <span className="btn-icon">↗</span>
              </button>

              <button type="button" className="action-btn outline-btn" onClick={handleCopyText}>
                <span>{copied ? 'COPIED TO CLIPBOARD! ✓' : 'COPY MESSAGE'}</span>
              </button>
            </div>
            <p className="discord-instructions">Join the server, find <strong>SeChiro</strong> in the member list, then send the copied commission message in a DM.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
