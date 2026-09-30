import dotenv from 'dotenv'
dotenv.config()
import axios from "axios";

export const sendBrevoMail = async (to: string, subject: string, html: string) => {
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
  } catch (error: any) {
    console.error(
      "Brevo Mail Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const generateCitizenVerificationEmail = (userName: string, otp: string) => {
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

export const generateForgotPasswordEmail = (userName: string, otp: string) => {
  const subject = `ShohorOS - Password Reset OTP Request`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShohorOS Password Reset</title>
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
        background-color: #fef2f2;
        border: 2px dashed #ef4444;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #dc2626;
        margin: 10px 0;
      }
      .otp-notice {
        font-size: 13px;
        color: #7f1d1d;
      }
      .security-warning {
        background-color: #fffbeeb;
        border-left: 4px solid #f59e0b;
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 13px;
        color: #b45309;
        margin-top: 20px;
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
        <p>Password Reset Request</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        <p>We received a request to reset the password for your <strong>ShohorOS</strong> account. Please use the verification code below to proceed with resetting your password.</p>
        
        <div class="otp-box">
          <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">Password Reset OTP</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-notice">This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>

        <div class="security-warning">
          <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email immediately and ensure your account password remains secure. Never share this OTP with anyone.
        </div>
        
        <p style="margin-top: 30px; margin-bottom: 0;">Best regards,<br><strong>ShohorOS Security Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ShohorOS. All rights reserved.<br>
        This is an automated security message, please do not reply to this email.
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
};

export const generateApplicationAcceptedEmail = (userName: string, loginUrl = `${process.env.CORS_ORIGIN}/login`) => {
  const subject = `ShohorOS - Congratulations! Your Citizen Application Has Been Approved`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Approved</title>
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
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        padding: 30px;
        text-align: center;
        color: #ffffff;
      }
      .email-header h1 {
        margin: 0;
        font-size: 26px;
        letter-spacing: 1px;
      }
      .email-header p {
        margin: 5px 0 0 0;
        font-size: 14px;
        color: #d1fae5;
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
      .status-badge {
        display: inline-block;
        background-color: #dcfce7;
        color: #15803d;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 20px;
      }
      .btn-container {
        text-align: center;
        margin: 30px 0;
      }
      .btn-login {
        background-color: #059669;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 32px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        display: inline-block;
        box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);
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
        <p>Application Status Update</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        <div class="status-badge">✓ Application Approved</div>
        
        <p>We are pleased to inform you that your registration application for <strong>ShohorOS</strong> has been reviewed and <strong>approved</strong> by the administrator.</p>
        
        <p>You now have full access to all ShohorOS citizen portal services. Click the button below to log into your account and explore your dashboard.</p>
        
        <div class="btn-container">
          <a href="${loginUrl}" class="btn-login" target="_blank">Login to Dashboard</a>
        </div>

        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        
        <p style="margin-top: 30px; margin-bottom: 0;">Warm regards,<br><strong>ShohorOS Administration Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ShohorOS. All rights reserved.<br>
        This is an automated notification, please do not reply to this email.
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
};

export const generateApplicationRejectedEmail = (userName: string, rejectionReason: string) => {
  const subject = `ShohorOS - Update Regarding Your Citizen Application`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
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
      .reason-box {
        background-color: #fef2f2;
        border-left: 4px solid #ef4444;
        padding: 16px 20px;
        border-radius: 4px;
        margin: 20px 0;
      }
      .reason-title {
        font-weight: 600;
        color: #991b1b;
        margin-bottom: 6px;
        font-size: 14px;
      }
      .reason-text {
        color: #7f1d1d;
        margin: 0;
        font-size: 14px;
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
        <p>Application Status Update</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        
        <p>Thank you for applying for a citizen account on <strong>ShohorOS</strong>. After reviewing your registration application, we regret to inform you that your application could not be approved at this time.</p>
        
        <div class="reason-box">
          <div class="reason-title">Reason for Rejection:</div>
          <p class="reason-text">${rejectionReason || "Required information or documents provided were incomplete or invalid."}</p>
        </div>

        <p>You are welcome to submit a new application with the corrected information or valid documents at any time.</p>
        
        <p>If you believe this was an error or if you have questions, please contact our support desk.</p>
        
        <p style="margin-top: 30px; margin-bottom: 0;">Regards,<br><strong>ShohorOS Verification Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ShohorOS. All rights reserved.<br>
        This is an automated notification, please do not reply to this email.
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
};