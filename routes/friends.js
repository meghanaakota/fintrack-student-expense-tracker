const express = require('express');
const { getFriends, addFriend, updateFriend } = require('../controllers/friendController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getFriends)
  .post(protect, addFriend);

router.route('/:id').put(protect, updateFriend);

module.exports = router;