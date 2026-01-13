import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Sử dụng createPool để tự động quản lý kết nối bị rớt
export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "web_news",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  // ⚠️ QUAN TRỌNG: Database free chỉ cho 5 connection.
  connectionLimit: 2, 
  queueLimit: 0,
});

// Kiểm tra kết nối (Optional)
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Kết nối Database thất bại:", err.message);
  } else {
    console.log("✅ Kết nối Database thành công!");
    connection.release(); // Trả kết nối về bể ngay
  }
});