const FriendDebt = require('../models/FriendDebt');
const Transaction = require('../models/Transaction');

exports.getFriends = async (req, res, next) => {
  try {
    const friends = await FriendDebt.find({ user: req.user }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: friends });
  } catch (error) {
    next(error);
  }
};

exports.addFriend = async (req, res, next) => {
  try {
    req.body.user = req.user;
    const { type, totalPaid, method, total, name, reason } = req.body;

    const friend = await FriendDebt.create(req.body);

    // Auto-create an expense transaction if you paid the original bill
    if (type === 'lent') {
       const amountToLog = totalPaid ? totalPaid : total;
       await Transaction.create({
         user: req.user,
         title: `Split bill: ${reason} (with ${name})`,
         amount: -Math.abs(amountToLog),
         type: 'expense',
         category: 'Social',
         method: method || 'UPI',
         date: new Date()
       });
    }

    res.status(201).json({ success: true, data: friend });
  } catch (error) {
    next(error);
  }
};

exports.updateFriend = async (req, res, next) => {
  try {
    const friendDebt = await FriendDebt.findOne({ _id: req.params.id, user: req.user });
    
    if (!friendDebt) {
      return res.status(404).json({ success: false, message: 'Friend debt not found' });
    }

    const oldReturned = friendDebt.returned || 0;
    const newReturned = req.body.returned;

    // Auto-create transaction if money is changing hands
    if (newReturned !== undefined && newReturned > oldReturned) {
      const amountSettled = newReturned - oldReturned;
      const isIncome = friendDebt.type === 'lent'; // If I lent it, I am getting money back
      
      await Transaction.create({
        user: req.user,
        title: `Settled with ${friendDebt.name} (${friendDebt.reason})`,
        amount: isIncome ? amountSettled : -Math.abs(amountSettled),
        type: isIncome ? 'income' : 'expense',
        category: 'Friend Settlement',
        method: req.body.method || 'UPI',
        date: new Date()
      });
    }

    const updatedFriend = await FriendDebt.findOneAndUpdate({ _id: req.params.id, user: req.user }, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedFriend });
  } catch (error) {
    next(error);
  }
};