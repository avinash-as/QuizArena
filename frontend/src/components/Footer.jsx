import { Link } from 'react-router-dom'
import { FiTwitter, FiGithub, FiInstagram, FiYoutube, FiShield, FiZap, FiAward } from 'react-icons/fi'

const LINKS = {
  Product: [
    { label: 'Live Contests', to: '/contests' },
    { label: 'Practice',       to: '/categories' },
    { label: 'Leaderboard',    to: '/leaderboard' },
    { label: 'Wallet',         to: '/wallet' },
  ],
  Company: [
    { label: 'About',   to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Terms of Use',  to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Refund Policy',  to: '/refund' },
    { label: 'Fair Play',      to: '/fair-play' },
  ],
}

const SOCIAL = [
  { icon: FiTwitter,   href: '#', label: 'Twitter' },
  { icon: FiGithub,    href: '#', label: 'GitHub' },
  { icon: FiInstagram, href: '#', label: 'Instagram' },
  { icon: FiYoutube,   href: '#', label: 'YouTube' },
]

const TRUST = [
  { icon: FiShield, label: '100% Secure Payments' },
  { icon: FiZap,    label: 'Instant Withdrawals' },
  { icon: FiAward,  label: 'Skill-Based · Legal in India' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-elevated/40" data-testid="site-footer">
      {/* Trust strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRUST.map(t => (
            <div key={t.label} className="flex items-center gap-3 text-sm text-muted">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center">
                <t.icon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-fg">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-black">Q</div>
              <span className="text-lg font-black text-fg">Quiz<span className="text-brand-500">Pitara</span></span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              India's premier skill-based quiz platform. Compete, learn, and win real cash prizes in daily contests across 100+ categories.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg bg-subtle border border-border text-muted hover:text-brand-500 hover:border-brand-500/40 hover:bg-brand-500/5 flex items-center justify-center transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-soft mb-4">{heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-muted hover:text-brand-500 transition">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-soft">
          <p>© {new Date().getFullYear()} QuizPitara. All rights reserved. Made in India 🇮🇳</p>
          <p className="text-[11px]">Games of skill. 18+ only. Play responsibly.</p>
        </div>
      </div>
    </footer>
  )
}
