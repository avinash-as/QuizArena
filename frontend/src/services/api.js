import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('qa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qa_token')
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:          (email, password)            => api.post('/auth/login', { email, password }),
  register:       (name, email, password, ref) => api.post('/auth/register', { name, email, password, referralCode: ref }),
  me:             ()                           => api.get('/auth/me'),
  updateProfile:  (data)                       => api.put('/auth/profile', data),
  forgotPassword: (email)                      => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password)            => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail:        (token)                  => api.post(`/auth/verify-email/${token}`),
  resendVerification: (email)                  => api.post('/auth/resend-verification', { email }),
  getReferralInfo:()                           => api.get('/auth/referral-info'),
}

export const contestAPI = {
  getAll:           (params)      => api.get('/contests', { params }),
  getOne:           (id)          => api.get(`/contests/${id}`),
  join:             (id)          => api.post(`/contests/${id}/join`),
  submit:           (id, payload) => api.post(`/contests/${id}/submit`, payload),
  getLeaderboard:   (id)          => api.get(`/contests/${id}/leaderboard`),
  create:           (data)        => api.post('/contests', data),
  update:           (id, data)    => api.put(`/contests/${id}`, data),
  delete:           (id)          => api.delete(`/contests/${id}`),
  distributePrizes: (id)          => api.post(`/contests/${id}/distribute-prizes`),
}



export const roomAPI = {
  create:         (data)            => api.post('/rooms', data),
  getByCode:      (code)            => api.get(`/rooms/${code}`),
  join:           (code, password)  => api.post(`/rooms/${code}/join`, { password }),
  cancel:         (code)            => api.delete(`/rooms/${code}`),
  myRooms:        ()                => api.get('/rooms/my'),
  joinedRooms:    ()                => api.get('/rooms/joined'),
  getLeaderboard: (code)            => api.get(`/rooms/${code}/leaderboard`),
  getMyResult:    (code)            => api.get(`/rooms/${code}/result`),
}

export const attemptAPI = {
  start:     (contestId)          => api.post('/attempts/start', { contestId }),
  submit:    (attemptId, payload) => api.post(`/attempts/${attemptId}/submit`, payload),
  getStatus: (contestId)          => api.get(`/attempts/contest/${contestId}`),
}

export const quizAPI = {
  getAll:    (params)              => api.get('/quizzes', { params }),
  getOne:    (id, shuffle = false) => api.get(`/quizzes/${id}`, { params: { shuffle } }),
  practice:  (id, shuffle = true)  => api.get(`/quizzes/${id}/practice`, { params: { shuffle } }),
  create:    (data)                => api.post('/quizzes', data),
  update:    (id, d)               => api.put(`/quizzes/${id}`, d),
  delete:    (id)                  => api.delete(`/quizzes/${id}`),
  importFromBank:   (id, questionIds) => api.post(`/quizzes/${id}/questions/import`, { questionIds }),
  removeQuestion:   (id, questionId)  => api.delete(`/quizzes/${id}/questions/${questionId}`),
  reorderQuestions: (id, orderedIds)  => api.put(`/quizzes/${id}/questions/reorder`, { orderedIds }),
}

export const questionAPI = {
  getAll:       (params) => api.get('/questions', { params }),
  create:       (data)   => api.post('/questions', data),
  bulkCreate:   (data)   => api.post('/questions/bulk', data),
  generateQuiz: (params) => api.post('/questions/generate-quiz', params),
  update:       (id, d)  => api.put(`/questions/${id}`, d),
  delete:       (id)     => api.delete(`/questions/${id}`),
}

export const leaderboardAPI = {
  get: (period = 'alltime', limit = 50) => api.get('/leaderboard', { params: { period, limit } }),
}

// Pure virtual-currency wallet — coins only, no deposit/withdrawal.
export const walletAPI = {
  get:             ()       => api.get('/wallet'),
  claimDailyBonus: ()       => api.post('/wallet/daily-bonus'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
}

export const notificationAPI = {
  getAll:      ()   => api.get('/users/me/notifications'),
  getUnread:   ()   => api.get('/users/me/unread-count'),
  markRead:    (id) => api.put(`/users/me/notifications/${id}/read`).catch(() => {}),
  markAllRead: ()   => api.put('/users/me/notifications/read-all').catch(() => {}),
}

export const prizeTemplateAPI = {
  getAll:  ()       => api.get('/prize-templates'),
  create:  (data)   => api.post('/prize-templates', data),
  update:  (id, d)  => api.put(`/prize-templates/${id}`, d),
  delete:  (id)     => api.delete(`/prize-templates/${id}`),
}

export const fraudAPI = {
  getAll:   (params) => api.get('/fraud', { params }),
  getStats: ()       => api.get('/fraud/stats'),
  resolve:  (id, d)  => api.put(`/fraud/${id}`, d),
}

export const adminAPI = {
  getStats:     ()         => api.get('/admin/stats'),
  getUsers:     (params)   => api.get('/admin/users', { params }),
  updateUser:   (id, data) => api.put(`/admin/users/${id}`, data),
  creditCoins:  (id, data) => api.post(`/admin/users/${id}/credit-coins`, data),
  broadcast:    (data)     => api.post('/admin/broadcast', data),
  getAnalytics: ()         => api.get('/admin/analytics'),
  getAuditLogs: (params)   => api.get('/admin/audit-logs', { params }),
}

export default api