export default function Terms() {
  const sections = [
    { title: '1. Acceptance of Terms', body: 'By accessing or using QuizArena, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access the service.' },
    { title: '2. Eligibility', body: 'You must be at least 13 years old to use QuizArena. Users under 18 should have parental consent. QuizArena is a free-to-play skill-based quiz game — no real-money entry fees, deposits, or withdrawals are involved anywhere in the app.' },
    { title: '3. Account Registration', body: 'You are responsible for maintaining the confidentiality of your credentials. Provide accurate information during registration. One person may only create one account. Multiple accounts will result in permanent suspension.' },
    { title: '4. Skill-Based Games', body: "QuizArena hosts skill-based quiz contests for entertainment. Success depends on the player's knowledge, speed, and accuracy. These are not games of chance, and QuizArena does not offer gambling or wagering in any form." },
    { title: '5. Virtual Coins', body: 'Coins are an in-app virtual currency used only to enter quizzes and contests and to track your standing on the leaderboard. Coins have no real-world monetary value, cannot be purchased with real money, cannot be exchanged or transferred between users, and cannot be redeemed, cashed out, or withdrawn under any circumstance. Coins earned through gameplay, daily bonuses, and streaks exist solely within the app.' },
    { title: '6. Fair Play', body: 'Any cheating including bots, multiple accounts, or answer-sharing will result in immediate suspension and forfeiture of all coins. QuizArena employs anti-cheat monitoring to protect fair competition.' },
    { title: '7. Changes to the Service', body: 'We may update features, quiz content, or these Terms from time to time. Continued use of QuizArena after changes are posted constitutes acceptance of the updated Terms.' },
    { title: '8. Governing Law', body: 'These Terms are governed by the laws of India. Disputes shall be subject to courts in Bangalore, Karnataka.' },
  ]
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-gray-400 mb-8">Last updated: July 2026</p>
        {sections.map(s => (
          <div key={s.title} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-3">{s.title}</h2>
            <p className="text-gray-300 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
