const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send email verification
  async sendVerificationEmail(email, token, firstName) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Carbon SIH" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Email - Carbon SIH",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Carbon SIH</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Verify Your Email Address</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with Carbon SIH. To complete your registration and access your dashboard, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #6b7280; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Email verification error:", error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, firstName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Carbon SIH" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password - Carbon SIH",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Carbon SIH</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. If you didn't make this request, 
              you can safely ignore this email.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #6b7280; font-size: 14px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This link will expire in 1 hour. For security reasons, please don't share this email with anyone.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Password reset email error:", error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName, role) {
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

    const mailOptions = {
      from: `"Carbon SIH" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Carbon SIH!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Carbon SIH</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Welcome to the Platform!</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Welcome ${firstName}! 🎉</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining Carbon SIH! Your account has been successfully created and verified.
            </p>
            
            <div style="background: #e0f2fe; border-left: 4px solid #0288d1; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0277bd;">
                <strong>Your Role:</strong> ${
                  role.charAt(0).toUpperCase() + role.slice(1)
                }
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              You can now access your personalized dashboard and start exploring the platform's features.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: 600;">
                Go to Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              If you have any questions, feel free to contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Welcome email error:", error);
      return false;
    }
  }

  // Send role change notification
  async sendRoleChangeEmail(email, firstName, oldRole, newRole) {
    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

    const mailOptions = {
      from: `"Carbon SIH" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Role Has Been Updated - Carbon SIH",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Carbon SIH</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Role Update Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2 style="color: #374151; margin-bottom: 20px;">Hello ${firstName}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">
              Your account role has been updated by an administrator.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Previous Role:</strong> ${
                  oldRole.charAt(0).toUpperCase() + oldRole.slice(1)
                }<br>
                <strong>New Role:</strong> ${
                  newRole.charAt(0).toUpperCase() + newRole.slice(1)
                }
              </p>
            </div>
            
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 25px;">
              This change may affect your access to certain features and dashboard sections. 
              Please log in to see your updated dashboard.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: 600;">
                Access Dashboard
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              If you believe this change was made in error, please contact our support team immediately.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Role change email error:", error);
      return false;
    }
  }

  // Test email service
  async testConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service connection test failed:", error);
      return false;
    }
  }
}

module.exports = new EmailService();


