const express = require('express');
const adminController = require('../controllers/admin.controller');
const attendanceController = require('../controllers/attendance.controller');
const phoneController = require('../controllers/phone.controller');
const profileController = require('../controllers/profile.controller');
const verifyAdmin = require('../middlewares/verifyAdmin.middleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { SENIOR_MANAGEMENT_ROLES } = require('../constants/user');

const router = express.Router();
const profileRouter = express.Router();

router.use(verifyAdmin);

profileRouter.get('/', profileController.getProfile);
profileRouter.put('/', profileController.updateProfile);
profileRouter.put('/password', profileController.updatePassword);
router.use('/profile', profileRouter);

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

router.get('/attendance', attendanceController.listAttendance);
router.post('/attendance', attendanceController.saveAttendance);

router.get('/phones/status', phoneController.getDailyStatus);
router.post('/phones/deposit', phoneController.toggleDeposit);

module.exports = router;
