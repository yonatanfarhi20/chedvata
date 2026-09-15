const express = require('express');
const rabbiDashboardController = require('../controllers/rabbiDashboard.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { USER_ROLE } = require('../constants/user');

const router = express.Router();

router.use(authMiddleware);
router.get('/', roleMiddleware([USER_ROLE.RABBI]), rabbiDashboardController.getRabbiDashboard);

module.exports = router;
