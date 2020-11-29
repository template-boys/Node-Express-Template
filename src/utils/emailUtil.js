import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import jwt from 'jsonwebtoken';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const appEmail = process.env.APP_EMAIL;
const appEmailPass = process.env.APP_EMAIL_SECRET;

export function sendVerificationEmail(user, hostUrl) {
  const verificationToken = jwt.sign(
    { id: user._id, tokenType: 'V' },
    process.env.JWT_SECRET,
    {
      expiresIn: 3600,
    }
  );
  const url = `${hostUrl}/user_verified/${verificationToken}`;

  const emailOptions = {
    from: 'react.template.email@gmail.com',
    to: user.email,
    subject: 'Verify your react template account',
    html: `<div><p>Verify your account with this link:</p> <p><a href=${url}>Verify Account</a></p></div>`,
  };

  sendEmail(user, emailOptions);
}

export function sendResetPasswordEmail(user, hostUrl) {
  const resetPasswordToken = jwt.sign(
    { id: user._id, tokenType: 'R' },
    process.env.JWT_SECRET,
    {
      expiresIn: 3600,
    }
  );
  const url = `${hostUrl}/reset_password/${resetPasswordToken}`;

  const emailOptions = {
    from: 'react.template.email@gmail.com',
    to: user.email,
    subject: 'Reset your react template account password',
    html: `<div><p>Reset your password with this link:</p> <p><a href=${url}>Reset Password</a></p></div>`,
  };

  sendEmail(user, emailOptions);
}

export function sendEmail(user, emailOptions) {
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: appEmail,
        pass: appEmailPass,
      },
    })
  );

  transporter.sendMail(emailOptions, (error, info) => {
    if (error) {
      console.log(error);
      console.log(`Email failed for \n ${JSON.stringify(user)}`);
    } else {
      console.log(`Email sent: \n ${info.response}`);
    }
  });
}
