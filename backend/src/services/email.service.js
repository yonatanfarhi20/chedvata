const nodemailer = require('nodemailer');

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD are required');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
    family: 4, 
    connectionTimeout: 10000
  });
}

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = createTransport();
  }

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER;

  await getTransporter().sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  sendEmail,
};
