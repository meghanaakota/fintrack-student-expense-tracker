const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, fullName, email, password } = req.body;
    
    // Create user
    const user = await User.create({ name: name || fullName, email, password });
    
    sendTokenResponse(user, 201, res);
  } catch (err) {
    // Handle Mongoose duplicate key error (Email already exists)
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user (with balances)
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    
    // Dynamically calculate balances and financial summaries directly from MongoDB
    const transactions = await Transaction.find({ user: req.user });
    
    const settings = await Settings.findOne({ user: req.user }) || { emergencyReserve: 2000, monthlyBudget: 5000 };

    let balances = {
      cash: 0, gpay: 0, phonepe: 0, paytm: 0, bank: 0, emergency: settings.emergencyReserve
    };
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let monthlyExpenses = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Survival Tracker: Find the most recent income date, default to 1st of month
    const incomeTxs = transactions.filter(tx => tx.type === 'income').sort((a, b) => new Date(b.date) - new Date(a.date));
    const trackingStartDate = incomeTxs.length > 0 ? new Date(incomeTxs[0].date) : new Date(currentYear, currentMonth, 1);
    
    const startMidnight = new Date(trackingStartDate);
    startMidnight.setHours(0, 0, 0, 0);
    const nowMidnight = new Date();
    nowMidnight.setHours(0, 0, 0, 0);

    const msPassed = nowMidnight.getTime() - startMidnight.getTime();
    let daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
    if (daysPassed < 1) daysPassed = 1; // Prevent division by zero

    let spentSinceIncome = 0;

    transactions.forEach(tx => {
      const amt = tx.amount;
      const absAmt = Math.abs(amt);
      const txDate = new Date(tx.date);

      if (tx.type === 'income') {
        totalIncome += absAmt;
      } else {
        totalExpenses += absAmt;
        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          monthlyExpenses += absAmt;
        }
        if (txDate >= startMidnight) {
          spentSinceIncome += absAmt;
        }
      }

      const method = (tx.method || '').toLowerCase();
      if (method.includes('cash')) balances.cash += amt;
      else if (method.includes('phonepe')) balances.phonepe += amt;
      else if (method.includes('paytm')) balances.paytm += amt;
      else if (method.includes('upi') || method.includes('gpay')) balances.gpay += amt;
      else balances.bank += amt;
    });

    const totalBalance = balances.cash + balances.gpay + balances.phonepe + balances.paytm + balances.bank;
    
    // Calculate Final Survival Estimates
    const avgDailySpend = spentSinceIncome / daysPassed;
    const estRemainingDays = avgDailySpend > 0 ? Math.floor(totalBalance / avgDailySpend) : 999;
    
    const exhaustionDate = new Date();
    exhaustionDate.setDate(exhaustionDate.getDate() + estRemainingDays);

    let health = 'safe';
    if (estRemainingDays <= 7) health = 'danger';
    else if (estRemainingDays <= 15) health = 'moderate';

    let userData = user.toObject();
    delete userData.password; // Clean security practice

    res.status(200).json({ 
      success: true, 
      data: { 
        ...userData, balances, totalBalance, totalIncome, totalExpenses, monthlyExpenses,
        survival: { trackingStartDate, daysPassed, spentSinceIncome, avgDailySpend, estRemainingDays: estRemainingDays > 999 ? 999 : estRemainingDays, exhaustionDate: estRemainingDays > 999 ? null : exhaustionDate, health }
      } 
    });
  } catch (err) {
    next(err);
  }
};