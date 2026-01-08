
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log("--- TEST GỬI EMAIL ---");
console.log("Email User:", emailUser);
console.log("Email Pass:", emailPass ? "****** (Đã có)" : "Chưa có");

if (!emailUser || !emailPass) {
    console.error("Lỗi: Chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trong file .env");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Đổi sang 465 (SSL)
    secure: true, // 465 bắt buộc true
    auth: {
        user: emailUser,
        pass: emailPass, 
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4 // Ép dùng IPv4
});

async function main() {
    try {
        console.log("Đang kiểm tra kết nối tới Gmail...");
        await transporter.verify();
        console.log("Kết nối SMTP thành công!");

        console.log(`Đang thử gửi mail tới chính bạn (${emailUser})...`);
        const info = await transporter.sendMail({
            from: `"Test Server" <${emailUser}>`,
            to: emailUser, // Gửi lại cho chính mình để test
            subject: "Test Email Node.js Web News",
            text: "Nếu bạn nhận được email này, cấu hình gửi mail đã thành công!",
            html: "<b>Nếu bạn nhận được email này, cấu hình gửi mail đã thành công!</b>",
        });

        console.log("Message sent: %s", info.messageId);
        console.log("KIỂM TRA HỘP THƯ GMAIL CỦA BẠN NGAY!");
    } catch (error) {
        console.error("LỖI GỬI EMAIL:", error);
    }
}

main();
