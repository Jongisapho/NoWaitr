import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOTPEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Your NoWaitr Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #e7610eff;">Your Verification Code</h2>
        <p>Your one-time verification code is:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>This code expires in <b>5 minutes</b>.</p>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
