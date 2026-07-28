// A curated list of common disposable/temporary email domains. There's no
// free, always-available live API for this without a paid third-party
// service, and this app has no network egress to one configured — a static,
// periodically-updated list is the standard practical approach most apps
// actually ship with. It won't catch every disposable provider (new ones
// appear constantly), but it blocks the overwhelming majority of what
// spam/fraud signups actually use in practice.
//
// To extend: add new domains (lowercase, no @) to the Set below.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'yopmail.com', 'yopmail.fr', 'throwawaymail.com', 'trashmail.com', 'trashmail.net',
  'getnada.com', 'maildrop.cc', 'mintemail.com', 'mailnesia.com', 'mytemp.email',
  'sharklasers.com', 'guerrillamailblock.com', 'spam4.me', 'moakt.com',
  'fakeinbox.com', 'dispostable.com', 'mailcatch.com', 'tempinbox.com',
  'emailondeck.com', 'discard.email', 'discardmail.com', 'spamgourmet.com',
  'tempr.email', 'burnermail.io', 'mail-temporaire.fr', 'jetable.org',
  '33mail.com', 'anonbox.net', 'mohmal.com', 'moakt.cc', 'inboxbear.com',
])

exports.isDisposableEmail = (email) => {
  const domain = (email || '').split('@')[1]?.toLowerCase().trim()
  if (!domain) return false
  return DISPOSABLE_DOMAINS.has(domain)
}