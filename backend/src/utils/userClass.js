const { USER_ROLE } = require('../constants/user');

function getUserClassId(user) {
  if (!user) {
    return null;
  }

  if (user.classId) {
    return user.classId;
  }

  if (user.role === USER_ROLE.RABBI && user._id) {
    return user._id;
  }

  return null;
}

module.exports = {
  getUserClassId,
};
