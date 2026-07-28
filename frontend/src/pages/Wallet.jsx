import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { walletAPI } from '../services/api'
import { FiArrowDown, FiArrowUp, FiGift, FiTrendingUp } from 'react-icons/fi'
import { HiOutlineSparkles, HiArrowRight } from 'react-icons/hi'

function SkelRow() {
  return (
    <div className="qa-card p-4 flex items-center gap-4">
      <div className="skeleton w-10 h-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-3/5" />
        <div className="skeleton h-2 w-1/3" />
      </div>
      <div className="skeleton h-5 w-16" />
    </div>
  )
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [claiming, setClaiming] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await walletAPI.get()
      setWallet(data)
      setTransactions(data.transactions || [])
    } catch (e) { setMsg({ text: 'Failed to load wallet', type: 'error' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDailyBonus = async () => {
    if (!wallet?.dailyAvailable || claiming) return
    setClaiming(true)
    try {
      const { data } = await walletAPI.claimDailyBonus()
      setMsg({ text: `🎁 Claimed ${data.coins} coins · streak ${data.streak} day${data.streak > 1 ? 's' : ''}!`, type: 'success' })
      load()
    } catch (e) { setMsg({ text: e.response?.data?.message || 'Error', type: 'error' }) }
    finally { setClaiming(false) }
  }

  const filteredTx = transactions.filter(t => filter === 'all' || t.type === filter)
  const winning = wallet?.wallet?.winningBalance || 0
  const bonus   = wallet?.wallet?.bonusBalance   || 0
  const total   = winning + bonus

  return (
    <div className="min-h-screen text-fg pb-24 lg:pb-8" data-testid="wallet-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <p className="section-label mb-2">Balance</p>
            <h1 className="text-3xl sm:text-4xl font-black">Coin wallet</h1>
            <p className="text-muted text-sm mt-1 max-w-lg">Coins are used to enter contests and quizzes. Winning coins come from contests; bonus coins from daily streaks & referrals.</p>
          </div>
        </div>

        {msg.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm border ${msg.type === 'success' ? 'bg-brand-500/10 border-brand-500/30 text-brand-500' : 'bg-coral-500/10 border-coral-500/30 text-coral-500'}`} data-testid="wallet-msg">
            {msg.text}
          </div>
        )}

        {/* Balance hero card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="qa-card overflow-hidden mb-6 relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.15),_transparent_60%)]" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">Total balance</p>
                {loading ? <div className="skeleton h-10 w-40" /> : (
                  <p className="text-4xl font-black text-fg tabular-nums">🪙 {total.toLocaleString()}</p>
                )}
              </div>
              <span className="badge-gold">
                <HiOutlineSparkles className="w-3 h-3" /> Level {wallet?.level || 1}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="qa-card p-4 bg-subtle/70" data-testid="winning-balance">
                <div className="flex items-center gap-2 text-brand-500 mb-1">
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">Winnings</span>
                </div>
                <p className="text-xl font-black tabular-nums">🪙 {winning.toLocaleString()}</p>
              </div>
              <div className="qa-card p-4 bg-subtle/70" data-testid="bonus-balance">
                <div className="flex items-center gap-2 text-gold-500 mb-1">
                  <FiGift className="w-4 h-4" />
                  <span className="text-[11px] font-mono uppercase tracking-widest">Bonus</span>
                </div>
                <p className="text-xl font-black tabular-nums">🪙 {bonus.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily bonus */}
        <div
          className={`qa-card p-4 mb-6 flex items-center justify-between gap-4 flex-wrap ${wallet?.dailyAvailable ? 'ring-1 ring-brand-500/30' : ''}`}
          data-testid="daily-bonus-card"
        >
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${wallet?.dailyAvailable ? 'bg-brand-500/12 text-brand-500 border border-brand-500/25' : 'bg-subtle text-soft border border-border'}`}>
              <FiGift className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">{wallet?.dailyAvailable ? '🎁 Daily bonus available' : 'Bonus claimed today'}</p>
              <p className="text-xs text-muted">Current streak · {wallet?.streak || 0} day{(wallet?.streak || 0) === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            onClick={handleDailyBonus}
            disabled={!wallet?.dailyAvailable || claiming}
            data-testid="claim-daily-bonus"
            className={wallet?.dailyAvailable ? 'btn-green h-10 px-4' : 'btn-outline h-10 px-4'}
          >
            {claiming ? 'Claiming…' : wallet?.dailyAvailable ? 'Claim now' : 'Come back tomorrow'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-border">
          {[
            { k: 'overview',     l: 'Overview' },
            { k: 'transactions', l: `Transactions · ${transactions.length}` },
          ].map(t => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              data-testid={`wallet-tab-${t.k}`}
              className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-semibold transition ${tab === t.k ? 'text-brand-500 border-brand-500' : 'text-muted border-transparent hover:text-fg'}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="qa-card p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">🎯 How it works</h3>
              <ul className="space-y-2.5 text-sm text-muted">
                <li className="flex gap-2"><span className="text-brand-500">✓</span> Enter contests using your coin balance.</li>
                <li className="flex gap-2"><span className="text-brand-500">✓</span> Win coins by placing on the leaderboard.</li>
                <li className="flex gap-2"><span className="text-brand-500">✓</span> Come back daily to keep your bonus streak.</li>
                <li className="flex gap-2"><span className="text-brand-500">✓</span> Earn 🪙200 for every friend you refer.</li>
              </ul>
            </div>
            <div className="qa-card p-5 relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-transparent to-gold-500/10 border-brand-500/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">🚀 Ready to play?</h3>
              <p className="text-sm text-muted mb-4">Live contests with real cash prizes are running right now.</p>
              <Link to="/contests" data-testid="wallet-contests-cta" className="btn-green h-10 px-4">
                Browse contests <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {tab === 'transactions' && (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { k: 'all',    l: 'All' },
                { k: 'credit', l: '+ Credits' },
                { k: 'debit',  l: '− Debits' },
              ].map(f => (
                <button key={f.k} onClick={() => setFilter(f.k)}
                  data-testid={`tx-filter-${f.k}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${filter === f.k ? 'bg-brand-500 text-white' : 'bg-elevated border border-border text-muted hover:text-fg'}`}>
                  {f.l}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(4)].map((_, i) => <SkelRow key={i} />)}</div>
            ) : filteredTx.length === 0 ? (
              <div className="qa-card p-10 text-center">
                <div className="text-4xl mb-2">📃</div>
                <p className="font-semibold">No transactions {filter !== 'all' ? `of type '${filter}'` : 'yet'}</p>
                <p className="text-muted text-sm mt-1">Play a contest or claim your daily bonus to see activity.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTx.map(tx => (
                  <div key={tx._id} className="qa-card p-4 flex items-center gap-4" data-testid="tx-row">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-brand-500/10 text-brand-500 border border-brand-500/25' : 'bg-coral-500/10 text-coral-500 border border-coral-500/25'}`}>
                      {tx.type === 'credit' ? <FiArrowDown /> : <FiArrowUp />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-fg truncate">{tx.description}</p>
                      <p className="text-xs text-muted mt-0.5">
                        <span className="capitalize">{tx.category}</span> · {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <p className={`font-black text-sm tabular-nums shrink-0 ${tx.type === 'credit' ? 'text-brand-500' : 'text-coral-500'}`}>
                      {tx.type === 'credit' ? '+' : '−'}🪙{tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
