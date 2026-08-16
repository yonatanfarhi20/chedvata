const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');
const { ADMIN_ROLES } = require('../constants/user');

const ensureAdminRole = roleMiddleware([...ADMIN_ROLES]);

async function verifyAdmin(req, res, next) {
  try {
    await authMiddleware(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }

      ensureAdminRole(req, res, next);
    });
  } catch (error) {
    next(error);
  }
}

module.exports = verifyAdmin;
