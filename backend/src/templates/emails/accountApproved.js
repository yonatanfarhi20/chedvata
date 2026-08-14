const { escapeHtml } = require('../../utils/html');

function buildAccountApprovedEmail({ firstName, loginUrl }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(loginUrl);

  return {
    subject: 'החשבון אושר | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'חשבונך אושר, ניתן כעת להתחבר למערכת.',
      'להתחברות:',
      loginUrl,
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>חשבונך אושר, ניתן כעת להתחבר למערכת.</p>
        <p>
          <a href="${safeUrl}" style="display: inline-block; background: #1e3a5f; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
            התחברות למערכת
          </a>
        </p>
        <p>אם הכפתור אינו עובד, ניתן להעתיק את הקישור הבא לדפדפן:</p>
        <p style="word-break: break-all;">${safeUrl}</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildAccountApprovedEmail,
};
