const { escapeHtml } = require('../../utils/html');
const { ADMIN_APPROVAL_TTL_DAYS } = require('../../constants/auth');

function buildAdminApprovalExpiredEmail({ firstName }) {
  const safeName = escapeHtml(firstName);

  return {
    subject: 'בקשת ההרשמה פגה | ישיבת חדוותא',
    text: [
      `שלום ${firstName},`,
      '',
      'בקשת ההרשמה פגה כיוון שלא אושרה בזמן.',
      `החשבון נמחק מהמערכת לאחר ${ADMIN_APPROVAL_TTL_DAYS} ימים ללא אישור הנהלה.`,
    ].join('\n'),
    html: `
      <div dir="rtl" style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1c1917;">
        <h1 style="color: #1e3a5f; font-size: 22px;">ישיבת חדוותא</h1>
        <p>שלום ${safeName},</p>
        <p>בקשת ההרשמה פגה כיוון שלא אושרה בזמן.</p>
        <p>החשבון נמחק מהמערכת לאחר ${ADMIN_APPROVAL_TTL_DAYS} ימים ללא אישור הנהלה.</p>
      </div>
    `.trim(),
  };
}

module.exports = {
  buildAdminApprovalExpiredEmail,
};
