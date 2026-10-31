'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

type AboutSettings = { eyebrow: string; name: string; description: string; image: string }
type GuestbookEntry = { id: string; name: string; message: string; date: string }
type CharacterItem = { id: number; name: string; role: string; mood: string; description: string; initials: string; image: string }

const defaultAbout: AboutSettings = {
  eyebrow: 'THE ARTIST BEHIND THE DOODLES',
  name: 'SECHIRO.',
  description: 'I make expressive character art, playful illustrations, and drawings with a life of their own.',
  image: '/gallery/aboutme.png',
}



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
  const [characters, setCharacters] = useState<CharacterItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sechiro_characters_data')
      if (saved) {
        try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed } catch {}
      }
    }
    return [
      { id: 1, name: 'Iroha', role: 'ILLUSTRATION', mood: 'Soft & Whimsical', description: 'A playful illustration study focusing on soft forms.', initials: 'IR', image: '/gallery/ProfilePIcture.jpg' },
      { id: 2, name: 'Karasu', role: '2D CHARACTER', mood: 'Sharp & Celestial', description: 'A character concept with sharp lines and a celestial mood.', initials: 'KR', image: '/gallery/aboutme.png' },
      { id: 3, name: 'Momo', role: 'CHIBI', mood: 'Cute & Vibrant', description: 'A chibi study with cute proportions and a bright personality.', initials: 'MM', image: '/gallery/aboutme.png' }
    ]
  })
  const [newCharName, setNewCharName] = useState('')
  const [newCharRole, setNewCharRole] = useState('')
  const [newCharMood, setNewCharMood] = useState('')
  const [newCharDesc, setNewCharDesc] = useState('')
  const [newCharImage, setNewCharImage] = useState('/gallery/aboutme.png')
  const [portfolioWorks, setPortfolioWorks] = useState<any[]>([])

  const loadDashboard = useCallback(async () => {
    const [settingsResponse, guestbookResponse] = await Promise.all([
      fetch('/api/site-settings', { cache: 'no-store' }),
      fetch('/api/guestbook', { cache: 'no-store' }),
    ])
    const settings = await settingsResponse.json()
    const guestbook = await guestbookResponse.json()
    if (!settingsResponse.ok) throw new Error(settings.error || 'Gagal memuat pengaturan situs.')
    if (!guestbookResponse.ok) throw new Error(guestbook.error || 'Gagal memuat guestbook.')
    if (settings.saved && settings.about) {
      setAbout({ ...defaultAbout, ...settings.about })
    } else {
      const savedLocally = localStorage.getItem('sechiro_about_data')
      if (savedLocally) {
        try { setAbout({ ...defaultAbout, ...JSON.parse(savedLocally) }) } catch { setAbout({ ...defaultAbout }) }
      }
    }
    const localChars = localStorage.getItem('sechiro_characters_data')
    if (!localChars && settings.saved && settings.characters && Array.isArray(settings.characters)) {
      setCharacters(settings.characters)
    }
    setEntries(guestbook.entries)
  }, [])

  const saveCharacters = async (updatedChars: CharacterItem[]) => {
    setWorking(true)
    setError('')
    setNotice('')
    try {
      localStorage.setItem('sechiro_characters_data', JSON.stringify(updatedChars))
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characters: updatedChars }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan karakter.')
      setCharacters(updatedChars)
      setNotice('Koleksi karakter berhasil diperbarui!')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setWorking(false)
    }
  }

  const addCharacter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCharName.trim()) return
    const newItem: CharacterItem = {
      id: Date.now(),
      name: newCharName.trim(),
      role: newCharRole.trim() || 'CHARACTER',
      mood: newCharMood.trim() || 'Standard Vibe',
      description: newCharDesc.trim() || 'Hand-crafted character artwork.',
      initials: newCharName.substring(0, 2).toUpperCase(),
      image: newCharImage || '/gallery/aboutme.png'
    }
    const updated = [...characters, newItem]
    setNewCharName('')
    setNewCharRole('')
    setNewCharMood('')
    setNewCharDesc('')
    saveCharacters(updated)
  }

  const deleteCharacter = (id: number) => {
    const updated = characters.filter(c => c.id !== id)
    saveCharacters(updated)
  }

  useEffect(() => {
    fetch('/api/admin/session')
      .then((response) => response.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .catch(() => setError('Tidak dapat memeriksa sesi admin.'))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (!authenticated) return
    Promise.all([
      fetch('/api/portfolio').then(res => res.ok ? res.json() : []),
      Promise.resolve(JSON.parse(localStorage.getItem('sechiro_custom_artworks') || '[]'))
    ]).then(([apiWorks, localWorks]) => {
      const map = new Map()
      for (const w of [...localWorks, ...apiWorks]) {
        map.set(w.image || w.id, w)
      }
      setPortfolioWorks(Array.from(map.values()))
    }).catch(() => {})
  }, [authenticated])

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
    <main className="min-h-screen bg-[#fff8d7] p-5 font-sans text-slate-900 md:p-10">
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#28558a]">CHARACTER COLLECTION MANAGER</h2>
              <p className="mt-1 text-sm text-slate-600">Atur karakter yang muncul di halaman Character Collection</p>
            </div>
          </div>

          <form onSubmit={addCharacter} className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-bold text-slate-800">Tambah Karakter Baru</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-bold">Nama Karakter
                <input value={newCharName} onChange={(e) => setNewCharName(e.target.value)} placeholder="Misal: Iroha" required className="rounded-lg border border-slate-300 p-3 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-bold">Role / Kategori
                <input value={newCharRole} onChange={(e) => setNewCharRole(e.target.value)} placeholder="Misal: ILLUSTRATION" className="rounded-lg border border-slate-300 p-3 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-bold">Mood / Vibe
                <input value={newCharMood} onChange={(e) => setNewCharMood(e.target.value)} placeholder="Misal: Soft & Whimsical" className="rounded-lg border border-slate-300 p-3 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-bold">Pilih Karya dari Selected Work / Gallery
                <select
                  value={newCharImage}
                  onChange={(e) => setNewCharImage(e.target.value)}
                  className="rounded-lg border border-slate-300 p-3 font-normal bg-white"
                >
                  <option value="/gallery/aboutme.png">Default (/gallery/aboutme.png)</option>
                  <option value="/gallery/ProfilePIcture.jpg">Profile Picture (/gallery/ProfilePIcture.jpg)</option>
                  {portfolioWorks.map((work, idx) => (
                    <option key={work.id || idx} value={work.image}>
                      {work.title} ({work.category || 'ILLUSTRATION'})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newCharImage}
                  onChange={(e) => setNewCharImage(e.target.value)}
                  placeholder="Atau ketik URL/path gambar kustom..."
                  className="mt-1.5 rounded-lg border border-slate-300 p-2 text-xs font-normal text-slate-600"
                />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-bold">Deskripsi Karakter
              <textarea rows={2} value={newCharDesc} onChange={(e) => setNewCharDesc(e.target.value)} placeholder="Deskripsi singkat karakter..." className="rounded-lg border border-slate-300 p-3 font-normal" />
            </label>
            <button type="submit" disabled={working} className="rounded-lg bg-[#28558a] px-4 py-3 font-bold text-white hover:bg-[#1d3d63] disabled:opacity-60">TAMBAH KARAKTER</button>
          </form>

          <div className="grid gap-3">
            {characters.map((char) => (
              <div key={char.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <img src={char.image} alt={char.name} className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                  <div>
                    <h4 className="font-bold text-[#28558a]">{char.name} <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#28558a]">{char.role}</span></h4>
                    <p className="text-xs text-slate-500">{char.mood} — {char.description}</p>
                  </div>
                </div>
                <button type="button" onClick={() => deleteCharacter(char.id)} className="rounded-full border border-red-300 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">HAPUS</button>
              </div>
            ))}
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
