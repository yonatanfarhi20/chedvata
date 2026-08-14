const ERROR_MESSAGES = Object.freeze({
  DUPLICATE_USER: 'משתמש עם מזהה זה כבר קיים במערכת',
  INVALID_DATA: 'נתונים לא תקינים',
  INVALID_JSON: 'גוף הבקשה אינו JSON תקין',
  NOT_FOUND: 'הנתיב לא נמצא',
  INTERNAL: 'שגיאת שרת פנימית',
  REGISTER_SUCCESS: 'ההרשמה בוצעה בהצלחה',
});

module.exports = {
  ERROR_MESSAGES,
};
