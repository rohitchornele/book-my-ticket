import nodemailer from "nodemailer";

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    })
}

export const sendVerificationEmail = async (user, verificationUrl) => {
    try {
        const transporter = createTransporter();

        const cleanUrl = verificationUrl.trim();

        const message = {
            from: `"MERN Auth" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Email verification - MERN Auth",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Email Verification</title>
                </head>
                <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
                    <tr>
                        <td align="center">
                        
                        <table width="500" cellpadding="0" cellspacing="0" 
                            style="background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                            
                            <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h2 style="margin:0; color:#333;">Verify Your Email</h2>
                            </td>
                            </tr>

                            <tr>
                            <td style="color:#555; font-size:14px; line-height:1.6;">
                                <p>Hi ${user.name},</p>
                                <p>Thank you for registering. Please click the button below to verify your email address.</p>
                            </td>
                            </tr>

                            <tr>
                            <td align="center" style="padding:25px 0;">
                                <a href="${cleanUrl}" 
                                style="background:#4f46e5; color:#ffffff; text-decoration:none; 
                                padding:12px 25px; border-radius:5px; display:inline-block; font-size:14px;">
                                Verify Email
                                </a>
                            </td>
                            </tr>

                            <tr>
                            <td style="color:#888; font-size:12px; line-height:1.5;">
                                <p>If the button is not working, copy below link and paste into your browser <br/> ${cleanUrl}</p>
                            </td>
                            </tr>

                        </table>

                        </td>
                    </tr>
                    </table>
                </body>
                </html>
            `,
        }


        const info = await transporter.sendMail(message);
        console.log("Email sent successfully");

    } catch (error) {
        console.error("EMAIL SERVICE ERROR : ", error.message)
    }
}


export const sendPasswordResetEmail = async (user, resetUrl) => {
    try {
        const transporter = createTransporter();

        const cleanUrl = resetUrl.trim();

        const message = {
            from: `"MERN Auth Support " <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>Reset Password</title>
                </head>
                <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
                    <tr>
                        <td align="center">
                        
                        <table width="500" cellpadding="0" cellspacing="0" 
                            style="background:#ffffff; padding:30px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
                            
                            <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <h2 style="margin:0; color:#333;">Reset Your Password</h2>
                            </td>
                            </tr>

                            <tr>
                            <td style="color:#555; font-size:14px; line-height:1.6;">
                                <p>Hi ${user.name},</p>
                                <p> Please click the button below to verify reset your password, This link is valid for only 10 minutes.</p>
                            </td>
                            </tr>

                            <tr>
                            <td align="center" style="padding:25px 0;">
                                <a href="${cleanUrl}" 
                                style="background:#4f46e5; color:#ffffff; text-decoration:none; 
                                padding:12px 25px; border-radius:5px; display:inline-block; font-size:14px;">
                                Reset Password
                                </a>
                            </td>
                            </tr>

                            <tr>
                            <td style="color:#888; font-size:12px; line-height:1.5;">
                                <p>If the button is not working, copy below link and paste into your browser <br/> ${cleanUrl}</p>
                            </td>
                            </tr>

                        </table>

                        </td>
                    </tr>
                    </table>
                </body>
                </html>
            `,
        }


        const info = await transporter.sendMail(message);
        console.log("Email sent successfully");

    } catch (error) {
        console.error("EMAIL SERVICE ERROR : ", error.message)
    }
}