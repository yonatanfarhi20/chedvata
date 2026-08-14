const ERROR_MESSAGES = Object.freeze({
  DUPLICATE_USER: 'משתמש עם מזהה זה כבר קיים במערכת',
  INVALID_DATA: 'נתונים לא תקינים',
  INVALID_JSON: 'גוף הבקשה אינו JSON תקין',
  NOT_FOUND: 'הנתיב לא נמצא',
  INTERNAL: 'שגיאת שרת פנימית',
  REGISTER_SUCCESS: 'ההרשמה בוצעה בהצלחה',
  EMAIL_SEND_FAILED: 'שליחת המייל נכשלה. נסו שוב מאוחר יותר.',
  INVALID_VERIFICATION_TOKEN: 'קישור האימות אינו תקין',
  EXPIRED_VERIFICATION_TOKEN: 'תוקף קישור האימות פג',
  EMAIL_VERIFIED: 'המייל אומת בהצלחה. החשבון ממתין לאישור ההנהלה.',
  UNAUTHORIZED: 'נדרשת התחברות למערכת',
  FORBIDDEN: 'אין הרשאה לגשת למשאב זה',
  INVALID_CREDENTIALS: 'דואר אלקטרוני או סיסמה שגויים',
  PENDING_EMAIL_VERIFICATION:
    'חשבונך טרם אומת. אנא לחץ על הקישור שנשלח לתיבת הדואר האלקטרוני שלך (הקישור בתוקף ל-12 שעות).',
  PENDING_ADMIN_APPROVAL:
    'חשבונך אומת בהצלחה וממתין לאישור ההנהלה. עדכון יישלח אליך למייל.',
  LOGIN_SUCCESS: 'ההתחברות בוצעה בהצלחה',
  USER_APPROVED: 'התלמיד אושר בהצלחה',
  USER_REJECTED: 'הבקשה נדחתה והמשתמש נמחק',
  PENDING_USER_NOT_FOUND: 'לא נמצא משתמש הממתין לאישור הנהלה',
  FORGOT_PASSWORD_SUCCESS: 'קישור נשלח למייל',
});

module.exports = {
  ERROR_MESSAGES,
};
