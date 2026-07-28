// import { motion } from 'framer-motion'
// import { HiOutlineFire, HiOutlineStar, HiOutlineChartBar } from 'react-icons/hi'

// export default function ProfileCard({ user }) {
//   const xpPercent = Math.round((user.xp / user.xpNext) * 100)

//   return (
//     <div className="d11-card p-6">
//       {/* Avatar + badge */}
//       <div className="flex items-start gap-4">
//         <div className="relative">
//           <img
//             src={user.avatar}
//             alt={user.name}
//             className="w-20 h-20 rounded-2xl ring-4 ring-brand-100 dark:ring-brand-900 bg-brand-50"
//           />
//           <span className="absolute -bottom-1 -right-1 text-lg">
//             {user.rank === 'Gold' ? '🥇' : user.rank === 'Silver' ? '🥈' : '🥉'}
//           </span>
//         </div>

//         <div className="flex-1 min-w-0">
//           <h2 className="text-xl font-display font-bold text-white truncate">{user.name}</h2>
//           <p className="text-sm text-gray-400 truncate">{user.email}</p>
//           <div className="flex flex-wrap gap-2 mt-2">
//             <span className="text-xs px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 font-medium">
//               Level {user.level}
//             </span>
//             <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
//               {user.rank} Rank
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* XP bar */}
//       <div className="mt-5">
//         <div className="flex justify-between text-xs text-gray-400 mb-1.5">
//           <span>XP Progress</span>
//           <span>{user.xp.toLocaleString()} / {user.xpNext.toLocaleString()}</span>
//         </div>
//         <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden">
//           <motion.div
//             className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
//             initial={{ width: 0 }}
//             animate={{ width: `${xpPercent}%` }}
//             transition={{ duration: 1, ease: 'easeOut' }}
//           />
//         </div>
//       </div>

//       {/* Stats row */}
//       <div className="mt-5 grid grid-cols-3 gap-3">
//         <StatChip icon={<HiOutlineChartBar />} value={user.quizzesPlayed} label="Played" color="text-blue-500" />
//         <StatChip icon={<HiOutlineStar />}     value={user.quizzesWon}    label="Won"    color="text-amber-500" />
//         <StatChip icon={<HiOutlineFire />}     value={`${user.streak}d`}  label="Streak" color="text-red-500" />
//       </div>

//       {/* Achievements */}
//       {user.achievements?.length > 0 && (
//         <div className="mt-5">
//           <p className="text-xs font-mono font-medium uppercase tracking-widest text-gray-500 mb-3">Achievements</p>
//           <div className="flex flex-wrap gap-2">
//             {user.achievements.map(a => (
//               <span
//                 key={a}
//                 className="text-xs px-2.5 py-1 rounded-lg bg-[#111] text-gray-300 font-medium"
//               >
//                 🏆 {a}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function StatChip({ icon, value, label, color }) {
//   return (
//     <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#111]">
//       <span className={`text-lg ${color}`}>{icon}</span>
//       <span className="text-base font-display font-bold text-white">{value}</span>
//       <span className="text-xs text-gray-400">{label}</span>
//     </div>
//   )
// }


import { motion } from 'framer-motion'
import { HiOutlineFire, HiOutlineStar, HiOutlineChartBar } from 'react-icons/hi'

export default function ProfileCard({ user }) {
  if (!user) return null

  // Safe values — backend field names mapped correctly
  const xp = user.xp || 0
  const xpForNextLevel = 500
  const xpInCurrentLevel = xp % xpForNextLevel
  const xpPercent = Math.round((xpInCurrentLevel / xpForNextLevel) * 100)
  const level = user.level || 1
  const quizzesPlayed = user.totalQuizzesPlayed || 0
  const wins = user.totalWins || 0
  const streak = user.streak || 0

  const rankLabel = wins >= 10 ? 'Gold' : wins >= 5 ? 'Silver' : 'Bronze'
  const rankEmoji = rankLabel === 'Gold' ? '🥇' : rankLabel === 'Silver' ? '🥈' : '🥉'

  return (
    <div className="d11-card p-6">
      {/* Avatar + badge */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={user.avatar || `https://api.dicebear.com/8.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-20 h-20 rounded-2xl ring-4 ring-brand-100 dark:ring-brand-900 bg-brand-50"
          />
          <span className="absolute -bottom-1 -right-1 text-lg">{rankEmoji}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-display font-bold text-white truncate">{user.name}</h2>
          <p className="text-sm text-gray-400 truncate">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 font-medium">
              Level {level}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
              {rankLabel} Rank
            </span>
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>XP Progress</span>
          <span>{xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()}</span>
        </div>
        <div className="w-full h-2 bg-[#111] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatChip icon={<HiOutlineChartBar />} value={quizzesPlayed} label="Played" color="text-blue-500" />
        <StatChip icon={<HiOutlineStar />}     value={wins}          label="Won"    color="text-amber-500" />
        <StatChip icon={<HiOutlineFire />}     value={`${streak}d`}  label="Streak" color="text-red-500" />
      </div>

      {/* Achievements */}
      {user.achievements?.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-mono font-medium uppercase tracking-widest text-gray-500 mb-3">Achievements</p>
          <div className="flex flex-wrap gap-2">
            {user.achievements.map(a => (
              <span key={a} className="text-xs px-2.5 py-1 rounded-lg bg-[#111] text-gray-300 font-medium">
                🏆 {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatChip({ icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#111]">
      <span className={`text-lg ${color}`}>{icon}</span>
      <span className="text-base font-display font-bold text-white">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}