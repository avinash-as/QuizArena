const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/prizeTemplateController')
const { protect, adminOnly } = require('../middleware/auth')

router.get('/', protect, adminOnly, ctrl.getTemplates)
router.post('/', protect, adminOnly, ctrl.createTemplate)
router.put('/:id', protect, adminOnly, ctrl.updateTemplate)
router.delete('/:id', protect, adminOnly, ctrl.deleteTemplate)

module.exports = router
