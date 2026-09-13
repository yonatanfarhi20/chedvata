const PHONE_DEPOSIT_STATUS = Object.freeze({
  NONE: 'none',
  PENDING_DEPOSIT: 'pending_deposit',
  DEPOSITED: 'deposited',
  READY_FOR_RETURN: 'ready_for_return',
});

const ATTENDANCE_PENALTY_STATE = Object.freeze({
  ACTIVE: 'active',
  CONSUMED: 'consumed',
});

const PHONE_PENALTY_RULES = Object.freeze({
  LATES_PER_ABSENCE: 2,
  ABSENCES_FOR_DEPOSIT: 5,
  DEPOSIT_DURATION_DAYS: 7,
  LATE_EXPIRY_CLEAN_WEEKS: 1,
  ABSENCE_EXPIRY_CLEAN_WEEKS: 3,
  MS_PER_DAY: 24 * 60 * 60 * 1000,
});

module.exports = {
  PHONE_DEPOSIT_STATUS,
  ATTENDANCE_PENALTY_STATE,
  PHONE_PENALTY_RULES,
};
