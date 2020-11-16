import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import jwt from "jsonwebtoken";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const appEmail = process.env.APP_EMAIL;
const appEmailPass = process.env.APP_EMAIL_SECRET;

export function sendVerificationEmail(user, hostUrl) {
  const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 3600,
  });
  const url = `https://${hostUrl}/user_verified/${verificationToken}`;
  console.log(url);

  const emailOptions = {
    from: "react.template.email@gmail.com",
    to: user.email,
    subject: "Verify your react template account",
    text: `Verify your account with this link: \n ${url}`,
  };

  sendEmail(user, emailOptions);
}

export function sendEmail(user, emailOptions) {
  let transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
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
