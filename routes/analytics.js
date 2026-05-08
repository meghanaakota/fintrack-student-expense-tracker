const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/insights', protect, (req, res) => {
  // Mocking the analytics calculation for the frontend graphs until you write the MongoDB aggregation logic
  res.status(200).json({
    success: true,
    data: {
      categoryTotals: { 'Food & Snacks': 1200, 'College Life': 450, 'Commute': 300 },
      trends: { 'Mon': 150, 'Tue': 300, 'Wed': 0, 'Thu': 450, 'Fri': 100, 'Sat': 600, 'Sun': 0 },
      topCategory: 'Food & Snacks',
      insightText: 'Late-night cravings continue dominating your budget.'
    }
  });
});

module.exports = router;