const { escapeHtml } = require('../../utils/html');
const { EMAIL_VERIFICATION_TTL_HOURS } = require('../../constants/auth');

function buildVerifyAccountEmail({ firstName, verificationUrl }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(verificationUrl);

  return {
    subject: 'אימות חשבון | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'תודה שנרשמת למערכת ישיבת חדוותא.',
      `כדי לאמת את כתובת הדואר האלקטרוני, יש לפתוח את הקישור הבא (בתוקף ל-${EMAIL_VERIFICATION_TTL_HOURS} שעות):`,
      verificationUrl,
      '',
      'אם לא נרשמת למערכת, ניתן להתעלם מהודעה זו.',
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>תודה שנרשמת למערכת. לחצו על הכפתור כדי לאמת את כתובת הדואר האלקטרוני.</p>
        <p>הקישור בתוקף ל-${EMAIL_VERIFICATION_TTL_HOURS} שעות.</p>
        <p>
          <a href="${safeUrl}" style="display: inline-block; background: #1e3a5f; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
            אימות החשבון
          </a>
        </p>
        <p>אם הכפתור אינו עובד, ניתן להעתיק את הקישור הבא לדפדפן:</p>
        <p style="word-break: break-all;">${safeUrl}</p>
        <p>אם לא נרשמת למערכת, ניתן להתעלם מהודעה זו.</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildVerifyAccountEmail,
};
