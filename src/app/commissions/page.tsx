'use client'

import '../carousel.css'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface CommissionTier {
  id: string
  title: string
  tag: string
  price: string
  timeframe: string
  description: string
  icon: string
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
  },
  {
    id: 'illustration',
    title: 'CUSTOM ILLUSTRATION',
    tag: 'MADE FOR YOUR IDEA',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'A hand-drawn scene, object, or concept illustrated in a playful, colorful style.',
    icon: '✿',
  },
  {
    id: 'doodles',
    title: 'DOODLE PACK & GRAPHICS',
    tag: 'CREATIVE',
    price: 'Quote after brief',
    timeframe: 'Timing agreed together',
    description: 'Custom playful doodle sets, icons, and visual assets for your brand.',
    icon: '♪',
  },
]

export default function CommissionsPage() {
  const [selectedTier, setSelectedTier] = useState<string>('character')
  const [copied, setCopied] = useState(false)
  const [customIdea, setCustomIdea] = useState('')
  const [copyError, setCopyError] = useState('')
  const inquiryRef = useRef<HTMLDivElement>(null)
  const [commissionStatus, setCommissionStatus] = useState('COMMISSIONS ARE OPEN')
  const [currentTiers, setCurrentTiers] = useState<CommissionTier[]>(tiers)
  const [queueList, setQueueList] = useState<any[]>([])

  useEffect(() => {
    const savedStatus = localStorage.getItem('sechiro_commission_status')
    if (savedStatus) {
      if (savedStatus === 'OPEN') setCommissionStatus('COMMISSIONS ARE OPEN')
      else if (savedStatus === 'WAITLIST') setCommissionStatus('COMMISSION WAITLIST ACTIVE')
      else if (savedStatus === 'CLOSED') setCommissionStatus('COMMISSIONS CURRENTLY CLOSED')
    }

    const savedTiers = localStorage.getItem('sechiro_commission_tiers')
    if (savedTiers) {
      try { setCurrentTiers(JSON.parse(savedTiers)) } catch {}
    }

    const savedQueue = localStorage.getItem('sechiro_commission_queue')
    if (savedQueue) {
      try { setQueueList(JSON.parse(savedQueue)) } catch {}
    }

    fetch('/api/site-settings', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.saved) {
          if (data.commissionStatus) {
            const st = data.commissionStatus
            if (st === 'OPEN') setCommissionStatus('COMMISSIONS ARE OPEN')
            else if (st === 'WAITLIST') setCommissionStatus('COMMISSION WAITLIST ACTIVE')
            else if (st === 'CLOSED') setCommissionStatus('COMMISSIONS CURRENTLY CLOSED')
          }
          if (data.commissionTiers && Array.isArray(data.commissionTiers)) {
            setCurrentTiers(data.commissionTiers)
            localStorage.setItem('sechiro_commission_tiers', JSON.stringify(data.commissionTiers))
          }
          if (data.commissionQueue && Array.isArray(data.commissionQueue)) {
            if (data.commissionQueue.length > 0) {
              setQueueList(data.commissionQueue)
              localStorage.setItem('sechiro_commission_queue', JSON.stringify(data.commissionQueue))
            } else {
              const savedLoc = localStorage.getItem('sechiro_commission_queue')
              if (savedLoc) {
                try {
                  const parsed = JSON.parse(savedLoc)
                  if (Array.isArray(parsed) && parsed.length > 0) setQueueList(parsed)
                } catch {}
              }
            }
          }
        }
      })
      .catch(() => {})
  }, [])




  const activeTierObj = currentTiers.find((t) => t.id === selectedTier) || currentTiers[0]

  const getInquiryText = () => {
    return `Hi SeChiro! I would like to commission a ${activeTierObj.title}.${customIdea ? ` Idea note: ${customIdea}` : ''}`
  }

  const selectTier = (tierId: string, continueToBrief = false) => {
    setSelectedTier(tierId)
    if (continueToBrief) requestAnimationFrame(() => inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  const copyInquiry = async () => {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(getInquiryText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2600)
      return true
    } catch {
      setCopyError('Could not copy automatically. Select and copy the message above.')
      return false
    }
  }

  const handleDiscord = async () => {
    window.open('https://discord.gg/GPbmCVhJW', '_blank', 'noopener,noreferrer')
    await copyInquiry()
  }

  return (
    <motion.div 
      className="studio-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="studio-header">
        <div className="studio-brand">SeChiro<span>STUDIO</span></div>
        <Link href="/" className="studio-back-link">← BACK TO HOME</Link>
      </header>
      
      <section className="commissions-content">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a', letterSpacing: '-0.02em' }}>
            LET’S WORK TOGETHER
          </h2>
          <p style={{ color: '#475569', maxWidth: '540px', margin: '0 auto', fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
            Choose the kind of artwork you need and share a short brief. I’ll reply in chat with the price and estimated timeline before any work begins.
          </p>
        </div>

        <section className="commission-process" aria-labelledby="commission-process-title">
          <div className="commission-process-heading">
            <div><p className="eyebrow">SIMPLE & CLEAR</p><h3 id="commission-process-title">HOW IT WORKS</h3></div>
            <span aria-hidden="true">✳</span>
          </div>
          <div className="commission-process-grid">
            {[
              ['01', 'Share your idea', 'Tell me what you have in mind and choose an art type.'],
              ['02', 'Get a quote in chat', 'We’ll discuss the price, project scope, and timeline in a private Discord chat.'],
              ['03', 'Approve the sketch', 'We’ll align on the direction before I finish the artwork.'],
              ['04', 'Receive your art', 'I’ll deliver the final files in the agreed format.'],
            ].map(([number, title, description]) => (
              <article className="commission-process-step" key={number}>
                <span>{number}</span><h4>{title}</h4><p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Live Commission Tracker */}
        <div style={{ background: '#ffffff', border: '3px solid #28558a', borderRadius: '20px', padding: 'clamp(20px, 4vw, 36px)', marginBottom: '40px' }}>
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
        </div>

        {/* Tiers Grid & Inquiry Builder Box (Placed together at the bottom) */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a', marginBottom: '20px', textAlign: 'center' }}>
            CHOOSE COMMISSION TIER
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '32px' }}>
            {currentTiers.map((tier, idx) => {
              const isSelected = selectedTier === tier.id
              return (
                <motion.article
                  key={tier.id}
                  style={{
                    background: isSelected ? '#fffde6' : '#ffffff',
                    border: '3px solid #28558a',
                    borderRadius: '24px',
                    padding: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.3s ease',
                    boxShadow: 'none'
                  }}
                  onClick={() => selectTier(tier.id)}
                  whileHover={{ translateY: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ padding: '4px 12px', background: '#ffffff', fontSize: '11px', fontWeight: 800, border: '2px solid #28558a', borderRadius: '8px', fontFamily: 'var(--font-syne), sans-serif' }}>{tier.tag}</span>
                      <span style={{ fontSize: '20px' }}>{tier.icon}</span>
                    </div>

                    <h4 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', color: '#28558a', marginBottom: '8px' }}>{tier.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ fontWeight: 800, color: '#28558a', fontSize: '14px' }}>{tier.price}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>• {tier.timeframe}</span>
                    </div>

                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '32px', lineHeight: 1.6 }}>{tier.description}</p>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-syne), sans-serif',
                      border: '3px solid #28558a',
                      borderRadius: '14px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      background: isSelected ? '#28558a' : '#ffffff',
                      color: isSelected ? '#f6df58' : '#28558a',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectTier(tier.id, true)
                    }}
                  >
                    {isSelected ? 'WRITE YOUR BRIEF ↓' : 'CHOOSE & WRITE BRIEF ↓'}
                  </button>
                </motion.article>
              )
            })}
          </div>
        </div>

        {/* Interactive Inquiry Builder Box */}
        <div ref={inquiryRef} className="commission-inquiry-card" style={{ background: '#ffffff', border: '1px solid rgba(40,85,138,.22)', borderRadius: '16px', padding: 'clamp(20px, 4vw, 36px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a' }}>
              COMMISSION INQUIRY [ {activeTierObj.title} ]
            </h3>
            <span style={{ fontSize: '20px' }}>✦</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label htmlFor="commission-brief" style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a' }}>
              Project Note / Brief Idea (Optional)
            </label>
            <textarea
              id="commission-brief"
              rows={4}
              maxLength={500}
              placeholder="Tell me what you have in mind, the mood, and any important details…"
              value={customIdea}
              onChange={(e) => setCustomIdea(e.target.value)}
              style={{ width: '100%', padding: '14px', border: '1px solid rgba(40,85,138,.3)', borderRadius: '10px', fontFamily: 'inherit', fontSize: '14px', fontWeight: 500, lineHeight: 1.5, outline: 'none', resize: 'vertical' }}
            />
            <span className="brief-character-count">{customIdea.length}/500</span>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '3px solid #28558a' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '6px' }}>PRE-FILLED MESSAGE:</span>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#28558a' }}>&ldquo;{getInquiryText()}&rdquo;</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap', paddingTop: '8px' }}>
              <button type="button" style={{ flex: 1, padding: '16px 24px', background: '#28558a', color: '#ffffff', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', border: '3px solid #28558a', borderRadius: '14px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleDiscord}>
                <span>{copied ? 'MESSAGE COPIED — JOIN DISCORD' : 'JOIN MY DISCORD SERVER'}</span>
                <span>↗</span>
              </button>

              <button type="button" style={{ padding: '16px 24px', background: '#f6df58', color: '#28558a', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', border: '1px solid #28558a', borderRadius: '999px', fontSize: '12px', cursor: 'pointer' }} onClick={copyInquiry}>
                {copied ? 'COPIED! ✓' : 'COPY MESSAGE'}
              </button>
            </div>
            {copyError && <p role="alert" className="copy-error-message">{copyError}</p>}
            <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>Your price and timeline will be discussed privately. Join the server, find <strong>SeChiro</strong> in the member list, then send the copied message in a DM.</p>
          </div>
        </div>
      </section>
    </motion.div>
  )
}
