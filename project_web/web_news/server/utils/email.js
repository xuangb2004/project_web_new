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
    // Cấu hình SMTP (Ưu tiên lấy từ ENV, nếu không có thì mặc định dùng Gmail)
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    // Nếu dùng Gmail mà không cấu hình PORT -> Tự động dùng 465 (SSL) an toàn hơn 587 trên cloud
    const port = Number(process.env.SMTP_PORT) || (host === "smtp.gmail.com" ? 465 : 587);
    const secure = process.env.SMTP_SECURE === "true" || port === 465; // 465 luôn cần secure: true

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,       
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      },
      // ⚠️ QUAN TRỌNG: Ép dùng IPv4 để tránh lỗi mạng trên Render/Cloud
      family: 4, 
      // Thêm timeout để tránh treo (10s)
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Kiểm tra kết nối
    await transporter.verify();
    console.log(`✅ Kết nối SMTP (${host}) thành công!`);

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