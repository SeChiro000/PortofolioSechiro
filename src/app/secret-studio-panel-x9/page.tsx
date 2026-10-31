'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type AboutSettings = { eyebrow: string; name: string; description: string; image: string }
type GuestbookEntry = { id: string; name: string; message: string; date: string }
type CommissionTier = { id: string; title: string; tag: string; price: string; timeframe: string; description: string; icon: string }

const defaultAbout: AboutSettings = {
  eyebrow: 'THE ARTIST BEHIND THE DOODLES',
  name: 'SECHIRO.',
  description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
  image: '/gallery/aboutme.png',
}

const defaultTiers: CommissionTier[] = [
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

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  type QueueItem = {
    clientName: string
    artType: string
    status: 'In Queue' | 'Sketching' | 'In Progress' | 'Completed'
  }

  const [about, setAbout] = useState<AboutSettings>(defaultAbout)
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [commissionStatus, setCommissionStatus] = useState<'OPEN' | 'WAITLIST' | 'CLOSED'>('OPEN')
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>(defaultTiers)
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [newClientName, setNewClientName] = useState('')
  const [newArtType, setNewArtType] = useState('Character Art')
  const [newStatus, setNewStatus] = useState<'In Queue' | 'Sketching' | 'In Progress' | 'Completed'>('In Queue')

  const loadDashboard = useCallback(async () => {
    const savedComm = localStorage.getItem('sechiro_commission_status')
    if (savedComm === 'OPEN' || savedComm === 'WAITLIST' || savedComm === 'CLOSED') {
      setCommissionStatus(savedComm)
    }
    const savedTiers = localStorage.getItem('sechiro_commission_tiers')
    if (savedTiers) {
      try { setCommissionTiers(JSON.parse(savedTiers)) } catch {}
    }
    const savedQueue = localStorage.getItem('sechiro_commission_queue')
    if (savedQueue) {
      try { setQueueItems(JSON.parse(savedQueue)) } catch {}
    }

    const [settingsResponse, guestbookResponse] = await Promise.all([
      fetch('/api/site-settings', { cache: 'no-store' }),
      fetch('/api/guestbook', { cache: 'no-store' }),
    ])
    const settings = await settingsResponse.json()
    const guestbook = await guestbookResponse.json()
    if (!settingsResponse.ok) throw new Error(settings.error || 'Gagal memuat pengaturan situs.')
    if (!guestbookResponse.ok) throw new Error(guestbook.error || 'Gagal memuat guestbook.')
    if (settings.saved) {
      if (settings.about) setAbout({ ...defaultAbout, ...settings.about })
      if (settings.commissionStatus) setCommissionStatus(settings.commissionStatus)
      if (settings.commissionTiers) setCommissionTiers(settings.commissionTiers)
      if (settings.commissionQueue && Array.isArray(settings.commissionQueue)) {
        if (settings.commissionQueue.length > 0) {
          setQueueItems(settings.commissionQueue)
          localStorage.setItem('sechiro_commission_queue', JSON.stringify(settings.commissionQueue))
        } else {
          const savedLoc = localStorage.getItem('sechiro_commission_queue')
          if (savedLoc) {
            try {
              const parsed = JSON.parse(savedLoc)
              if (Array.isArray(parsed) && parsed.length > 0) setQueueItems(parsed)
            } catch {}
          }
        }
      }
    } else {
      const savedLocally = localStorage.getItem('sechiro_about_data')
      if (savedLocally) {
        try { setAbout({ ...defaultAbout, ...JSON.parse(savedLocally) }) } catch { setAbout({ ...defaultAbout }) }
      }
    }
    setEntries(guestbook.entries)
  }, [])

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setError('Tidak dapat memeriksa sesi admin.'))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (!authenticated) return
    loadDashboard().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Gagal memuat studio.'))
  }, [authenticated, loadDashboard])

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
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login admin gagal.')
      setPassword('')
      setAuthenticated(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Login admin gagal.')
    } finally {
      setWorking(false)
    }
  }

  const saveAbout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pengaturan gagal disimpan.')
      setAbout(data.about)
      setNotice('Perubahan About Me tersimpan untuk semua pengunjung.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pengaturan gagal disimpan.')
    } finally {
      setWorking(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Gunakan format gambar JPG, PNG, atau WebP.')
      return
    }

    const originalSizeKb = Math.round(file.size / 1024)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const MAX_DIM = 800
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width)
            width = MAX_DIM
          } else {
            width = Math.round((width * MAX_DIM) / height)
            height = MAX_DIM
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setError('Gagal memproses gambar.')
          return
        }
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        
        // Preserve PNG transparency or use WebP/JPEG compression
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        const quality = mimeType === 'image/jpeg' ? 0.85 : undefined
        const dataUrl = canvas.toDataURL(mimeType, quality)
        
        // Calculate compressed size estimate
        const compressedSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024)
        setNotice(`Gambar dikompresi: ${originalSizeKb} KB → ${compressedSizeKb} KB`)
        setAbout((current) => ({ ...current, image: dataUrl }))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Hapus pesan guestbook ini?')) return
    setError('')
    try {
      const response = await fetch('/api/guestbook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Pesan gagal dihapus.')
      setEntries(data.entries)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pesan gagal dihapus.')
    }
  }

  const signOut = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' })
    setAuthenticated(false)
  }

  const saveCommissionStatus = (status: 'OPEN' | 'WAITLIST' | 'CLOSED') => {
    setCommissionStatus(status)
    localStorage.setItem('sechiro_commission_status', status)
    setNotice(`Status commission diperbarui: ${status}`)
    setTimeout(() => setNotice(''), 3000)
  }

  const saveTiers = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionTiers }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan tier komisi.')
      localStorage.setItem('sechiro_commission_tiers', JSON.stringify(commissionTiers))
      setNotice('Tier komisi berhasil disimpan untuk semua pengunjung!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setWorking(false)
    }
  }

  const saveQueueToBackend = async (itemsToSave?: QueueItem[]) => {
    let finalQueue = itemsToSave ? [...itemsToSave] : [...queueItems]
    if (newClientName.trim()) {
      finalQueue.push({
        clientName: newClientName.trim(),
        artType: newArtType.trim() || 'Custom Art',
        status: newStatus,
      })
      setNewClientName('')
      setNewArtType('')
    }
    setQueueItems(finalQueue)
    localStorage.setItem('sechiro_commission_queue', JSON.stringify(finalQueue))

    setWorking(true)
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionQueue: finalQueue }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan queue.')
      setNotice('Commission queue berhasil disimpan untuk semua pengunjung!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setWorking(false)
    }
  }

  const addQueueItem = (e: React.FormEvent) => {
    e.preventDefault()
    saveQueueToBackend()
  }

  const removeQueueItem = (index: number) => {
    const updated = queueItems.filter((_, idx) => idx !== index)
    saveQueueToBackend(updated)
  }

  const updateQueueItemStatus = (index: number, status: 'In Queue' | 'Sketching' | 'In Progress' | 'Completed') => {
    const updated = [...queueItems]
    updated[index].status = status
    saveQueueToBackend(updated)
  }

  if (checking) return <main className="min-h-screen bg-[#fff8d7] p-6 grid place-items-center text-[#28558a]">Memeriksa akses studio…</main>
  if (!authenticated) return (
    <main className="min-h-screen bg-[#fff8d7] p-6 grid place-items-center font-sans text-[#28558a]">
      <form onSubmit={signIn} className="w-full max-w-sm space-y-4 rounded-2xl border-2 border-[#28558a] bg-white p-7">
        <p className="text-xs font-bold tracking-widest">PRIVATE STUDIO</p>
        <h1 className="text-2xl font-extrabold">Admin sign in</h1>
        <label htmlFor="studio-password" className="block text-sm font-bold">Admin password</label>
        <input id="studio-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border-2 border-[#28558a] p-3" />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={working} className="w-full rounded-lg border-2 border-[#28558a] bg-[#28558a] p-3 font-bold text-white disabled:opacity-60">{working ? 'Signing in…' : 'Open Studio'}</button>
        <Link href="/" className="block text-center text-sm font-semibold">← Back to portfolio</Link>
      </form>
    </main>
  )

  return (
    <main className="min-h-screen bg-slate-50 p-5 font-sans text-slate-900 md:p-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-[#28558a] bg-white p-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#28558a]">CLOUDFLARE STUDIO</p>
            <h1 className="mt-1 text-2xl font-extrabold text-[#28558a]">Site settings & guestbook</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/studio" className="rounded-full border border-[#28558a] px-4 py-2 text-sm font-bold text-[#28558a]">UPLOAD ART ↗</Link>
            <Link href="/" className="rounded-full border border-[#28558a] px-4 py-2 text-sm font-bold text-[#28558a]">VIEW SITE</Link>
            <button type="button" onClick={signOut} className="rounded-full border border-[#28558a] bg-[#28558a] px-4 py-2 text-sm font-bold text-white">SIGN OUT</button>
          </div>
        </header>

        {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

        <section className="rounded-xl border-2 border-[#28558a] bg-white p-5 md:p-7">
          <h2 className="mb-5 text-xl font-extrabold text-[#28558a]">ABOUT ME</h2>
          <form onSubmit={saveAbout} className="grid gap-4">
            <label className="grid gap-1 text-sm font-bold">Eyebrow
              <input maxLength={80} value={about.eyebrow} onChange={(event) => setAbout({ ...about, eyebrow: event.target.value })} className="rounded-lg border border-slate-300 p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold">Name
              <input maxLength={50} value={about.name} onChange={(event) => setAbout({ ...about, name: event.target.value })} className="rounded-lg border border-slate-300 p-3 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-bold">Description
              <textarea maxLength={500} rows={3} value={about.description} onChange={(event) => setAbout({ ...about, description: event.target.value })} className="rounded-lg border border-slate-300 p-3 font-normal" />
            </label>
            <div className="grid gap-2 text-sm font-bold">About image
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="w-full rounded-lg border border-slate-300 p-3 font-normal" />
              <input aria-label="Image path or URL" value={about.image} onChange={(event) => setAbout({ ...about, image: event.target.value })} className="w-full rounded-lg border border-slate-300 p-3 font-normal" />
              <img src={about.image} alt="About image preview" className="mt-2 h-28 w-28 rounded-xl border border-slate-200 object-cover" />
            </div>
            <button type="submit" disabled={working} className="min-h-12 rounded-lg border-2 border-[#28558a] bg-[#28558a] px-5 font-bold text-white disabled:opacity-60">{working ? 'SAVING…' : 'SAVE ABOUT ME'}</button>
            {notice && <p role="status" className="text-sm font-semibold text-green-700">{notice}</p>}
          </form>
        </section>

        <section className="rounded-xl border-2 border-[#28558a] bg-white p-5 md:p-7">
          <h2 className="mb-3 text-xl font-extrabold text-[#28558a]">COMMISSION STATUS</h2>
          <p className="mb-4 text-sm text-slate-600">Atur status komisi yang tampil di halaman /commissions.</p>
          <div className="flex flex-wrap gap-3">
            {(['OPEN', 'WAITLIST', 'CLOSED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => saveCommissionStatus(st)}
                className={`rounded-lg border-2 px-5 py-3 font-extrabold text-sm transition-all ${
                  commissionStatus === st
                    ? 'border-[#28558a] bg-[#28558a] text-white shadow-md'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {st === 'OPEN' && '🟢 OPEN'}
                {st === 'WAITLIST' && '🟡 WAITLIST'}
                {st === 'CLOSED' && '🔴 CLOSED'}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border-2 border-[#28558a] bg-white p-5 md:p-7">
          <h2 className="mb-3 text-xl font-extrabold text-[#28558a]">COMMISSION TIERS & PRICING</h2>
          <p className="mb-5 text-sm text-slate-600">Ubah judul, harga, dan deskripsi card commission yang tampil di halaman /commissions.</p>
          <form onSubmit={saveTiers} className="grid gap-6">
            {commissionTiers.map((tier, idx) => (
              <div key={tier.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-extrabold text-[#28558a]">Tier #{idx + 1} ({tier.id})</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="grid gap-1 text-xs font-bold">Title
                    <input value={tier.title} onChange={(e) => {
                      const updated = [...commissionTiers]
                      updated[idx].title = e.target.value
                      setCommissionTiers(updated)
                    }} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" />
                  </label>
                  <label className="grid gap-1 text-xs font-bold">Tag
                    <input value={tier.tag} onChange={(e) => {
                      const updated = [...commissionTiers]
                      updated[idx].tag = e.target.value
                      setCommissionTiers(updated)
                    }} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" />
                  </label>
                  <label className="grid gap-1 text-xs font-bold">Price
                    <input value={tier.price} onChange={(e) => {
                      const updated = [...commissionTiers]
                      updated[idx].price = e.target.value
                      setCommissionTiers(updated)
                    }} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" />
                  </label>
                  <label className="grid gap-1 text-xs font-bold">Timeframe
                    <input value={tier.timeframe} onChange={(e) => {
                      const updated = [...commissionTiers]
                      updated[idx].timeframe = e.target.value
                      setCommissionTiers(updated)
                    }} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" />
                  </label>
                </div>
                <label className="grid gap-1 text-xs font-bold">Description
                  <textarea rows={2} value={tier.description} onChange={(e) => {
                    const updated = [...commissionTiers]
                    updated[idx].description = e.target.value
                    setCommissionTiers(updated)
                  }} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" />
                </label>
              </div>
            ))}
            <button type="submit" disabled={working} className="min-h-12 rounded-lg border-2 border-[#28558a] bg-[#28558a] px-5 font-bold text-white disabled:opacity-60">{working ? 'SAVING…' : 'SAVE COMMISSION TIERS'}</button>
          </form>
        </section>

        <section className="rounded-xl border-2 border-[#28558a] bg-white p-5 md:p-7">
          <h2 className="mb-3 text-xl font-extrabold text-[#28558a]">COMMISSION QUEUE & WIP MANAGER</h2>
          <p className="mb-5 text-sm text-slate-600">Tambah klien baru, ubah status (In Queue, Sketching, In Progress/WIP, Completed), atau hapus dari antrean.</p>
          
          <form onSubmit={addQueueItem} className="mb-6 grid sm:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="grid gap-1 text-xs font-bold sm:col-span-1">Client Name
              <input placeholder="e.g. John Doe" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" required />
            </label>
            <label className="grid gap-1 text-xs font-bold sm:col-span-1">Art Type
              <input placeholder="e.g. Character Art" value={newArtType} onChange={(e) => setNewArtType(e.target.value)} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm" required />
            </label>
            <label className="grid gap-1 text-xs font-bold sm:col-span-1">Initial Status
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="rounded-lg border border-slate-300 p-2.5 font-normal text-sm bg-white">
                <option value="In Queue">In Queue</option>
                <option value="Sketching">Sketching</option>
                <option value="In Progress">In Progress (WIP)</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <div className="flex items-end sm:col-span-1">
              <button type="submit" disabled={working} className="w-full min-h-[42px] rounded-lg border-2 border-[#28558a] bg-[#28558a] px-4 font-bold text-white text-sm disabled:opacity-60">+ ADD TO QUEUE</button>
            </div>
          </form>

          <div className="grid gap-3">
            {queueItems.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">Antrean komisi kosong.</p>
            ) : (
              queueItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="min-w-0 flex-1 grid sm:grid-cols-2 gap-2">
                    <input
                      aria-label={`Client name for item ${idx + 1}`}
                      value={item.clientName}
                      onChange={(e) => {
                        const updated = [...queueItems]
                        updated[idx].clientName = e.target.value
                        setQueueItems(updated)
                      }}
                      className="rounded-lg border border-slate-300 p-2 font-bold text-sm bg-white text-[#28558a]"
                    />
                    <input
                      aria-label={`Art type for item ${idx + 1}`}
                      value={item.artType}
                      onChange={(e) => {
                        const updated = [...queueItems]
                        updated[idx].artType = e.target.value
                        setQueueItems(updated)
                      }}
                      className="rounded-lg border border-slate-300 p-2 text-xs bg-white text-slate-700"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      aria-label={`Status for item ${idx + 1}`}
                      value={item.status}
                      onChange={(e) => {
                        const updated = [...queueItems]
                        updated[idx].status = e.target.value as any
                        setQueueItems(updated)
                      }}
                      className="rounded-lg border border-slate-300 p-2 font-bold text-xs bg-white text-[#28558a]"
                    >
                      <option value="In Queue">🟡 In Queue</option>
                      <option value="Sketching">🟣 Sketching</option>
                      <option value="In Progress">🔵 In Progress (WIP)</option>
                      <option value="Completed">🟢 Completed</option>
                    </select>
                    <button type="button" onClick={() => removeQueueItem(idx)} className="rounded-lg border border-red-300 px-3 py-2 text-xs font-bold text-red-700 bg-white hover:bg-red-50">HAPUS</button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => saveQueueToBackend()}
              disabled={working}
              className="w-full min-h-12 rounded-lg border-2 border-[#28558a] bg-[#28558a] px-5 font-bold text-white disabled:opacity-60 shadow-md"
            >
              {working ? 'SAVING…' : '💾 SAVE COMMISSION QUEUE'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border-2 border-[#28558a] bg-white p-5 md:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-extrabold text-[#28558a]">GUESTBOOK MODERATION</h2><p className="mt-1 text-sm text-slate-600">{entries.length} pesan terbaru</p></div>
            <button type="button" onClick={() => loadDashboard().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Gagal memuat studio.'))} className="rounded-full border border-[#28558a] px-4 py-2 text-sm font-bold text-[#28558a]">REFRESH</button>
          </div>
          <div className="grid gap-3">
            {entries.length === 0 ? <p className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada pesan guestbook.</p> : entries.map((entry) => (
              <article key={entry.id} className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="min-w-0"><p className="text-sm font-bold">{entry.name} <span className="ml-2 text-xs font-normal text-slate-500">{entry.date}</span></p><p className="mt-2 break-words text-sm">“{entry.message}”</p></div>
                <button type="button" onClick={() => deleteEntry(entry.id)} className="rounded-full border border-red-300 px-3 py-2 text-xs font-bold text-red-700">HAPUS</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
