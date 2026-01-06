import { db } from "./db.js";

const migrationQuery = `
CREATE TABLE IF NOT EXISTS Reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);
`;

console.log("🔄 Starting migration: Create Reports table...");

db.query(migrationQuery, (err, result) => {
  if (err) {
    console.error("❌ Migration failed:", err);
  } else {
    console.log("✅ Migration successful: Reports table created!");
  }
  process.exit();
});
