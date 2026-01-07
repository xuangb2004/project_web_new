import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, htmlContent) => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();

  if (!emailUser || !emailPass) {
    console.error("❌ Lỗi: Thiếu biến môi trường EMAIL_USER hoặc EMAIL_PASS");
    return; 
  }

  try {
    // SỬ DỤNG CỔNG 587 VÀ IPv4 (Giải pháp sửa lỗi Timeout)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,            // Dùng cổng 587 thay vì 465
      secure: false,        // false cho cổng 587 (dùng STARTTLS)
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false // Bỏ qua lỗi chứng chỉ nếu có
      },
      // ⚠️ QUAN TRỌNG: Ép dùng IPv4 để tránh lỗi mạng trên Render
      family: 4, 
    });

    // Kiểm tra kết nối
    await transporter.verify();
    console.log("✅ Kết nối Gmail thành công!");

    const mailOptions = {
      from: `"MyNews Admin" <${emailUser}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email đã gửi đến: ${to}`);
    return info;

  } catch (error) {
    console.error("❌ Gửi mail thất bại:", error.message);
    return null; 
  }
};