const Settings = require('../models/Settings');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ user: req.user });
    
    if (!settings) {
      settings = await Settings.create({ user: req.user });
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate({ user: req.user }, req.body, { new: true, upsert: true, runValidators: true });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};