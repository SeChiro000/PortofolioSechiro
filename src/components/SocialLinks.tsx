import Link from 'next/link'

interface SocialLink {
  name: string
  handle: string
  url: string
}

const socials: SocialLink[] = [
  { name: 'TIKTOK', handle: '@chirodisme', url: 'https://www.tiktok.com/@chirodisme' },
  { name: 'X', handle: '@Kukurubarchive', url: 'https://x.com/Kukurubarchive' },
]

export default function SocialLinks() {
  return (
    <div className="w-full border-t border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/20">
        {socials.map((s, idx) => (
          <Link
            key={idx}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex justify-between items-center p-8 hover:bg-white text-[#28558a] hover:text-[#28558a] transition-colors duration-300"
          >
            <div>
              <span className="text-xs font-mono tracking-widest block opacity-60 group-hover:opacity-100">
                // 0{idx + 1}
              </span>
              <h4 className="text-3xl font-display font-black tracking-tight uppercase">
                {s.name}
              </h4>
            </div>
            <div className="text-right flex items-center gap-2">
              <span className="text-sm font-mono opacity-60 group-hover:opacity-100 hidden sm:inline">
                {s.handle}
              </span>
              <span className="text-2xl transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                ↗
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
