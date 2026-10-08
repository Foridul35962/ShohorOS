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
          <p class="otp-notice">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
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

export const generateAdminCreatedUserOTPEmail = ({ userName, role, otp }: { userName: string, role: string, otp: string }) => {
  const subject = `ShohorOS - Account Creation Verification Code (${role})`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Setup OTP</title>
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
      .info-box {
        background-color: #f8fafc;
        border-left: 4px solid #0284c7;
        padding: 14px 18px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
      }
      .info-item {
        margin: 4px 0;
        font-size: 14px;
      }
      .role-badge {
        display: inline-block;
        background-color: #e0f2fe;
        color: #0369a1;
        padding: 2px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 13px;
      }
      .otp-box {
        background-color: #f0fdf4;
        border: 2px dashed #16a34a;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #15803d;
        margin: 10px 0;
      }
      .instruction-box {
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
        <p>Admin Assisted Account Setup</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        <p>An account creation process has been initiated for you by the <strong>ShohorOS Admin Panel</strong>.</p>
        
        <div class="info-box">
          <div class="info-item"><strong>Account Name:</strong> ${userName}</div>
          <div class="info-item"><strong>Assigned Role:</strong> <span class="role-badge">${role}</span></div>
        </div>

        <p>Please share the verification OTP below with the administrator in front of you to complete your account setup:</p>

        <div class="otp-box">
          <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">Verification OTP</p>
          <div class="otp-code">${otp}</div>
          <p style="margin: 0; font-size: 13px; color: #15803d;">Valid for on-spot verification</p>
        </div>

        <div class="instruction-box">
          <strong>Instructions:</strong> Verbally state this OTP code to the admin to finalize your account creation and role assignment.
        </div>

        <p style="margin-top: 30px; margin-bottom: 0;">Best regards,<br><strong>ShohorOS Admin Team</strong></p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} ShohorOS. All rights reserved.<br>
        If you are not present with an admin, please ignore this email.
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
};

export const generateContractorRegistrationEmail = ({ userName, companyName, otp }: { userName: string, companyName: string, otp: string }) => {
  const subject = `ShohorOS - Verification Code for ${companyName} Contractor Registration`;

  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contractor Company Registration OTP</title>
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
      .company-box {
        background-color: #f8fafc;
        border-left: 4px solid #0284c7;
        padding: 14px 18px;
        margin: 20px 0;
        border-radius: 0 8px 8px 0;
      }
      .company-item {
        margin: 4px 0;
        font-size: 14px;
      }
      .company-badge {
        display: inline-block;
        background-color: #e0f2fe;
        color: #0369a1;
        padding: 2px 10px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 13px;
      }
      .otp-box {
        background-color: #f0fdf4;
        border: 2px dashed #16a34a;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin: 25px 0;
      }
      .otp-code {
        font-size: 36px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #15803d;
        margin: 10px 0;
      }
      .otp-notice {
        font-size: 13px;
        color: #166534;
        margin: 0;
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
        <p>Contractor Portal Registration</p>
      </div>
      <div class="email-body">
        <div class="greeting">Hello, ${userName}!</div>
        <p>Thank you for initiating the company registration process on <strong>ShohorOS Contractor Portal</strong>.</p>
        
        <div class="company-box">
          <div class="company-item"><strong>Applicant Name:</strong> ${userName}</div>
          <div class="company-item"><strong>Company Name:</strong> <span class="company-badge">${companyName}</span></div>
        </div>

        <p>To verify your email and proceed with your company registration request, please use the One-Time Password (OTP) provided below:</p>

        <div class="otp-box">
          <p style="margin: 0; font-size: 14px; color: #166534; font-weight: 600;">Registration Verification OTP</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-notice">This OTP is valid for <strong>10 minutes</strong>.</p>
        </div>

        <p>If you did not initiate this company registration request, please ignore this email.</p>

        <p style="margin-top: 30px; margin-bottom: 0;">Best regards,<br><strong>ShohorOS Contractor Verification Team</strong></p>
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

export const generateContractorAcceptedEmail = ({ userName, companyName }: { userName: string, companyName: string }) => {
  const subject = `Welcome to ${companyName}, ${userName}!`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f6f8; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 20px 0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #4f46e5; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">${companyName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px; color: #333333; line-height: 1.6;">
              <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Hello ${userName},</h2>
              <p style="margin-bottom: 20px; font-size: 16px; color: #4b5563;">
                Welcome aboard! We are absolutely thrilled to have you join us at <strong>${companyName}</strong>.
              </p>
              <p style="margin-bottom: 30px; font-size: 16px; color: #4b5563;">
                Your account is ready to go. Click the button below to get started and explore your dashboard.
              </p>
              
              <!-- Action Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #4f46e5;">
                    <a href="${process.env.CORS_ORIGIN}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                If you have any questions, feel free to reply to this email. We're always here to help!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
};

export const generatedContractorRejectionEmailTemplate = (userName: string, reason: string) => {
  const subject = "ShohorOS - Contractor Registration Request Status Update";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
          background-color: #dc2626;
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .reason-box {
          background-color: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 16px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .reason-title {
          font-weight: 600;
          color: #991b1b;
          margin-bottom: 6px;
        }
        .reason-text {
          color: #7f1d1d;
          margin: 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h2>Request Status Update</h2>
        </div>
        <div class="content">
          <p class="greeting">Hello ${userName},</p>
          <p>Thank you for submitting your contractor request. After a careful review, our administration team has decided not to approve your request at this time.</p>
          
          <div class="reason-box">
            <div class="reason-title">Reason for Rejection:</div>
            <p class="reason-text">${reason || 'No specific reason provided.'}</p>
          </div>

          <p>If you believe this decision was made in error or if you have updated details to submit, please feel free to reach out or submit a new request.</p>
          
          <p>Best regards,<br><strong>ShohorOS Admin Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};