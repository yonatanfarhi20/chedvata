const express = require('express');
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { SENIOR_MANAGEMENT_ROLES } = require('../constants/user');

const router = express.Router();

router.use(authMiddleware, roleMiddleware([...SENIOR_MANAGEMENT_ROLES]));

router.get('/users/pending', adminController.listPendingUsers);
router.put('/users/:id/approve', adminController.approveUser);
router.delete('/users/:id/reject', adminController.rejectUser);

module.exports = router;
