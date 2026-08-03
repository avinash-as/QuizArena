// One-off utility: promote an existing user to admin role.
// Does NOT delete or touch any other data.
//
// Usage (from backend/ folder):
//   node src/utils/promoteAdmin.js admin@QuizPitara.io
//
// Uses the same MONGO_URI your live server connects to (backend/.env),
// so this guarantees you're editing the right database.

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

const email = process.argv[2]

if (!email) {
  console.error('Usage: node src/utils/promoteAdmin.js <email>')
  process.exit(1)
}

const run = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('MONGO_URI is not set in backend/.env — cannot know which database to edit.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log(`Connected to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`)

  const user = await User.findOne({ email: email.toLowerCase().trim() })
  if (!user) {
    console.error(`No user found with email "${email}" in this database.`)
    console.error('That confirms it: your server is pointed at a different MONGO_URI than you expect.')
    process.exit(1)
  }

  console.log(`Found user: ${user.name} <${user.email}> — current role: "${user.role}"`)

  if (user.role === 'admin' || user.role === 'super_admin') {
    console.log('Already an admin. Nothing to do.')
    console.log('If /admin still redirects you home, the problem is a stale token — log out, clear the browser\'s localStorage, and log back in.')
    process.exit(0)
  }

  user.role = 'admin'
  await user.save()

  console.log(`✅ ${email} promoted to role: "admin"`)
  console.log('Now: log out completely (or clear localStorage qa_token), then log back in so a fresh JWT + user object are issued.')
  process.exit(0)
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})