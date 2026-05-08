const Transaction = require('../models/Transaction');

// @desc    Get dashboard insights & analytics
// @route   GET /api/v1/analytics/insights
// @access  Private
exports.getInsights = async (req, res, next) => {
  try {
    // Get dynamically scoped analytics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({ 
      user: req.user, 
      type: 'expense',
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    const categoryTotals = {};
    let totalSpent = 0;

    // Prepare last 7 days map for trend line
    const trends = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trends[d.toLocaleDateString('en-IN', { weekday: 'short' })] = 0;
    }

    transactions.forEach(tx => {
      const absAmt = Math.abs(tx.amount);
      // Map Category Totals
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + absAmt;
      totalSpent += absAmt;

      // Map Weekly Trends
      const dateStr = new Date(tx.date).toLocaleDateString('en-IN', { weekday: 'short' });
      if (trends[dateStr] !== undefined) {
        trends[dateStr] += absAmt;
      }
    });

    // Find Highest Category
    let topCategory = 'None';
    let maxSpend = 0;
    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > maxSpend) {
        maxSpend = amt;
        topCategory = cat;
      }
    }

    // FinTrack Sarcastic Insight Engine
    const sarcasticInsights = {
      'Food & Snacks': "Your Swiggy delivery guy thinks you're best friends. Stop funding his retirement.",
      'College Life': "Assignment printouts are a scam, but you fell for it anyway.",
      'Commute': "Surge pricing is literally robbing you, yet you refuse to take the bus.",
      'Social': "You're funding everyone's fun. You are not a charity.",
      'Online & Random': "Jeff Bezos personally thanks you for your impulse purchases.",
      'Friend Settlement': "Paying back debts? Shocking character development.",
      'None': "You haven't spent anything yet. Keep it that way."
    };

    const insightText = sarcasticInsights[topCategory] || "Your spending is a mystery even to us.";

    res.status(200).json({
      success: true,
      data: { totalSpent, categoryTotals, topCategory, insightText, trends }
    });
  } catch (err) {
    next(err);
  }
};