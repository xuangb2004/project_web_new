import { db } from "./db.js";

const migrate = () => {
  const q = "ALTER TABLE Posts ADD COLUMN view_count INT DEFAULT 0";
  
  db.query(q, (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("Column view_count already exists.");
      } else {
        console.error("Error adding column:", err);
      }
    } else {
      console.log("Column view_count added successfully.");
    }
    process.exit();
  });
};

migrate();
