const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true }, // Negative for expense, positive for income
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: { type: String, required: true },
  method: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Convert _id to id for the frontend
TransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);