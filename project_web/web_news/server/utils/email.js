import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, htmlContent) => {
  const emailUser = (process.env.EMAIL_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || "").trim();

  if (!emailUser || !emailPass) {
    console.error("❌ Lỗi: Thiếu biến môi trường EMAIL_USER hoặc EMAIL_PASS");
    return; // Dừng hàm để không crash server
  }

  try {
    // CẤU HÌNH THỦ CÔNG (Thay vì dùng service: 'gmail')
    // Cách này ổn định hơn trên Render/Cloud
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Dùng SSL (bắt buộc cho port 465)
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Tăng thời gian chờ kết nối lên 10 giây (mặc định là quá ngắn)
      connectionTimeout: 10000, 
    });

    // Kiểm tra kết nối trước khi gửi
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
    // Không throw error để tránh làm crash server nếu gửi mail lỗi
    return null; 
  }
};