const express = require('express');
const vacationController = require('../controllers/vacation.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { USER_ROLE } = require('../constants/user');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/request',
  roleMiddleware([USER_ROLE.STUDENT]),
  vacationController.requestVacation,
);
router.get(
  '/my-requests',
  roleMiddleware([USER_ROLE.STUDENT]),
  vacationController.getMyRequests,
);

module.exports = router;
