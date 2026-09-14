const Vacation = require('../models/Vacation.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const {
  MS_PER_DAY,
  VACATION_STATUS,
  VACATION_QUOTA_EXCEEDED_CODE,
} = require('../constants/vacations');
const { getCronTimezone } = require('../config/cron');
const { getZonedDateTimeParts } = require('../utils/time');
const { parseStudentVacationPayload } = require('../validators/vacations');
const { getVacationSettings } = require('./systemSettings.service');

function countInclusiveDays(startDate, endDate) {
  return Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
}

function getCurrentYear(timeZone = getCronTimezone()) {
  return getZonedDateTimeParts(new Date(), timeZone).year;
}

function countDaysInYear(startDate, endDate, year) {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const start = startDate > yearStart ? startDate : yearStart;
  const end = endDate < yearEnd ? endDate : yearEnd;

  if (end < start) {
    return 0;
  }

  return countInclusiveDays(start, end);
}

async function getUsedVacationDays(studentId, year) {
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year, 11, 31));
  const vacations = await Vacation.find({
    studentId,
    status: VACATION_STATUS.APPROVED,
    startDate: { $lte: yearEnd },
    endDate: { $gte: yearStart },
  }).select('startDate endDate');

  return vacations.reduce(
    (total, vacation) => total + countDaysInYear(vacation.startDate, vacation.endDate, year),
    0,
  );
}

async function getQuotaSnapshot(studentId, range = {}) {
  const settings = await getVacationSettings();
  const year = getCurrentYear();
  const annualQuota = settings.defaultVacationDays;
  const usedDays = await getUsedVacationDays(studentId, year);
  const remainingDays = Math.max(annualQuota - usedDays, 0);
  const requestedDays =
    range.startDate && range.endDate ? countInclusiveDays(range.startDate, range.endDate) : 0;

  return {
    year,
    annualQuota,
    usedDays,
    remainingDays,
    requestedDays,
  };
}

function assertWithinQuota(snapshot) {
  if (snapshot.usedDays + snapshot.requestedDays > snapshot.annualQuota) {
    throw new AppError(ERROR_MESSAGES.VACATION_QUOTA_EXCEEDED, 400, {
      code: VACATION_QUOTA_EXCEEDED_CODE,
      year: snapshot.year,
      annualQuota: snapshot.annualQuota,
      usedDays: snapshot.usedDays,
      remainingDays: snapshot.remainingDays,
      requestedDays: snapshot.requestedDays,
    });
  }
}

function serializeStudent(student) {
  if (!student || !student._id) {
    return undefined;
  }

  return {
    _id: student._id,
    firstName: student.firstName,
    lastName: student.lastName,
    classId: student.classId,
  };
}

function serializeVacation(vacation) {
  const doc = typeof vacation.toObject === 'function' ? vacation.toObject() : vacation;
  const populatedStudent = doc.studentId && doc.studentId.firstName ? doc.studentId : null;

  return {
    _id: doc._id,
    studentId: populatedStudent ? populatedStudent._id : doc.studentId,
    student: serializeStudent(populatedStudent),
    startDate: doc.startDate,
    endDate: doc.endDate,
    reason: doc.reason || '',
    status: doc.status,
    createdByAdmin: Boolean(doc.createdByAdmin),
    daysCount: countInclusiveDays(doc.startDate, doc.endDate),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function findActiveStudent(studentId) {
  const student = await User.findOne({
    _id: studentId,
    role: USER_ROLE.STUDENT,
    status: USER_STATUS.ACTIVE,
  }).select('_id firstName lastName classId');

  if (!student) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
  }

  return student;
}

async function requestVacation(payload, { studentId } = {}) {
  const data = parseStudentVacationPayload(payload);
  const snapshot = await getQuotaSnapshot(studentId, data);

  assertWithinQuota(snapshot);

  const vacation = await Vacation.create({
    studentId,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    status: VACATION_STATUS.PENDING,
    createdByAdmin: false,
  });

  return serializeVacation(vacation);
}

async function getMyVacationRequests(studentId) {
  const [vacations, snapshot] = await Promise.all([
    Vacation.find({ studentId }).sort({ startDate: -1, createdAt: -1 }),
    getQuotaSnapshot(studentId),
  ]);

  return {
    vacations: vacations.map(serializeVacation),
    stats: {
      year: snapshot.year,
      annualQuota: snapshot.annualQuota,
      usedDays: snapshot.usedDays,
      remainingDays: snapshot.remainingDays,
    },
  };
}

module.exports = {
  requestVacation,
  getMyVacationRequests,
};
