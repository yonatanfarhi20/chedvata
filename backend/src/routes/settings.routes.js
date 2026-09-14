const express = require('express');
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { SENIOR_MANAGEMENT_ROLES } = require('../constants/user');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware([...SENIOR_MANAGEMENT_ROLES]));

router.put('/vacations', settingsController.updateVacationSettings);

module.exports = router;
