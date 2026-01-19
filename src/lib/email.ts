import nodemailer from 'nodemailer'

// Configure your email service here
// For development, you can use a service like Mailtrap or Gmail
// For production, use your email service provider credentials

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
})

export interface EmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

export async function sendEmail(options: EmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@taskflow.pro',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        })

        console.log('Email sent:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error }
    }
}

export function generatePasswordResetEmail(resetLink: string, userName?: string) {
    return {
        subject: 'Reset Your TaskFlow Pro Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'User'},</p>
                        <p>We received a request to reset your password. Click the button below to proceed:</p>
                        <a href="${resetLink}" class="button">Reset Password</a>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 TaskFlow Pro. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Reset your password by visiting: ${resetLink}`,
    }
}

export function generateAccountUpdateEmail(changes: string, userName?: string) {
    return {
        subject: 'Your TaskFlow Pro Account Has Been Updated',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; }
                    .alert { background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
                    .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Account Update Notification</h1>
                    </div>
                    <div class="content">
                        <p>Hello ${userName || 'User'},</p>
                        <p>Your TaskFlow Pro account has been updated with the following changes:</p>
                        <div class="alert">${changes}</div>
                        <p>If you did not make this change, please contact our support team immediately.</p>
                        <p>Your account security is important to us.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 TaskFlow Pro. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Your account has been updated: ${changes}`,
    }
}

export function generatePasswordChangedEmail(userName?: string) {
    return generateAccountUpdateEmail('Your password has been successfully changed.', userName)
}
