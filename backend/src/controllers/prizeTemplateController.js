const PrizeTemplate = require('../models/PrizeTemplate')

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await PrizeTemplate.find({ isActive: true })
    res.json({ success: true, templates })
  } catch (err) { next(err) }
}

exports.createTemplate = async (req, res, next) => {
  try {
    const template = await PrizeTemplate.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json({ success: true, template })
  } catch (err) { next(err) }
}

exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await PrizeTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' })
    res.json({ success: true, template })
  } catch (err) { next(err) }
}

exports.deleteTemplate = async (req, res, next) => {
  try {
    await PrizeTemplate.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Template deleted' })
  } catch (err) { next(err) }
}
