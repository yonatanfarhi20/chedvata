const Vacation = require('../models/Vacation.model');
const Message = require('../models/Message.model');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../constants/errors');
const { MESSAGE_TYPE } = require('../constants/messages');
const { USER_ROLE, USER_STATUS } = require('../constants/user');
const {
  MS_PER_DAY,
  VACATION_STATUS,
  VACATION_QUOTA_EXCEEDED_CODE,
  VACATION_NOTIFICATION_SUBJECT,
  buildVacationNotificationContent,
} = require('../constants/vacations');
const { getCronTimezone } = require('../config/cron');
const { getZonedDateTimeParts } = require('../utils/time');
const {
  parseStudentVacationPayload,
  parseVacationId,
  parseVacationStatusPayload,
} = require('../validators/vacations');
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

async function notifyStudentOfVacation(vacation, { senderId, student, status } = {}) {
  if (!senderId || !student?._id) {
    return;
  }

  try {
    await Message.create({
      senderId,
      recipientId: student._id,
      messageType: MESSAGE_TYPE.PERSONAL,
      subject: VACATION_NOTIFICATION_SUBJECT,
      content: buildVacationNotificationContent({
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        reason: vacation.reason,
        status,
      }),
    });
  } catch (error) {
    console.error('[vacations] failed to create notification message', error);
  }
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

function serializeSettings(settings) {
  return {
    defaultVacationDays: settings.defaultVacationDays,
  };
}

async function listAllVacations() {
  const [pending, approved, settings] = await Promise.all([
    Vacation.find({ status: VACATION_STATUS.PENDING })
      .populate('studentId', 'firstName lastName classId')
      .sort({ createdAt: -1 }),
    Vacation.find({ status: VACATION_STATUS.APPROVED })
      .populate('studentId', 'firstName lastName classId')
      .sort({ startDate: 1, createdAt: -1 }),
    getVacationSettings(),
  ]);

  return {
    pending: pending.map(serializeVacation),
    approved: approved.map(serializeVacation),
    settings: serializeSettings(settings),
  };
}

async function updateVacationStatus(vacationId, payload, { actorId } = {}) {
  const id = parseVacationId(vacationId);
  const { status } = parseVacationStatusPayload(payload);
  const vacation = await Vacation.findById(id);

  if (!vacation) {
    throw new AppError(ERROR_MESSAGES.VACATION_NOT_FOUND, 404);
  }

  if (vacation.status !== VACATION_STATUS.PENDING) {
    throw new AppError(ERROR_MESSAGES.VACATION_NOT_PENDING, 400);
  }

  vacation.status = status;
  await vacation.save();

  if (status === VACATION_STATUS.APPROVED) {
    const student = await User.findById(vacation.studentId).select('_id firstName lastName classId');
    await notifyStudentOfVacation(vacation, {
      senderId: actorId,
      student,
      status: VACATION_STATUS.APPROVED,
    });
  }

  await vacation.populate('studentId', 'firstName lastName classId');
  return serializeVacation(vacation);
}

module.exports = {
  requestVacation,
  getMyVacationRequests,
  listAllVacations,
  updateVacationStatus,
};
