const express = require('express');
const vacationController = require('../controllers/vacation.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { USER_ROLE, SENIOR_MANAGEMENT_ROLES } = require('../constants/user');

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
router.get(
  '/all',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  vacationController.listAll,
);
router.post(
  '/admin-create',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  vacationController.adminCreate,
);
router.put(
  '/:id/status',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  vacationController.updateStatus,
);

module.exports = router;
