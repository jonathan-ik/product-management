import { EMAIL, PASSWORD } from '@/config';
import * as nodemailer from 'nodemailer';
import sendMail from './email.helper';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
  debug: true,
});

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 90000);
}

export default async function sendOtp(email: string, otp: number) {
  const emailSubject = 'Action Needed: Forgot password ✔';
  const to = email;
  const dynamicHtml = `<b>We have received a request to reset your password.<br><br> If this was you, please use the verification code provided below to proceed:<br>
  Verification Code: <strong><em>${otp}</em></strong><br><br></b>`;

  const mailOptions = {
    from: {
      name: 'GreenTrail',
      address: EMAIL,
    },
    to: to,
    subject: emailSubject,
    text: 'Forgot Password',
    html: dynamicHtml,
  };

  // send mail
  return await sendMail(transporter, mailOptions);
}
