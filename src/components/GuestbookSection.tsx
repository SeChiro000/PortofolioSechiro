'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GuestbookEntry {
  id: string
  name: string
  message: string
  date: string
}

export default function GuestbookSection() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasPostedToday, setHasPostedToday] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/guestbook', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Guestbook is temporarily unavailable.')
        setEntries(data.entries)
        setHasPostedToday(data.hasPostedToday)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Guestbook is temporarily unavailable.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const cleanName = name.trim()
    const cleanMessage = message.trim()
    if (!cleanName || !cleanMessage) {
      setError('Please fill in both name and message.')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, message: cleanMessage }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.hasPostedToday) setHasPostedToday(true)
        throw new Error(data.error || 'Your note could not be sent. Please try again.')
      }
      setEntries((current) => [data.entry, ...current.filter((entry) => entry.id !== data.entry.id)].slice(0, 100))
      setHasPostedToday(true)
      setName('')
      setMessage('')
      setSuccess('Your note is on the wall. Thank you! ✓')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your note could not be sent. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="guestbook" style={{ padding: '80px 6vw', maxWidth: '1200px', margin: '0 auto', color: '#28558a' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ padding: '4px 12px', background: '#f6df58', color: '#28558a', fontWeight: 800, fontSize: '11px', border: '2px solid #28558a', borderRadius: '8px', display: 'inline-block', marginBottom: '12px', fontFamily: 'var(--font-syne), sans-serif' }}>
          VISITOR WALL
        </span>
        <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          DIGITAL GUESTBOOK
        </h2>
        <p style={{ color: '#475569', fontSize: '14px', fontWeight: 500, maxWidth: '500px', margin: '0 auto' }}>
          Leave a friendly note on my wall. One note per device each day.
        </p>
      </div>

      <div className="guestbook-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>
        <div style={{ background: '#fff8d7', border: '1px solid rgba(40,85,138,.18)', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)' }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a', marginBottom: '20px' }}>
            Pin a Sticky Note 📌
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="guestbook-name" style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, marginBottom: '6px', color: '#28558a' }}>
                Your Name / Alias
              </label>
              <input id="guestbook-name" type="text" maxLength={30} required placeholder="e.g. Visitor" value={name} onChange={(event) => setName(event.target.value)} style={{ width: '100%', padding: '14px', border: '2px solid #28558a', borderRadius: '12px', fontSize: '14px', fontWeight: 600, outline: 'none', background: '#f8fafc' }} />
            </div>

            <div>
              <label htmlFor="guestbook-message" style={{ display: 'block', fontSize: '12px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, marginBottom: '6px', color: '#28558a' }}>
                Message (Max 180 chars)
              </label>
              <textarea id="guestbook-message" rows={3} maxLength={180} required placeholder="Say something nice or share your thoughts..." value={message} onChange={(event) => setMessage(event.target.value)} style={{ width: '100%', padding: '14px', border: '2px solid #28558a', borderRadius: '12px', fontSize: '14px', fontWeight: 600, outline: 'none', background: '#f8fafc', resize: 'vertical' }} />
            </div>

            {error && <p role="alert" style={{ fontSize: '12px', fontWeight: 800, color: '#a23d3d' }}>{error}</p>}
            {success && <p role="status" style={{ fontSize: '12px', fontWeight: 800, color: '#23754c' }}>{success}</p>}

            <button type="submit" disabled={loading || sending || hasPostedToday} style={{ minHeight: '48px', padding: '14px', background: '#28558a', color: '#ffffff', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', border: '2px solid #28558a', borderRadius: '12px', fontSize: '14px', cursor: loading || sending || hasPostedToday ? 'not-allowed' : 'pointer', opacity: loading || sending || hasPostedToday ? 0.65 : 1, transition: 'background 0.2s' }}>
              {loading ? 'LOADING GUESTBOOK…' : sending ? 'SENDING…' : hasPostedToday ? 'TODAY’S NOTE SENT ✓' : 'PIN NOTE TO WALL ✳'}
            </button>
          </form>
        </div>

        <div className="guestbook-wall" aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxHeight: '500px', overflowY: 'auto', padding: '8px 4px 8px 0' }}>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '13px', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>Loading the visitor wall…</p>
          ) : entries.length === 0 ? (
            <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '13px', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No guestbook messages yet. Be the first to pin one!</p>
          ) : entries.map((item, index) => (
            <motion.div key={item.id} style={{ background: index % 2 === 0 ? '#fff8d7' : '#ffffff', border: '1px solid rgba(40,85,138,.18)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', position: 'relative', transform: index % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}>
              <div style={{ position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '6px', background: '#28558a', borderRadius: '2px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#28558a', wordBreak: 'break-word', lineHeight: 1.5 }}>&ldquo;{item.message}&rdquo;</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', color: '#28558a' }}>— {item.name}</span>
                <span style={{ fontSize: '9px', color: '#64748b' }}>{item.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
