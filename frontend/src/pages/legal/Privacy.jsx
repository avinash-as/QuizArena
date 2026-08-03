export default function Privacy() {
  const sections = [
    { title: 'Information We Collect', body: 'We collect information you provide directly (name, email, password), usage data (quiz attempts, scores, streaks, leaderboard standing), and basic technical data (device type, app version, crash logs) needed to run the app. We do not collect financial or government-ID information (no PAN, Aadhaar, or bank details) because QuizPitara has no deposits, withdrawals, or KYC requirements.' },
    { title: 'How We Use It', body: 'We use your data to provide the quiz and contest features, maintain leaderboards, detect cheating and abuse, send you notifications about contests and results, and improve the app.' },
    { title: 'Data Security', body: 'We use encryption in transit, bcrypt password hashing, and JWT-based authentication to protect your account.' },
    { title: 'Data Sharing', body: 'We do not sell your data. We may share limited data with service providers who help us run the app (e.g. hosting, analytics, crash reporting, ad networks if enabled) and with law enforcement when legally required. We do not share data with payment processors or KYC providers, since none are used.' },
    { title: 'Advertising', body: "If QuizPitara displays ads, our ad partners may collect data as described in their own privacy policies, in line with Google Play's Families and advertising ID policies where applicable." },
    { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal data, including deleting your account entirely from within the app or by contacting privacy@QuizPitara.in.' },
    { title: 'Retention', body: 'Account and gameplay data is retained until you delete your account. We do not retain financial transaction records, since QuizPitara does not process real-money transactions.' },
  ]
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
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
