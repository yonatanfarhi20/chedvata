export const MESSAGE_RECIPIENT_TYPE = Object.freeze({
  STUDENT: 'student',
  CLASS: 'class',
});

export const MESSAGE_RECIPIENT_TYPE_LABELS = Object.freeze({
  [MESSAGE_RECIPIENT_TYPE.STUDENT]: 'תלמיד ספציפי',
  [MESSAGE_RECIPIENT_TYPE.CLASS]: 'שיעור / כיתה',
});

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
    errors.classId = 'יש לבחור כיתה';
  }

  if (!subject?.trim()) {
    errors.subject = 'שדה זה הוא חובה';
  }

  if (!content?.trim()) {
    errors.content = 'שדה זה הוא חובה';
  }

  return errors;
}
