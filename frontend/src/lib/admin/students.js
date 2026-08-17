export const STUDENT_NOT_FOUND_MESSAGE = 'תלמיד זה אינו מופיע במערכת';
export const STUDENT_SEARCH_DEBOUNCE_MS = 300;

export function getStudentId(student) {
  return student?._id ? String(student._id) : '';
}

export function getStudentInitials(student) {
  const first = student?.firstName?.trim()?.[0] || '';
  const last = student?.lastName?.trim()?.[0] || '';
  const initials = `${first}${last}`;

  return initials ? initials.toUpperCase() : '?';
}
