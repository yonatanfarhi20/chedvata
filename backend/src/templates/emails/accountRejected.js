const { escapeHtml } = require('../../utils/html');

function buildAccountRejectedEmail({ firstName }) {
  const safeName = escapeHtml(firstName);

  return {
    subject: 'בקשת ההרשמה נדחתה | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'בקשת ההרשמה נדחתה על ידי ההנהלה.',
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>בקשת ההרשמה נדחתה על ידי ההנהלה.</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildAccountRejectedEmail,
};
