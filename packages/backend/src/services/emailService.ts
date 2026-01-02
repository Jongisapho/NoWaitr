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
    subject: "NoWaitr OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #ff6200ff;">Your Verification Code</h2>
        <p>Your one-time verification code is:</p>
        <h1 style="letter-spacing: 4px; color: #000000ff">${code}</h1>
        <p>This code expires in <b>5 minutes</b>.</p>
        <p>If you did not request this, ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to NoWaitr ! Your email has been verified ✅",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ff6200ff; text-align: center;">Welcome to NoWaitr, ${name || 'there'}!</h2>
        <p style="font-size: 16px; color: #333;">
          Great news — your email <strong>${to}</strong> has been successfully verified.
        </p>
        <p style="font-size: 16px; color: #333;">
          You're now ready to:
        </p>
        <ul style="font-size: 16px; color: #333;">
          <li>Join virtual queues at your favorite restaurants</li>
          <li>Get notified when it's your turn</li>
          <li>Skip the long waits!</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://NoWaitr.com" 
             style="background-color: #ff6200ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Open NoWaitr App
          </a>
        </div>
        <p style="font-size: 14px; color: #777; text-align: center;">
          Questions? Just reply to this email — we're here to help!<br>
          The NoWaitr Team
        </p>
      </div>`
  };

  await transporter.sendMail(mailOptions);
};

export const sendRegistrationEmail = async (to: string, link: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "NoWaitr Registration Link",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; max-width: 500px;">
        <h2 style="color: #ff6200; margin-bottom: 10px;">Your Registration Link</h2>
        <p>Hello,</p>
        <p>Your profile has been created. Please click the button below to complete your registration:</p>
        <a href="${link}" 
           style="display: inline-block;
                  background-color: #ff6200;
                  color: white;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  margin: 20px 0;
                  letter-spacing: 1px;">
          Complete Registration
        </a>
        <p>If the button doesn’t work, copy and paste the link below into your browser:</p>
        <p style="word-break: break-all;">
          <a href="${link}" style="color: #ff6200;">${link}</a>
        </p>
        <p>This link expires in <b>48 hours</b>.</p>
        <p>Best regards,<br>NoWaitr Team</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};