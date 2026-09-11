import { SENIOR_MANAGEMENT_ROLES } from '@/lib/auth/constants';

export const MESSAGE_RECIPIENT_TYPE = Object.freeze({
  STUDENT: 'student',
  CLASS: 'class',
  ALL: 'all',
});

export const MESSAGE_RECIPIENT_TYPE_LABELS = Object.freeze({
  [MESSAGE_RECIPIENT_TYPE.STUDENT]: 'תלמיד',
  [MESSAGE_RECIPIENT_TYPE.CLASS]: 'שיעור',
  [MESSAGE_RECIPIENT_TYPE.ALL]: 'כל הישיבה',
});

export function getMessageRecipientTypes(role) {
  if (SENIOR_MANAGEMENT_ROLES.includes(role)) {
    return Object.values(MESSAGE_RECIPIENT_TYPE);
  }

  return [MESSAGE_RECIPIENT_TYPE.STUDENT, MESSAGE_RECIPIENT_TYPE.CLASS];
}

export function getUniqueClassIds(users = []) {
  const classIds = new Set();

  users.forEach((user) => {
    if (user?.classId) {
      classIds.add(String(user.classId));
    }
  });

  return Array.from(classIds).sort((left, right) => left.localeCompare(right, 'he'));
}

export function validateMessageForm({ recipientType, studentId, classId, subject, content }) {
  const errors = {};

  if (recipientType === MESSAGE_RECIPIENT_TYPE.STUDENT && !studentId) {
    errors.studentId = 'יש לבחור תלמיד';
  }

  if (recipientType === MESSAGE_RECIPIENT_TYPE.CLASS && !classId) {
    errors.classId = 'יש לבחור שיעור';
  }

  if (!subject?.trim()) {
    errors.subject = 'שדה זה הוא חובה';
  }

  if (!content?.trim()) {
    errors.content = 'שדה זה הוא חובה';
  }

  return errors;
}

export function buildMessagePayload({ recipientType, studentId, classId, subject, content }) {
  const payload = {
    subject: subject.trim(),
    content: content.trim(),
  };

  if (recipientType === MESSAGE_RECIPIENT_TYPE.ALL) {
    payload.messageType = MESSAGE_RECIPIENT_TYPE.ALL;
    return payload;
  }

  if (recipientType === MESSAGE_RECIPIENT_TYPE.STUDENT) {
    payload.recipientId = studentId;
    return payload;
  }

  payload.classId = classId;
  return payload;
}
