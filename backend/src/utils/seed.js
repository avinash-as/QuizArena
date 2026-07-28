// require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
// const mongoose = require('mongoose')
// const User = require('../models/User')
// const Quiz = require('../models/Quiz')
// const Contest = require('../models/Contest')
// const { AchievementDefinition } = require('../models/Achievement')

// const seed = async () => {
//   const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/quizarena'
//   await mongoose.connect(uri)
//   console.log('Connected to MongoDB')

//   await Promise.all([User.deleteMany(), Quiz.deleteMany(), Contest.deleteMany(), AchievementDefinition.deleteMany()])
//   console.log('Cleared existing data')

//   const admin = await User.create({
//     name: 'Admin', email: 'admin@quizarena.io', password: 'admin123',
//     role: 'admin', coins: 9999, avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=admin',
//   })
//   await User.create({
//     name: 'Test User', email: 'test@quizarena.io', password: 'test1234',
//     coins: 500, avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=testuser',
//     totalQuizzesPlayed: 12, totalContestsJoined: 5, totalWins: 2, streak: 3, xp: 1200, level: 3,
//   })
//   console.log('Users created')

//   await AchievementDefinition.insertMany([
//     { key: 'first_quiz',  title: 'First Quiz',      description: 'Complete your first quiz',    icon: '🎯', coinsReward: 20,  xpReward: 50,  condition: { field: 'totalQuizzesPlayed', value: 1,  type: 'gte' } },
//     { key: 'quiz_10',     title: 'Quiz Enthusiast', description: 'Complete 10 quizzes',         icon: '📚', coinsReward: 50,  xpReward: 100, condition: { field: 'totalQuizzesPlayed', value: 10, type: 'gte' } },
//     { key: 'quiz_50',     title: 'Quiz Master',     description: 'Complete 50 quizzes',         icon: '🎓', coinsReward: 200, xpReward: 500, condition: { field: 'totalQuizzesPlayed', value: 50, type: 'gte' } },
//     { key: 'first_win',   title: 'First Win',       description: 'Win your first contest',      icon: '🏆', coinsReward: 100, xpReward: 200, condition: { field: 'totalWins', value: 1, type: 'gte' } },
//     { key: 'streak_7',    title: '7-Day Streak',    description: 'Login 7 days in a row',       icon: '🔥', coinsReward: 150, xpReward: 300, condition: { field: 'streak', value: 7, type: 'streak' } },
//     { key: 'contests_5',  title: 'Contestant',      description: 'Join 5 contests',             icon: '⚔️', coinsReward: 75,  xpReward: 150, condition: { field: 'totalContestsJoined', value: 5, type: 'gte' } },
//   ])
//   console.log('Achievements created')

//   const jsQuiz = await Quiz.create({
//     title: 'JavaScript Fundamentals', description: 'Test your core JS knowledge',
//     category: 'javascript', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
//     questions: [
//       { text: 'What is the output of typeof null?', options: ['"null"','"object"','"undefined"','"boolean"'], correctIndex: 1, explanation: 'typeof null returns "object" — a well-known JavaScript quirk.', points: 10 },
//       { text: 'Which method removes the last element from an array?', options: ['shift()','pop()','splice()','slice()'], correctIndex: 1, explanation: 'pop() removes and returns the last element.', points: 10 },
//       { text: 'What does === check?', options: ['Value only','Type only','Value and type','Reference'], correctIndex: 2, explanation: 'Strict equality checks both value and type without coercion.', points: 10 },
//       { text: 'What is a closure?', options: ['A function with no return','A function that remembers its outer scope','An IIFE','A function without parameters'], correctIndex: 1, explanation: 'A closure retains access to its outer lexical scope.', points: 15 },
//       { text: 'What does Array.prototype.map() return?', options: ['The original array','A new array','undefined','A boolean'], correctIndex: 1, explanation: 'map() always returns a new array of the same length.', points: 10 },
//     ],
//   })

//   const reactQuiz = await Quiz.create({
//     title: 'React Essentials', description: 'Core React concepts and hooks',
//     category: 'react', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
//     questions: [
//       { text: 'What hook is used for side effects in React?', options: ['useState','useEffect','useContext','useReducer'], correctIndex: 1, explanation: 'useEffect handles side effects like data fetching.', points: 10 },
//       { text: 'What is the virtual DOM?', options: ['A copy of the real DOM in memory','A database','A CSS layer','A browser API'], correctIndex: 0, explanation: 'React keeps a lightweight in-memory representation of the DOM.', points: 10 },
//       { text: 'What does useCallback do?', options: ['Memoizes a value','Memoizes a function','Creates a ref','Triggers re-render'], correctIndex: 1, explanation: 'useCallback returns a memoized function that only changes if its dependencies change.', points: 15 },
//     ],
//   })

//   const generalQuiz = await Quiz.create({
//     title: 'General Knowledge Challenge', description: 'Test your general knowledge!',
//     category: 'general', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
//     questions: [
//       { text: 'What is the capital of India?', options: ['Mumbai','New Delhi','Kolkata','Chennai'], correctIndex: 1, explanation: 'New Delhi is the capital of India.', points: 10 },
//       { text: 'How many planets are in our solar system?', options: ['7','8','9','10'], correctIndex: 1, explanation: 'There are 8 planets since Pluto was reclassified in 2006.', points: 10 },
//       { text: 'Who invented the telephone?', options: ['Thomas Edison','Nikola Tesla','Alexander Graham Bell','James Watt'], correctIndex: 2, explanation: 'Alexander Graham Bell is credited with inventing the telephone in 1876.', points: 10 },
//       { text: 'What is the largest ocean on Earth?', options: ['Atlantic','Indian','Arctic','Pacific'], correctIndex: 3, explanation: 'The Pacific Ocean is the largest, covering more than 30% of Earth surface.', points: 10 },
//       { text: 'In what year did India gain independence?', options: ['1945','1946','1947','1948'], correctIndex: 2, explanation: 'India gained independence from British rule on August 15, 1947.', points: 10 },
//     ],
//   })
  
//   const scienceQuiz = await Quiz.create({
//     title: 'Science Fundamentals', description: 'Basic science questions for everyone!',
//     category: 'science', difficulty: 'easy', timeLimit: 300, createdBy: admin._id,
//     questions: [
//       { text: 'What is the chemical symbol for water?', options: ['WA','H2O','HO2','W2O'], correctIndex: 1, explanation: 'Water is H2O - 2 hydrogen atoms and 1 oxygen atom.', points: 10 },
//       { text: 'What gas do plants absorb from the air?', options: ['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], correctIndex: 2, explanation: 'Plants absorb CO2 during photosynthesis.', points: 10 },
//       { text: 'What is the speed of light?', options: ['3x10^8 m/s','3x10^6 m/s','3x10^10 m/s','3x10^4 m/s'], correctIndex: 0, explanation: 'Speed of light is approximately 3x10^8 meters per second.', points: 10 },
//       { text: 'What is the powerhouse of the cell?', options: ['Nucleus','Ribosome','Mitochondria','Golgi body'], correctIndex: 2, explanation: 'Mitochondria produce ATP energy for the cell.', points: 10 },
//       { text: 'What planet is known as the Red Planet?', options: ['Venus','Jupiter','Saturn','Mars'], correctIndex: 3, explanation: 'Mars appears red due to iron oxide (rust) on its surface.', points: 10 },
//     ],
//   })
//   console.log('Quizzes created')

//   const now = new Date()
//   await Contest.insertMany([
//     {
//       title: '⚡ JavaScript Speed Challenge', description: 'Fast-paced JS — answer quickly for bonus points!',
//       category: 'javascript', entryFee: 50, prizePool: 2000,
//       prizeBreakdown: [{ rank:1, label:'1st Place', coins:1000 },{ rank:2, label:'2nd Place', coins:600 },{ rank:3, label:'3rd Place', coins:400 }],
//       maxParticipants: 100, quiz: jsQuiz._id,
//       startTime: new Date(now.getTime() + 2*60*60*1000),
//       endTime:   new Date(now.getTime() + 3*60*60*1000),
//       status: 'UPCOMING', rules: ['Answer all questions in time','Faster = more bonus points'],
//       createdBy: admin._id, isFeatured: true, bannerColor: 'from-yellow-500 to-orange-500',
//     },
//     {
//       title: '⚛️ React Masters Cup', description: 'Prove your React expertise!',
//       category: 'react', entryFee: 100, prizePool: 5000,
//       prizeBreakdown: [{ rank:1, label:'1st Place', coins:2500 },{ rank:2, label:'2nd Place', coins:1500 },{ rank:3, label:'3rd Place', coins:1000 }],
//       maxParticipants: 200, quiz: reactQuiz._id,
//       startTime: new Date(now.getTime() - 30*60*1000),
//       endTime:   new Date(now.getTime() + 30*60*1000),
//       status: 'LIVE', rules: ['Complete all questions','Top 3 win prizes'],
//       createdBy: admin._id, isFeatured: true, bannerColor: 'from-violet-600 to-indigo-600',
//     },
//     {
//       title: '🆓 Daily Free Quiz', description: 'Free to enter — sharpen your skills!',
//       category: 'general', entryFee: 0, prizePool: 500,
//       prizeBreakdown: [{ rank:1, label:'1st Place', coins:300 },{ rank:2, label:'2nd Place', coins:200 }],
//       maxParticipants: 500, quiz: generalQuiz._id,
//       startTime: new Date(now.getTime() + 24*60*60*1000),
//       endTime:   new Date(now.getTime() + 25*60*60*1000),
//       status: 'UPCOMING', rules: ['Free entry','Top 2 win coins'],
//       createdBy: admin._id, bannerColor: 'from-green-500 to-teal-500',
//     },
//   ])
//   console.log('Contests created')
//   console.log('\n✅ Seed complete!')
//   console.log('Admin: admin@quizarena.io / admin123')
//   console.log('User:  test@quizarena.io  / test1234')
//   process.exit(0)
// }

// seed().catch(err => { console.error(err); process.exit(1) })





require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')
const Quiz = require('../models/Quiz')
const Contest = require('../models/Contest')
const { AchievementDefinition } = require('../models/Achievement')

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/quizarena'
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')

  await Promise.all([User.deleteMany(), Quiz.deleteMany(), Contest.deleteMany(), AchievementDefinition.deleteMany()])
  console.log('Cleared existing data')

  const admin = await User.create({
    name: 'Admin', email: 'admin@quizarena.io', password: 'admin123',
    role: 'admin', coins: 9999, avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=admin',
    isEmailVerified: true,
  })
  await User.create({
    name: 'Test User', email: 'test@quizarena.io', password: 'test1234',
    coins: 500, avatar: 'https://api.dicebear.com/8.x/avataaars/svg?seed=testuser',
    totalQuizzesPlayed: 12, totalContestsJoined: 5, totalWins: 2, streak: 3, xp: 1200, level: 3,
    isEmailVerified: true,
  })
  console.log('Users created')

  await AchievementDefinition.insertMany([
    { key: 'first_quiz',  title: 'First Quiz',      description: 'Complete your first quiz',    icon: '🎯', coinsReward: 20,  xpReward: 50,  condition: { field: 'totalQuizzesPlayed', value: 1,  type: 'gte' } },
    { key: 'quiz_10',     title: 'Quiz Enthusiast', description: 'Complete 10 quizzes',         icon: '📚', coinsReward: 50,  xpReward: 100, condition: { field: 'totalQuizzesPlayed', value: 10, type: 'gte' } },
    { key: 'quiz_50',     title: 'Quiz Master',     description: 'Complete 50 quizzes',         icon: '🎓', coinsReward: 200, xpReward: 500, condition: { field: 'totalQuizzesPlayed', value: 50, type: 'gte' } },
    { key: 'first_win',   title: 'First Win',       description: 'Win your first contest',      icon: '🏆', coinsReward: 100, xpReward: 200, condition: { field: 'totalWins', value: 1, type: 'gte' } },
    { key: 'streak_7',    title: '7-Day Streak',    description: 'Login 7 days in a row',       icon: '🔥', coinsReward: 150, xpReward: 300, condition: { field: 'streak', value: 7, type: 'streak' } },
    { key: 'contests_5',  title: 'Contestant',      description: 'Join 5 contests',             icon: '⚔️', coinsReward: 75,  xpReward: 150, condition: { field: 'totalContestsJoined', value: 5, type: 'gte' } },
  ])
  console.log('Achievements created')

  const jsQuiz = await Quiz.create({
    title: 'JavaScript Fundamentals', description: 'Test your core JS knowledge',
    category: 'javascript', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
    questions: [
      { text: 'What is the output of typeof null?', options: ['"null"','"object"','"undefined"','"boolean"'], correctIndex: 1, explanation: 'typeof null returns "object" — a well-known JavaScript quirk.', points: 10 },
      { text: 'Which method removes the last element from an array?', options: ['shift()','pop()','splice()','slice()'], correctIndex: 1, explanation: 'pop() removes and returns the last element.', points: 10 },
      { text: 'What does === check?', options: ['Value only','Type only','Value and type','Reference'], correctIndex: 2, explanation: 'Strict equality checks both value and type without coercion.', points: 10 },
      { text: 'What is a closure?', options: ['A function with no return','A function that remembers its outer scope','An IIFE','A function without parameters'], correctIndex: 1, explanation: 'A closure retains access to its outer lexical scope.', points: 15 },
      { text: 'What does Array.prototype.map() return?', options: ['The original array','A new array','undefined','A boolean'], correctIndex: 1, explanation: 'map() always returns a new array of the same length.', points: 10 },
    ],
  })

  const reactQuiz = await Quiz.create({
    title: 'React Essentials', description: 'Core React concepts and hooks',
    category: 'react', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
    questions: [
      { text: 'What hook is used for side effects in React?', options: ['useState','useEffect','useContext','useReducer'], correctIndex: 1, explanation: 'useEffect handles side effects like data fetching.', points: 10 },
      { text: 'What is the virtual DOM?', options: ['A copy of the real DOM in memory','A database','A CSS layer','A browser API'], correctIndex: 0, explanation: 'React keeps a lightweight in-memory representation of the DOM.', points: 10 },
      { text: 'What does useCallback do?', options: ['Memoizes a value','Memoizes a function','Creates a ref','Triggers re-render'], correctIndex: 1, explanation: 'useCallback returns a memoized function that only changes if its dependencies change.', points: 15 },
    ],
  })

  const generalQuiz = await Quiz.create({
    title: 'General Knowledge Challenge', description: 'Test your general knowledge!',
    category: 'general', difficulty: 'medium', timeLimit: 300, createdBy: admin._id,
    questions: [
      { text: 'What is the capital of India?', options: ['Mumbai','New Delhi','Kolkata','Chennai'], correctIndex: 1, explanation: 'New Delhi is the capital of India.', points: 10 },
      { text: 'How many planets are in our solar system?', options: ['7','8','9','10'], correctIndex: 1, explanation: 'There are 8 planets since Pluto was reclassified in 2006.', points: 10 },
      { text: 'Who invented the telephone?', options: ['Thomas Edison','Nikola Tesla','Alexander Graham Bell','James Watt'], correctIndex: 2, explanation: 'Alexander Graham Bell is credited with inventing the telephone in 1876.', points: 10 },
      { text: 'What is the largest ocean on Earth?', options: ['Atlantic','Indian','Arctic','Pacific'], correctIndex: 3, explanation: 'The Pacific Ocean is the largest, covering more than 30% of Earth surface.', points: 10 },
      { text: 'In what year did India gain independence?', options: ['1945','1946','1947','1948'], correctIndex: 2, explanation: 'India gained independence from British rule on August 15, 1947.', points: 10 },
    ],
  })
  
  const scienceQuiz = await Quiz.create({
    title: 'Science Fundamentals', description: 'Basic science questions for everyone!',
    category: 'science', difficulty: 'easy', timeLimit: 300, createdBy: admin._id,
    questions: [
      { text: 'What is the chemical symbol for water?', options: ['WA','H2O','HO2','W2O'], correctIndex: 1, explanation: 'Water is H2O - 2 hydrogen atoms and 1 oxygen atom.', points: 10 },
      { text: 'What gas do plants absorb from the air?', options: ['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], correctIndex: 2, explanation: 'Plants absorb CO2 during photosynthesis.', points: 10 },
      { text: 'What is the speed of light?', options: ['3x10^8 m/s','3x10^6 m/s','3x10^10 m/s','3x10^4 m/s'], correctIndex: 0, explanation: 'Speed of light is approximately 3x10^8 meters per second.', points: 10 },
      { text: 'What is the powerhouse of the cell?', options: ['Nucleus','Ribosome','Mitochondria','Golgi body'], correctIndex: 2, explanation: 'Mitochondria produce ATP energy for the cell.', points: 10 },
      { text: 'What planet is known as the Red Planet?', options: ['Venus','Jupiter','Saturn','Mars'], correctIndex: 3, explanation: 'Mars appears red due to iron oxide (rust) on its surface.', points: 10 },
    ],
  })
  console.log('Quizzes created')

  const now = new Date()
  await Contest.insertMany([
    {
      title: '⚡ JavaScript Speed Challenge', description: 'Fast-paced JS — answer quickly for bonus points!',
      category: 'javascript', entryFee: 50, prizePool: 2000,
      prizeBreakdown: [{ rank:1, label:'1st Place', coins:1000 },{ rank:2, label:'2nd Place', coins:600 },{ rank:3, label:'3rd Place', coins:400 }],
      maxParticipants: 100, quiz: jsQuiz._id,
      startTime: new Date(now.getTime() + 2*60*60*1000),
      endTime:   new Date(now.getTime() + 3*60*60*1000),
      status: 'UPCOMING', rules: ['Answer all questions in time','Faster = more bonus points'],
      createdBy: admin._id, isFeatured: true, bannerColor: 'from-yellow-500 to-orange-500',
    },
    {
      title: '⚛️ React Masters Cup', description: 'Prove your React expertise!',
      category: 'react', entryFee: 100, prizePool: 5000,
      prizeBreakdown: [{ rank:1, label:'1st Place', coins:2500 },{ rank:2, label:'2nd Place', coins:1500 },{ rank:3, label:'3rd Place', coins:1000 }],
      maxParticipants: 200, quiz: reactQuiz._id,
      startTime: new Date(now.getTime() - 30*60*1000),
      endTime:   new Date(now.getTime() + 30*60*1000),
      status: 'LIVE', rules: ['Complete all questions','Top 3 win prizes'],
      createdBy: admin._id, isFeatured: true, bannerColor: 'from-violet-600 to-indigo-600',
    },
    {
      title: '🆓 Daily Free Quiz', description: 'Free to enter — sharpen your skills!',
      category: 'general', entryFee: 0, prizePool: 500,
      prizeBreakdown: [{ rank:1, label:'1st Place', coins:300 },{ rank:2, label:'2nd Place', coins:200 }],
      maxParticipants: 500, quiz: generalQuiz._id,
      startTime: new Date(now.getTime() + 24*60*60*1000),
      endTime:   new Date(now.getTime() + 25*60*60*1000),
      status: 'UPCOMING', rules: ['Free entry','Top 2 win coins'],
      createdBy: admin._id, bannerColor: 'from-green-500 to-teal-500',
    },
  ])
  console.log('Contests created')
  console.log('\n✅ Seed complete!')
  console.log('Admin: admin@quizarena.io / admin123')
  console.log('User:  test@quizarena.io  / test1234')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })