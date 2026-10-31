'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface PortfolioImage {
  id: string
  title: string
  image: string
  year: string
}

export default function StudioPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState<'ILLUSTRATION' | 'CHARACTER'>('ILLUSTRATION')
  const [images, setImages] = useState<PortfolioImage[]>([])
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const refreshImages = useCallback(async () => {
    let apiImages: PortfolioImage[] = []
    try {
      const response = await fetch('/api/portfolio?fresh=1', { cache: 'no-store' })
      if (response.ok) apiImages = await response.json()
    } catch {}

    let localImages: PortfolioImage[] = []
    try {
      const saved = localStorage.getItem('sechiro_custom_artworks')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) localImages = parsed
      }
    } catch {}

    const map = new Map<string, PortfolioImage>()
    for (const img of [...localImages, ...apiImages]) {
      map.set(img.id || img.image, img)
    }
    setImages(Array.from(map.values()))
  }, [])

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then(async ({ authenticated: isAuthenticated }) => {
        setAuthenticated(Boolean(isAuthenticated))
        if (isAuthenticated) {
          try {
            await refreshImages()
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Could not load gallery images.')
          }
        }
      })
      .catch(() => setError('Could not check the studio session.'))
      .finally(() => setCheckingSession(false))
  }, [refreshImages])

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not sign in.')
      setAuthenticated(true)
      setPassword('')
      await refreshImages()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in.')
    } finally {
      setWorking(false)
    }
  }

  const addImages = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const files = Array.from(fileInput.current?.files ?? [])
    if (files.length === 0) {
      setError('Choose one or more JPG, PNG, or WebP images first.')
      return
    }

    setWorking(true)
    setError('')
    setMessage(`Uploading ${files.length} ${files.length === 1 ? 'image' : 'images'}…`)
    try {
      const newItems: PortfolioImage[] = []
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error(`${file.name} is not a JPG, PNG, or WebP image.`)
        }
        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`${file.name} is larger than 20 MB. Please resize it and try again.`)
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        const newItem = {
          id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: title || 'New Artwork',
          category: category,
          image: dataUrl,
          year: String(new Date().getFullYear())
        }
        newItems.push(newItem)

        try {
          await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
          })
        } catch {}
      }

      let existing: PortfolioImage[] = []
      try {
        const saved = localStorage.getItem('sechiro_custom_artworks')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) existing = parsed
        }
      } catch {}

      const updatedLocal = [...newItems, ...existing]
      localStorage.setItem('sechiro_custom_artworks', JSON.stringify(updatedLocal))

      if (fileInput.current) fileInput.current.value = ''
      await refreshImages()
      setMessage('Uploaded. The new work is now in the portfolio gallery.')
    } catch (reason) {
      setMessage('')
      setError(reason instanceof Error ? reason.message : 'The upload did not finish.')
    } finally {
      setWorking(false)
    }
  }

  const signOut = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' })
    setAuthenticated(false)
    setImages([])
  }

  return (
    <main className="studio-page">
      <div className="paper-overlay" />
      <header className="studio-header">
        <a href="/" className="studio-brand">SeChiro<span>✳</span></a>
        <a href="/" className="studio-back-link">VIEW PORTFOLIO ↗</a>
      </header>

      {authenticated && (
        <div style={{ maxWidth: 1080, margin: '12px auto 0', textAlign: 'right' }}>
          <a href="/secret-studio-panel-x9" className="studio-back-link">SITE SETTINGS & GUESTBOOK ↗</a>
        </div>
      )}

      <section className="studio-card">
        <p className="eyebrow">PRIVATE ART STUDIO</p>
        <h1>{authenticated ? 'ADD NEW WORK' : 'SIGN IN'}</h1>
        <p className="studio-intro">
            {authenticated
          ? 'Tambah gambar ke galeri Cloudflare R2. Nama file menjadi judul, lalu pilih kategori sebelum mengunggah.'
            : 'Sign in to add new images to your portfolio.'}
        </p>

        {checkingSession ? (
          <p className="studio-status">Checking studio access…</p>
        ) : authenticated ? (
          <>
            <form className="studio-upload-form" onSubmit={addImages}>
              <label className="studio-file-label" htmlFor="portfolio-images">
                <span className="studio-upload-icon">↑</span>
                <strong>Pilih gambar karya</strong>
                <span>JPG, PNG, or WebP · up to 20 MB each</span>
              </label>
              <input
                ref={fileInput}
                id="portfolio-images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
              />
              <label className="studio-category-label" htmlFor="portfolio-category">KATEGORI KARYA</label>
              <select id="portfolio-category" className="studio-category-select" value={category} onChange={(event) => setCategory(event.target.value as 'ILLUSTRATION' | 'CHARACTER')}>
                <option value="ILLUSTRATION">Illustration</option>
                <option value="CHARACTER">Character</option>
              </select>
              <div className="studio-actions">
                <button className="studio-upload-button" type="submit" disabled={working}>
                  {working ? 'MENGUNGGAH…' : 'SIMPAN KARYA ↗'}
                </button>
                <button className="studio-logout-button" type="button" onClick={signOut} disabled={working}>SIGN OUT</button>
              </div>
            </form>
            {message && <p className="studio-status" role="status">{message}</p>}
            <div className="studio-image-list">
              <h2>UPLOADED WORK <span>{images.length}</span></h2>
              {images.length > 0 ? (
                <div className="studio-image-grid">
                  {images.map((image) => (
                    <figure key={image.id}>
                      <Image src={image.image} alt={image.title} width={120} height={120} unoptimized />
                      <figcaption>{image.title}</figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="studio-empty">Your uploaded artwork will appear here.</p>
              )}
            </div>
          </>
        ) : (
          <form className="studio-login-form" onSubmit={signIn}>
            <label htmlFor="studio-password">ADMIN PASSWORD</label>
            <input
              id="studio-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button className="studio-upload-button" type="submit" disabled={working}>
              {working ? 'SIGNING IN…' : 'OPEN STUDIO ↗'}
            </button>
          </form>
        )}

        {error && <p className="studio-error" role="alert">{error}</p>}
      </section>
      <p className="studio-footer">NEW ART IS STORED IN CLOUDFLARE R2, SEPARATELY FROM SITE DEPLOYS</p>
    </main>
  )
}
