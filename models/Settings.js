const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyBudget: { type: Number, default: 5000 },
  emergencyReserve: { type: Number, default: 2000 },
  paymentSources: { type: [String], default: ['UPI / GPay', 'PhonePe', 'Cash'] },
  panicMode: { type: Boolean, default: false },
  weekendDamage: { type: Boolean, default: false },
  friendNudges: { type: Boolean, default: true },
  compactMode: { type: Boolean, default: false },
  reducedMotion: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);