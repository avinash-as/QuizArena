const mongoose = require('mongoose')

const achievementDefinitionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  coinsReward: { type: Number, default: 0 },
  xpReward: { type: Number, default: 50 },
  condition: {
    field: { type: String }, // e.g. 'totalWins', 'totalQuizzesPlayed'
    value: { type: Number },
    type: { type: String, enum: ['gte', 'eq', 'streak'] },
  },
}, { timestamps: true })

const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'AchievementDefinition', required: true },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true })

userAchievementSchema.index({ user: 1 })

module.exports = {
  AchievementDefinition: mongoose.model('AchievementDefinition', achievementDefinitionSchema),
  UserAchievement: mongoose.model('UserAchievement', userAchievementSchema),
}
