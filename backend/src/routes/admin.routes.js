const express = require('express');
const adminController = require('../controllers/admin.controller');
const attendanceController = require('../controllers/attendance.controller');
const lessonAttendanceController = require('../controllers/lessonAttendance.controller');
const dashboardController = require('../controllers/dashboard.controller');
const messageController = require('../controllers/message.controller');
const phonePenaltyController = require('../controllers/phonePenalty.controller');
const profileController = require('../controllers/profile.controller');
const verifyAdmin = require('../middlewares/verifyAdmin.middleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { SENIOR_MANAGEMENT_ROLES, USER_ROLE } = require('../constants/user');

const router = express.Router();
const profileRouter = express.Router();

router.use(verifyAdmin);

profileRouter.get('/', profileController.getProfile);
profileRouter.put('/', profileController.updateProfile);
profileRouter.put('/password', profileController.updatePassword);
router.use('/profile', profileRouter);

router.get(
  '/dashboard/vacations',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  dashboardController.getDailyVacations,
);
router.get(
  '/dashboard/prayers',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  dashboardController.getPrayerAttendance,
);
router.get(
  '/dashboard',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  dashboardController.getDashboard,
);

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

router.get('/users/search', adminController.searchStudents);
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/attendance', attendanceController.listAttendance);
router.post('/attendance', attendanceController.saveAttendance);

router.get(
  '/lesson-attendance/students',
  roleMiddleware([USER_ROLE.RABBI]),
  lessonAttendanceController.listRabbiClassStudents,
);
router.get(
  '/lesson-attendance/today',
  roleMiddleware([USER_ROLE.RABBI]),
  lessonAttendanceController.getRabbiLessonAttendanceToday,
);
router.post(
  '/lesson-attendance',
  roleMiddleware([USER_ROLE.RABBI]),
  lessonAttendanceController.saveRabbiLessonAttendance,
);
router.put(
  '/lesson-attendance',
  roleMiddleware([USER_ROLE.RABBI]),
  lessonAttendanceController.saveRabbiLessonAttendance,
);

router.get(
  '/phone-penalties',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  phonePenaltyController.listPhonePenaltyQueues,
);
router.post(
  '/phone-penalties/:studentId/deposit',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  phonePenaltyController.confirmPhoneDeposit,
);
router.post(
  '/phone-penalties/:studentId/return',
  roleMiddleware([...SENIOR_MANAGEMENT_ROLES]),
  phonePenaltyController.confirmPhoneReturn,
);

router.get('/messages', messageController.listMessages);
router.post('/messages', messageController.createMessage);

module.exports = router;
