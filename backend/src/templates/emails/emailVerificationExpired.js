const { escapeHtml } = require('../../utils/html');
const { EMAIL_VERIFICATION_TTL_HOURS } = require('../../constants/auth');

function buildEmailVerificationExpiredEmail({ firstName }) {
  const safeName = escapeHtml(firstName);

  return {
    subject: 'זמן אימות החשבון פג | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'זמן אימות החשבון פג.',
      `החשבון נמחק מהמערכת כיוון שכתובת הדואר האלקטרוני לא אומתה תוך ${EMAIL_VERIFICATION_TTL_HOURS} שעות.`,
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>זמן אימות החשבון פג.</p>
        <p>החשבון נמחק מהמערכת כיוון שכתובת הדואר האלקטרוני לא אומתה תוך ${EMAIL_VERIFICATION_TTL_HOURS} שעות.</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildEmailVerificationExpiredEmail,
};
