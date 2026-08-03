export default function Refund() {
  const sections = [
    { title: 'No Real-Money Purchases', body: 'QuizPitara is free to play. We do not charge entry fees, accept deposits, or sell virtual currency for real money anywhere in the app. Because no payments are collected, there is nothing to refund.' },
    { title: 'In-App Purchases (if introduced)', body: "If QuizPitara ever introduces optional in-app purchases (for example, cosmetic items or an ad-free subscription), these will be processed exclusively through Google Play Billing. Any such purchases would then be subject to Google Play's own refund policy, not a QuizPitara-specific one — see Google Play's Help Center for how to request a refund on a Play Store purchase." },
    { title: 'Advertising', body: 'QuizPitara may show ads to support the free experience. Ad viewing is not a purchase and is not eligible for any refund.' },
    { title: 'Questions', body: 'If you believe you were charged unexpectedly, please contact support@QuizPitara.in and we will look into it.' },
  ]
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
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
