import dotenv from 'dotenv'
dotenv.config()
import axios from "axios";

export const sendBrevoMail = async (to:string, subject:string, html:string) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: "ShohorOS",
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );
  } catch (error:any) {
    console.error(
      "Brevo Mail Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const generateCitizenVerificationEmail = (userName:string, otp:string) => {
  const subject = `ShohorOS - Verification Code for Citizen Account`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShohorOS Citizen Verification</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f6f9;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        border: 1px solid #e1e8ed;
      }
      .email-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 30px;
        text-align: center;
        color: #ffffff;
      }
      .email-header h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 1px;
        color: #38bdf8;
      }
      .email-header p {
        margin: 5px 0 0 0;
        font-size: 14px;
        color: #94a3b8;
      }
      .email-body {
        padding: 40px 30px;
        color: #334155;
        line-height: 1.6;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #0f172a;
      }
      .otp-box {
        background-color: #f8fafc;
        border: 2px dashed #0284c7;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #0284c7;
        margin: 10px 0;
      }
      .otp-notice {
        font-size: 13px;
        color: #64748b;
      }
      .footer {
        background-color: #f8fafc;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>ShohorOS</h1>
        <p>Smart City Management System</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        <p>Welcome to <strong>ShohorOS</strong>. To complete your citizen account verification, please use the One-Time Password (OTP) provided below.</p>
        
        <div class="otp-box">
          <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 500;">Your Verification OTP</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-notice">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        </div>

        <p>If you did not request this verification, please ignore this email or contact our support team immediately.</p>
        
        <p style="margin-top: 30px; margin-bottom: 0;">Best regards,<br><strong>ShohorOS Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ShohorOS. All rights reserved.<br>
        This is an automated message, please do not reply to this email.
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
};