const express = require('express');
const adminController = require('../controllers/admin.controller');
const verifyAdmin = require('../middlewares/verifyAdmin.middleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { SENIOR_MANAGEMENT_ROLES } = require('../constants/user');

const router = express.Router();

router.use(verifyAdmin);

router.get(
  '/users/pending',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  adminController.listPendingUsers,
);
router.put(
  '/users/:id/approve',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  adminController.approveUser,
);
router.delete(
  '/users/:id/reject',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  adminController.rejectUser,
);

router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
