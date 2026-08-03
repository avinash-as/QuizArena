import { motion } from 'framer-motion'
import avinashImg from '../assets/avinash.jpeg'
import anamikaImg from '../assets/anamika.jpeg'

const TEAM = [
  {
    name: 'Avinash Yadav',
    role: 'CEO & Co-founder',
    avatar: avinashImg,
  },
  {
    name: 'Anamika Gupta',
    role: 'CTO & Co-founder',
    avatar: anamikaImg,
  },
]

const VALUES = [
  { emoji: '🧠', title: 'Curiosity first',    desc: 'We believe every person is infinitely more interesting when they never stop learning.' },
  { emoji: '🏆', title: 'Healthy competition', desc: 'Competition done right pushes everyone up. We build for the joy of the game, not ego.' },
  { emoji: '🔒', title: 'Trust & safety',      desc: 'No dark patterns, no ads, no selling your data. We earn your trust the hard way.' },
]

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="section-label mb-4 block">Our story</span>

            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white mb-5">
              Making Learning Fun Through Competition
            </h1>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            QuizPitara is an interactive quiz platform built to make learning engaging,
            competitive, and rewarding. We believe knowledge grows faster when learning
            feels like a game. Our mission is to help students and learners challenge
            themselves, track progress, and compete with others in a fun environment.
          </p>
        </div>


        <div className="d11-card p-8 mb-20 text-center">
              <h2 className="text-3xl font-display font-extrabold mb-4 text-white">
                Our Mission
              </h2>

              <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                We aim to transform traditional learning into an exciting experience through
                quizzes, leaderboards, achievements, and real-time challenges. Our goal is
                to create a platform where anyone can learn, compete, and grow every day.
              </p>
         </div>

       
        {/* Team */}
        <div className="text-center mb-10">
          <span className="section-label mb-3 block">The team</span>
          <h2 className="text-3xl font-display font-extrabold text-white">Meet the builders</h2>
        </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="d11-card p-5 text-center"
            >
              <img src={m.avatar} alt={m.name} className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-indigo-500 shadow-xl" />
              <div className="font-display font-bold text-white text-sm">{m.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.role}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-4">
                <a
                  href="https://www.linkedin.com/in/avinashhhh/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-xs"
                >
                  LinkedIn
                </a>

                <a
                  href="https://github.com/avinash-as"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg border text-xs"
                >
                  GitHub
                </a>
         </div>

        {/* Numbers */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
              { value: '2026', label: 'Founded' },
              { value: '2', label: 'Founders' },
              { value: '100+', label: 'Questions Added' },
              { value: '∞', label: 'Learning Opportunities' },
            ]
          .map(s => (
            <div key={s.label} className="d11-card p-6">
              <div className="text-3xl font-display font-extrabold text-[#22c55e]">{s.value}</div>
              <div className="text-sm text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

            <div className="text-center mt-24">
                <h2 className="text-3xl font-display font-extrabold mb-4">
                  Join the QuizPitara Community
                </h2>

                <p className="text-gray-400 mb-6">
                  Challenge yourself, compete with friends, and make learning exciting.
                </p>
{/* 
                <button className="btn-green">
                  Start Playing
                </button> */}
             </div>


      </motion.div>
    </div>
  )
}

