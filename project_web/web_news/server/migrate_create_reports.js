import { db } from "./db.js";

const migrate = () => {
  const q = `
    CREATE TABLE IF NOT EXISTS Reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      post_id INT NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
    )
  `;
  
  db.query(q, (err, data) => {
    if (err) {
      console.error("Error creating Reports table:", err);
    } else {
      console.log("Reports table created successfully.");
    }
    process.exit();
  });
};

migrate();
