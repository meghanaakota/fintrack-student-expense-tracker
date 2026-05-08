const mongoose = require('mongoose');

const FriendDebtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  reason: { type: String, required: true },
  total: { type: Number, required: true },
  returned: { type: Number, default: 0 },
  type: { type: String, enum: ['lent', 'borrowed'], default: 'lent' }
}, { timestamps: true });

FriendDebtSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('FriendDebt', FriendDebtSchema);