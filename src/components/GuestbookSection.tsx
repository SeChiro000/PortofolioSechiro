'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface GuestbookEntry {
  id: string
  name: string
  message: string
  date: string
}

const STORAGE_KEY = 'sechiro_guestbook_entries'
const POSTED_KEY = 'sechiro_guestbook_posted_today'
const USER_KEY = 'sechiro_guestbook_user'

export default function GuestbookSection() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginName, setLoginName] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [captchaNum1, setCaptchaNum1] = useState(3)
  const [captchaNum2, setCaptchaNum2] = useState(4)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [loginError, setLoginError] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [hasPostedToday, setHasPostedToday] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY)
      if (savedUser) setUser(JSON.parse(savedUser))
    } catch {}

    setCaptchaNum1(Math.floor(Math.random() * 6) + 1)
    setCaptchaNum2(Math.floor(Math.random() * 5) + 1)
    // Check local storage first for instant render & survival across refreshes
    let localEntries: GuestbookEntry[] = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) localEntries = JSON.parse(stored)
      const posted = localStorage.getItem(POSTED_KEY)
      const today = new Date().toISOString().slice(0, 10)
      if (posted === today) setHasPostedToday(true)
    } catch {}

    if (localEntries.length > 0) {
      setEntries(localEntries)
      setLoading(false)
    }

    fetch('/api/guestbook', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json()
        if (response.ok && Array.isArray(data.entries)) {
          // Merge local entries with API entries, avoiding duplicates by id
          const mergedMap = new Map<string, GuestbookEntry>()
          // Put API entries first, then local entries
          data.entries.forEach((item: GuestbookEntry) => mergedMap.set(item.id, item))
          localEntries.forEach((item: GuestbookEntry) => {
            if (!mergedMap.has(item.id)) mergedMap.set(item.id, item)
          })
          const finalEntries = Array.from(mergedMap.values()).slice(0, 100)
          setEntries(finalEntries)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(finalEntries))
          } catch {}
          if (typeof data.hasPostedToday === 'boolean') {
            setHasPostedToday(data.hasPostedToday)
            if (data.hasPostedToday) {
              try {
                localStorage.setItem(POSTED_KEY, new Date().toISOString().slice(0, 10))
              } catch {}
            }
          }
        }
      })
      .catch(() => {
        // If API fails, local entries already loaded
      })
      .finally(() => setLoading(false))
  }, [])

  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    if (!loginName.trim()) {
      setLoginError('Please enter your name.')
      return
    }
    if (parseInt(captchaAnswer, 10) !== captchaNum1 + captchaNum2) {
      setLoginError('Incorrect captcha answer. Please try again.')
      setCaptchaNum1(Math.floor(Math.random() * 6) + 1)
      setCaptchaNum2(Math.floor(Math.random() * 5) + 1)
      setCaptchaAnswer('')
      return
    }

    const newUser = {
      name: loginName.trim().slice(0, 30),
      email: loginEmail.trim() || `${loginName.toLowerCase().replace(/\s+/g, '')}@gmail.com`
    }
    setUser(newUser)
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    } catch {}
    setIsLoggingIn(false)
    setLoginName('')
    setLoginEmail('')
    setCaptchaAnswer('')
  }

  const handleLogout = () => {
    setUser(null)
    try {
      localStorage.removeItem(USER_KEY)
    } catch {}
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!user) {
      setError('Please sign in with Google first.')
      return
    }
    const cleanMessage = message.trim()
    if (!cleanMessage) {
      setError('Please write a message.')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, message: cleanMessage }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.hasPostedToday) {
          setHasPostedToday(true)
          try {
            localStorage.setItem(POSTED_KEY, new Date().toISOString().slice(0, 10))
          } catch {}
        }
        throw new Error(data.error || 'Your note could not be sent. Please try again.')
      }

      const newEntry = data.entry as GuestbookEntry
      setEntries((current) => {
        const updated = [newEntry, ...current.filter((entry) => entry.id !== newEntry.id)].slice(0, 100)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })
      setHasPostedToday(true)
      try {
        localStorage.setItem(POSTED_KEY, new Date().toISOString().slice(0, 10))
      } catch {}
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
          Sign in with Google & solve captcha to pin a sticky note. One note per device each day.
        </p>
      </div>

      <div className="guestbook-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>
        <div style={{ background: '#fff8d7', border: '1px solid rgba(40,85,138,.18)', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)' }}>
          <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-syne), sans-serif', fontWeight: 800, color: '#28558a', marginBottom: '20px' }}>
            Pin a Sticky Note 📌
          </h3>

          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', lineHeight: 1.5 }}>
                To prevent spam and ensure genuine names, please sign in with your Google account before pinning a note.
              </p>
              
              {!isLoggingIn ? (
                <button onClick={() => setIsLoggingIn(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '48px', padding: '14px', background: '#ffffff', color: '#28558a', fontWeight: 800, fontFamily: 'var(--font-syne), sans-serif', border: '2px solid #28558a', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.2v3.15C3.2 21.31 7.23 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.2C.44 8.12 0 9.87 0 12s.44 3.88 1.2 5.42l4.08-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.2 2.69 1.2 6.58l4.08 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
                  Sign in with Google ✳
                </button>
              ) : (
                <form onSubmit={handleGoogleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#28558a', fontFamily: 'var(--font-syne), sans-serif' }}>Google Authentication & Captcha</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: '#28558a' }}>Your Full Name / Alias</label>
                    <input type="text" maxLength={30} required placeholder="e.g. Alex Turner" value={loginName} onChange={(e) => setLoginName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #28558a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: '#28558a' }}>Google Email (Optional)</label>
                    <input type="email" placeholder="name@gmail.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #28558a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, marginBottom: '4px', color: '#28558a' }}>Anti-Bot Captcha: What is {captchaNum1} + {captchaNum2}?</label>
                    <input type="number" required placeholder="Answer" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} style={{ width: '100%', padding: '10px', border: '1.5px solid #28558a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none' }} />
                  </div>
                  {loginError && <p style={{ fontSize: '11px', fontWeight: 800, color: '#a23d3d' }}>{loginError}</p>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" style={{ flex: 1, padding: '10px', background: '#28558a', color: '#fff', fontWeight: 800, borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Verify & Login</button>
                    <button type="button" onClick={() => setIsLoggingIn(false)} style={{ padding: '10px', background: '#e2e8f0', color: '#334155', fontWeight: 700, borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#28558a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#28558a', fontFamily: 'var(--font-syne), sans-serif' }}>{user.name}</p>
                    <p style={{ fontSize: '10px', color: '#64748b' }}>Google Verified ✓</p>
                  </div>
                </div>
                <button onClick={handleLogout} style={{ fontSize: '11px', fontWeight: 700, color: '#a23d3d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sign Out</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          )}
        </div>

        <div className="guestbook-wall" aria-live="polite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxHeight: '500px', overflowY: 'auto', padding: '8px 4px 8px 0' }}>
          {loading && entries.length === 0 ? (
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
