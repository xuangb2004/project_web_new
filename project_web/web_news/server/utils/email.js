import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, htmlContent) => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();

  if (!emailUser || !emailPass) {
    const msg = "Missing EMAIL_USER or EMAIL_PASS environment variables for sending mail.";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify transporter connection and auth
    await transporter.verify();
    console.log("✅ Email transporter verified successfully for", emailUser);

    const mailOptions = {
      from: `"MyNews Admin" <${emailUser}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error && (error.message || error));
    console.error("Hint: ensure EMAIL_USER and EMAIL_PASS are correct. If using Gmail, create an App Password (16 chars) and put it in .env without spaces.");
    // Re-throw so caller can log / handle the error
    throw error;
  }
};