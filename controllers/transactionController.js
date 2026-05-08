const Transaction = require('../models/Transaction');

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user }).sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

exports.addTransaction = async (req, res, next) => {
  try {
    req.body.user = req.user;
    const transaction = await Transaction.create(req.body);
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    if (transaction.user.toString() !== req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    await transaction.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};