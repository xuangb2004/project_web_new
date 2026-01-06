import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "web_news",
  port: process.env.DB_PORT || 3307,
});

console.log("🔧 Đang kiểm tra và thêm cột 'status' vào bảng Users...\n");

// Check if status column exists
connection.query(
  `SELECT COLUMN_NAME 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = ? 
   AND TABLE_NAME = 'Users' 
   AND COLUMN_NAME = 'status'`,
  [process.env.DB_NAME || "web_news"],
  (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi kiểm tra cột:", err.message);
      connection.end();
      return;
    }

    if (results.length > 0) {
      console.log("✅ Cột 'status' đã tồn tại trong bảng Users.");
      connection.end();
      return;
    }

    // Add status column and other missing columns
    console.log("📝 Đang thêm cột 'status' và các cột khác...\n");

    const alterQueries = `
      ALTER TABLE Users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS age INT,
      ADD COLUMN IF NOT EXISTS years_of_experience INT,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS dob DATE,
      ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'other') DEFAULT 'male',
      ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
    `;

    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
    // So we'll add them one by one with error handling
    const columnsToAdd = [
      { name: "name", sql: "ADD COLUMN name VARCHAR(100)" },
      { name: "age", sql: "ADD COLUMN age INT" },
      { name: "years_of_experience", sql: "ADD COLUMN years_of_experience INT" },
      { name: "phone", sql: "ADD COLUMN phone VARCHAR(20)" },
      { name: "address", sql: "ADD COLUMN address TEXT" },
      { name: "dob", sql: "ADD COLUMN dob DATE" },
      { name: "gender", sql: "ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT 'male'" },
      { name: "status", sql: "ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'" },
    ];

    let completed = 0;
    const total = columnsToAdd.length;

    columnsToAdd.forEach((col) => {
      connection.query(`ALTER TABLE Users ${col.sql}`, (alterErr) => {
        if (alterErr) {
          // Column might already exist, which is fine
          if (alterErr.code === "ER_DUP_FIELDNAME") {
            console.log(`ℹ️  Cột '${col.name}' đã tồn tại, bỏ qua.`);
          } else {
            console.error(`❌ Lỗi khi thêm cột '${col.name}':`, alterErr.message);
          }
        } else {
          console.log(`✅ Đã thêm cột '${col.name}' thành công.`);
        }

        completed++;
        if (completed === total) {
          console.log("\n✅ Hoàn tất migration!");
          connection.end();
        }
      });
    });
  }
);

