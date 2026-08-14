const ERROR_MESSAGES = Object.freeze({
  DUPLICATE_USER: 'משתמש עם מזהה זה כבר קיים במערכת',
  INVALID_DATA: 'נתונים לא תקינים',
  INVALID_JSON: 'גוף הבקשה אינו JSON תקין',
  NOT_FOUND: 'הנתיב לא נמצא',
  INTERNAL: 'שגיאת שרת פנימית',
  REGISTER_SUCCESS: 'ההרשמה בוצעה בהצלחה',
  EMAIL_SEND_FAILED: 'שליחת מייל האימות נכשלה. נסו שוב מאוחר יותר.',
  INVALID_VERIFICATION_TOKEN: 'קישור האימות אינו תקין',
  EXPIRED_VERIFICATION_TOKEN: 'תוקף קישור האימות פג',
  EMAIL_VERIFIED: 'המייל אומת בהצלחה. החשבון ממתין לאישור ההנהלה.',
});

module.exports = {
  ERROR_MESSAGES,
};
