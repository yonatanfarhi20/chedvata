const express = require('express');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/password', profileController.updatePassword);

module.exports = router;
