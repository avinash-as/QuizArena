const AuditLog = require('../models/AuditLog')

const audit = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = function (data) {
    if (data?.success !== false) {
      AuditLog.create({
        actor: req.user?._id,
        action,
        target: req.params?.id ? `${action.split('_')[0].toLowerCase()}:${req.params.id}` : undefined,
        details: { body: req.body, params: req.params, query: req.query },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }).catch(() => {}) // fire and forget
    }
    return originalJson(data)
  }
  next()
}

module.exports = { audit }
