const express = require('express');
const { getTransactions, addTransaction, deleteTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getTransactions)
  .post(protect, addTransaction);

router.route('/:id')
  .delete(protect, deleteTransaction);

module.exports = router;