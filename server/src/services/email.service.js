import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js";

const sendEmail = async (options) => {
    // 1. Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // secure: true, // Use 'true' if your port is 465
        auth: {
            user: process.env.SMTP_EMAIL, // Your email service username
            pass: process.env.SMTP_PASSWORD, // Your email service password
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: `Sanjeevani <${process.env.SMTP_EMAIL}>`, // Sender address
        to: options.email, // List of receivers
        subject: options.subject, // Subject line
        html: options.message, // HTML body
    };

    // 3. Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        // Throw a specific error that the controller can catch
        throw new ApiError(500, "Failed to send email.");
    }
};

export { sendEmail };