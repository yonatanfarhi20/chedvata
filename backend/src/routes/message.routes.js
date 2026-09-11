const express = require('express');
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', messageController.listMessages);

module.exports = router;
