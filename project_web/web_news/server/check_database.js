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

console.log("🔍 Checking database...\n");

// Check if database exists
connection.query("SHOW DATABASES LIKE ?", [process.env.DB_NAME || "web_news"], (err, results) => {
  if (err) {
    console.error("❌ Error:", err);
    connection.end();
    return;
  }

  if (results.length === 0) {
    console.log("❌ Database 'web_news' does not exist");
    connection.end();
    return;
  }

  console.log("✅ Database 'web_news' exists\n");

  // Show all tables
  connection.query("SHOW TABLES", (err, tables) => {
    if (err) {
      console.error("❌ Error showing tables:", err);
      connection.end();
      return;
    }

    console.log("📊 Tables in database:");
    tables.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    console.log();

    // Show users table structure
    connection.query("DESCRIBE users", (err, structure) => {
      if (err) {
        console.error("❌ Error describing users table:", err);
        connection.end();
        return;
      }

      console.log("📋 Users table structure:");
      console.table(structure);
      console.log();

      // Show all users (without passwords)
      connection.query("SELECT id, username,status, email, created_at FROM users", (err, users) => {
        if (err) {
          console.error("❌ Error fetching users:", err);
          connection.end();
          return;
        }

        console.log(`👥 Users in database (${users.length} total):`);
        if (users.length === 0) {
          console.log("   No users found");
        } else {
          console.table(users);
        }
        console.log();

        // Show all categories
        connection.query("SELECT id, name, description FROM Categories ORDER BY id ASC", (err, categories) => {
          if (err) {
            console.error("❌ Error fetching categories:", err);
            connection.end();
            return;
          }

          console.log(`📂 Categories in database (${categories.length} total):`);
          if (categories.length === 0) {
            console.log("   No categories found");
          } else {
            console.table(categories);
          }
          console.log();

          // Show today's posts
        const todayQuery = `
          SELECT p.id, p.title, u.username, c.name as category, p.status, p.is_featured, p.created_at
          FROM Posts p
          LEFT JOIN Users u ON u.id = p.user_id
          LEFT JOIN Categories c ON c.id = p.category_id
          WHERE DATE(p.created_at) = CURDATE()
          ORDER BY p.created_at DESC
        `;

        connection.query(todayQuery, (err, todayPosts) => {
          if (err) {
            console.error("❌ Error fetching today's posts:", err);
            connection.end();
            return;
          }

          console.log(`📰 Posts created today (${todayPosts.length} total):`);
          if (todayPosts.length === 0) {
            console.log("   No posts found for today");
          } else {
            console.table(todayPosts);
          }

          connection.end();
        });
        });
      });
    });
  });
});

