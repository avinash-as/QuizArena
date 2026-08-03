export default function FairPlay() {
  const sections = [
    { title: '✅ Fair Play', body: 'Play independently using genuine knowledge. Submit answers without external help. Play on a single registered account. Do not share contest questions during the contest.' },
    { title: '🚫 Prohibited', body: 'Using bots or automated tools, looking up answers online, creating multiple accounts, sharing answers, exploiting bugs, using VPNs to bypass restrictions, or impersonating other users.' },
    { title: '🔍 How We Detect Violations', body: 'Our anti-cheat system monitors submission speed, tab switching, IP analysis for multiple accounts, device fingerprinting, and unusual score patterns.' },
    { title: '⚖️ Consequences', body: 'Warning → Temporary suspension with forfeiture of winnings → Permanent ban with forfeiture of all balance and reporting to authorities for significant fraud.' },
    { title: '📢 Reporting', body: 'Report cheating via the in-app feature or email fairplay@QuizPitara.in. Include the contest ID, username, and nature of suspected violation. All reports are investigated manually.' },
    { title: '🏆 Our Commitment', body: 'We review all flagged cases before taking action. You may appeal any decision by contacting support@QuizPitara.in within 7 days.' },
  ]
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fair Play Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: June 2025</p>
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
