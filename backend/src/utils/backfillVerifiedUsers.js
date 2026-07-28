// One-time migration — run this ONCE, right after deploying the email
// verification feature, BEFORE any real user tries to log in.
//
// Why this exists: the User model now defaults isEmailVerified to false.
// Mongoose applies schema defaults to existing documents that don't have
// the field yet, which means every user who signed up before this feature
// existed would suddenly be treated as unverified and blocked from login —
// even though they never had a chance to verify anything. This script
// grandfathers them in.
//
// Usage (from backend/ folder):
//   node src/utils/backfillVerifiedUsers.js
//
// Safe to run multiple times (only touches users where isEmailVerified is
// not already true).

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

const run = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('MONGO_URI is not set in backend/.env')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log(`Connected to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`)

  const result = await User.updateMany(
    { isEmailVerified: { $ne: true } },
    { $set: { isEmailVerified: true } }
  )

  console.log(`✅ Grandfathered ${result.modifiedCount} existing user(s) as email-verified.`)
  console.log('New signups from now on will go through real verification.')
  process.exit(0)
}

run().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})