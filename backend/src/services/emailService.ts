import nodemailer from 'nodemailer';
// import { IUser } from '../models/User';

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransport(emailConfig);
};

interface NewMessageEmailParams {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  propertyAddress: string;
  propertyCity: string;
  messagePreview: string;
  conversationUrl: string;
}

export const sendNewMessageNotification = async (params: NewMessageEmailParams): Promise<void> => {
  try {
    // Skip if email credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 Email service not configured. Skipping email notification.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Balkan Estate" <${process.env.EMAIL_USER}>`,
      to: params.recipientEmail,
      subject: `New inquiry about your property: ${params.propertyAddress}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message Notification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center; background-color: #f5f5f5;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        📬 New Message
                      </h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${params.recipientName}</strong>,
                      </p>

                      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                        <strong>${params.senderName}</strong> has made an inquiry about your property:
                      </p>

                      <!-- Property Info Box -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 0 0 20px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #667eea; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                          Property
                        </p>
                        <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600;">
                          ${params.propertyAddress}, ${params.propertyCity}
                        </p>
                      </div>

                      <!-- Message Preview -->
                      <div style="background-color: #ffffff; border: 1px solid #e0e0e0; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; font-weight: 600;">
                          Message Preview:
                        </p>
                        <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; font-style: italic;">
                          "${params.messagePreview.substring(0, 150)}${params.messagePreview.length > 150 ? '...' : ''}"
                        </p>
                      </div>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 0 0 20px 0;">
                        <a href="${params.conversationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                          View & Reply
                        </a>
                      </div>

                      <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Or copy this link: <br/>
                        <a href="${params.conversationUrl}" style="color: #667eea; word-break: break-all;">${params.conversationUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                        <strong>Balkan Estate</strong> - Your trusted real estate platform
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        You're receiving this email because someone messaged you about your property listing.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hi ${params.recipientName},

${params.senderName} has made an inquiry about your property:

Property: ${params.propertyAddress}, ${params.propertyCity}

Message Preview:
"${params.messagePreview.substring(0, 200)}${params.messagePreview.length > 200 ? '...' : ''}"

View and reply to this message at: ${params.conversationUrl}

---
Balkan Estate - Your trusted real estate platform
      `.trim(),
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email notification sent to ${params.recipientEmail}`);
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    // Don't throw error - email is a nice-to-have, not critical
  }
};

interface WelcomeEmailParams {
  email: string;
  name: string;
}

export const sendWelcomeEmail = async (params: WelcomeEmailParams): Promise<void> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 Email service not configured. Skipping welcome email.');
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Balkan Estate" <${process.env.EMAIL_USER}>`,
      to: params.email,
      subject: 'Welcome to Balkan Estate! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Balkan Estate</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 40px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #667eea; margin-bottom: 20px;">Welcome to Balkan Estate! 🏡</h1>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Hi ${params.name},
            </p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Thank you for joining Balkan Estate! We're excited to help you find your dream property or sell your listing.
            </p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Get started by exploring properties, saving your searches, or listing your own property.
            </p>
            <p style="color: #666666; font-size: 14px; margin-top: 40px;">
              Best regards,<br/>
              The Balkan Estate Team
            </p>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${params.email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};
