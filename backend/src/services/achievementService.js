const { AchievementDefinition, UserAchievement } = require('../models/Achievement')
const { creditCoins } = require('./walletService')
const Notification = require('../models/Notification')

/**
 * Check all achievement conditions for a user and unlock any newly met ones.
 * Returns array of newly unlocked achievements.
 */
const checkAchievements = async (user) => {
  const allDefs = await AchievementDefinition.find()
  const existing = await UserAchievement.find({ user: user._id }).select('achievement')
  const unlockedIds = new Set(existing.map(a => a.achievement.toString()))

  const newlyUnlocked = []

  for (const def of allDefs) {
    if (unlockedIds.has(def._id.toString())) continue

    const { condition } = def
    if (!condition?.field) continue

    let met = false
    const userVal = user[condition.field] ?? 0

    if (condition.type === 'gte') met = userVal >= condition.value
    else if (condition.type === 'eq') met = userVal === condition.value
    else if (condition.type === 'streak') met = (user.streak || 0) >= condition.value

    if (met) {
      await UserAchievement.create({ user: user._id, achievement: def._id })

      // Grant rewards
      if (def.coinsReward > 0) {
        await creditCoins(user._id, def.coinsReward, 'achievement_bonus', `Achievement: ${def.title}`, def._id, 'Achievement')
      }
      if (def.xpReward > 0) {
        user.xp = (user.xp || 0) + def.xpReward
        user.syncLevel()
        await user.save()
      }

      // Notify
      await Notification.create({
        user: user._id,
        title: '🏆 Achievement Unlocked!',
        message: `You earned "${def.title}" — ${def.description}`,
        type: 'achievement',
      })

      newlyUnlocked.push(def)
    }
  }

  return newlyUnlocked
}

module.exports = { checkAchievements }
