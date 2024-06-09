const nodemailer = require('nodemailer');

// new Email (user, url).sendWelcome()

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `CloudyLake Team <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  send(template, subject) {
    // Sent the actual email
  }

  sendWelcome() {
    this.send('Welcome', 'Welcome to the CloudyLake Family!');
  }
};

const sendEmail = (options) => {
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
