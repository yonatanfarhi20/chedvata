const { escapeHtml } = require('../../utils/html');
const { PASSWORD_RESET_TTL_MINUTES } = require('../../constants/auth');

function buildResetPasswordEmail({ firstName, resetUrl }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(resetUrl);

  return {
    subject: 'איפוס סיסמה | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'התקבלה בקשה לאיפוס הסיסמה בחשבון שלך במערכת ישיבת חדוותא.',
      `כדי לבחור סיסמה חדשה, יש לפתוח את הקישור הבא (בתוקף ל-${PASSWORD_RESET_TTL_MINUTES} דקות):`,
      resetUrl,
      '',
      'אם לא ביקשת לאפס את הסיסמה, ניתן להתעלם מהודעה זו.',
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>התקבלה בקשה לאיפוס הסיסמה בחשבון שלך. לחצו על הכפתור כדי לבחור סיסמה חדשה.</p>
        <p>הקישור בתוקף ל-${PASSWORD_RESET_TTL_MINUTES} דקות.</p>
        <p>
          <a href="${safeUrl}" style="display: inline-block; background: #1e3a5f; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
            איפוס הסיסמה
          </a>
        </p>
        <p>אם הכפתור אינו עובד, ניתן להעתיק את הקישור הבא לדפדפן:</p>
        <p style="word-break: break-all;">${safeUrl}</p>
        <p>אם לא ביקשת לאפס את הסיסמה, ניתן להתעלם מהודעה זו.</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildResetPasswordEmail,
};
