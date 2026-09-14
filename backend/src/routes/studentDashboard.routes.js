const express = require('express');
const studentDashboardController = require('../controllers/studentDashboard.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { USER_ROLE } = require('../constants/user');

const router = express.Router();

router.use(authMiddleware);
router.get('/', roleMiddleware([USER_ROLE.STUDENT]), studentDashboardController.getStudentDashboard);

module.exports = router;
