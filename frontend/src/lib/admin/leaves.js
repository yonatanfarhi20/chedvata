export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function validateLeaveForm({ studentId, startDate, endDate }) {
  const errors = {};

  if (!studentId) {
    errors.studentId = 'יש לבחור תלמיד';
  }

  if (!startDate) {
    errors.startDate = 'שדה זה הוא חובה';
  }

  if (!endDate) {
    errors.endDate = 'שדה זה הוא חובה';
  } else if (startDate && endDate < startDate) {
    errors.endDate = 'תאריך הסיום חייב להיות באותו יום או אחרי תאריך ההתחלה';
  }

  return errors;
}
