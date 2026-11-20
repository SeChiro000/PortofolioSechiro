'use client'

import { motion } from 'framer-motion'

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
]

const socialLinks = [
  { name: 'Discord', handle: 'add me / chat', url: 'https://discord.com/users/829157863288078336', icon: '💬' },
  { name: 'TikTok', handle: '@chirodisme', url: 'https://www.tiktok.com/@chirodisme', icon: '♪' },
  { name: 'X / Twitter', handle: '@Kukurubarchive', url: 'https://x.com/Kukurubarchive', icon: '𝕏' },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="enhanced-footer" id="contact">
      {/* Top: CTA banner */}
      <div className="footer-cta-bar">
        <motion.div
          className="footer-cta-content"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="footer-cta-text">INTERESTED IN WORKING TOGETHER?</p>
          <a
            href="https://discord.com/users/829157863288078336"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-cta-btn"
          >
            💬 LET&apos;S CHAT ON DISCORD <span aria-hidden="true">↗</span>
          </a>
        </motion.div>
      </div>

      {/* Main footer grid */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Column 1: Brand */}
          <div className="footer-col footer-brand-col">
            <span className="footer-brand">
              SeChiro<span className="footer-brand-star" aria-hidden="true">✳</span>
            </span>
            <p className="footer-tagline">
              Character illustrations, playful objects, and colorful little worlds.
            </p>
            <p className="footer-subtitle">ILLUSTRATION & CHARACTER ART</p>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">NAVIGATE</h4>
            <nav className="footer-nav" aria-label="Footer navigation">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="footer-nav-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3: Connect */}
          <div className="footer-col">
            <h4 className="footer-col-title">CONNECT</h4>
            <div className="footer-socials">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                >
                  <span className="footer-social-icon" aria-hidden="true">{social.icon}</span>
                  <span className="footer-social-name">{social.name}</span>
                  <span className="footer-social-handle">{social.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>© {currentYear} SeChiro. All rights reserved.</span>
            <span className="footer-divider" aria-hidden="true">•</span>
            <span>Drawn with care & a lot of heart ✿</span>
          </div>
          <div className="footer-bottom-right">
            {/* STUDIO REMOVED */}
{/* <a href="/studio" className="footer-admin-link">STUDIO ↗</a> */}
            <a href="#top" className="footer-top-btn" aria-label="Back to top">TOP ↑</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
