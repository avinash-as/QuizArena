import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMail, HiOutlineChatAlt2, HiOutlineDocumentText } from 'react-icons/hi'

const CONTACT_OPTIONS = [
  { icon: <HiOutlineMail className="w-6 h-6" />, title: 'Email support', desc: 'Average reply time: 4 hours', cta: 'hello@quizarena.io', href: 'mailto:hello@quizarena.io', color: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' },
  { icon: <HiOutlineChatAlt2 className="w-6 h-6" />, title: 'Live chat', desc: 'Available Mon–Fri, 9am–6pm UTC', cta: 'Open chat', href: '#', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { icon: <HiOutlineDocumentText className="w-6 h-6" />, title: 'Documentation', desc: 'Browse our help articles', cta: 'Visit docs', href: '#', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="section-label mb-3 block">Get in touch</span>
        <h1 className="text-4xl font-display font-extrabold text-white mb-2">Contact us</h1>
        <p className="text-gray-400 mb-10">We'd love to hear from you. What can we help you with?</p>

        {/* Contact options */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {CONTACT_OPTIONS.map(o => (
            <a
              key={o.title}
              href={o.href}
              className="d11-card p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${o.color}`}>
                {o.icon}
              </div>
              <h3 className="font-display font-bold text-white mb-1 text-sm">{o.title}</h3>
              <p className="text-xs text-gray-400 mb-3">{o.desc}</p>
              <span className="text-xs text-brand-500 dark:text-brand-400 font-medium group-hover:underline">{o.cta}</span>
            </a>
          ))}
        </div>

        {/* Contact form */}
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-display font-bold text-white mb-5">Send a message</h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="d11-card p-8 text-center"
              >
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-display font-bold text-white mb-2">Message sent!</h3>
                <p className="text-sm text-gray-400">We'll get back to you within 4 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name:'',email:'',subject:'',message:'' }) }} className="btn-outline mt-4 text-sm">
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="d11-card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Name</label>
                    <input type="text" value={form.name} onChange={set('name')} placeholder="Alex Mercer" required className="d11-input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Email</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="d11-input" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Subject</label>
                  <input type="text" value={form.subject} onChange={set('subject')} placeholder="How can we help?" required className="d11-input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">Message</label>
                  <textarea
                    value={form.message} onChange={set('message')}
                    rows={5} placeholder="Tell us more…" required
                    className="d11-input resize-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-green w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-display font-bold text-white mb-5">FAQs</h2>
            <div className="space-y-4">
              {[
                { q: 'Is QuizArena free?', a: 'Yes — completely free to play, forever.' },
                { q: 'Can I create my own quiz?', a: 'Quiz creation is coming in our next major update.' },
                { q: 'How is the score calculated?', a: 'Score = accuracy × speed bonus. Answer fast and correctly!' },
                { q: 'Can I play on mobile?', a: 'Absolutely — QuizArena is built mobile-first.' },
              ].map(f => (
                <div key={f.q} className="d11-card p-4">
                  <h4 className="font-display font-bold text-white text-sm mb-1">{f.q}</h4>
                  <p className="text-xs text-gray-400">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
