import { db } from "./db.js";

const checkUsers = () => {
  const q = "SELECT id, username, email, role_id FROM Users WHERE role_id = 2";
  db.query(q, (err, data) => {
    if (err) {
      console.error("Error fetching users:", err);
    } else {
      console.log("Editor accounts found:");
      console.table(data);
    }
    process.exit();
  });
};

checkUsers();
