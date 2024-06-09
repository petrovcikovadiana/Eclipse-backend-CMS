const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  // Transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // Define the email options
  const mailOptions = {
    from: 'Ondřej Polák <ondrej.polak@webgroo.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // Actually send the email

  transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
