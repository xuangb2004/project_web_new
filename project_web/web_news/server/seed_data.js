import { db } from "./db.js";

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const titles = [
  "Công nghệ AI đang thay đổi thế giới như thế nào?",
  "Top 10 địa điểm du lịch hấp dẫn nhất năm 2024",
  "Bí quyết nấu ăn ngon mỗi ngày",
  "Thị trường bất động sản: Cơ hội và thách thức",
  "Review sách: Đắc Nhân Tâm",
  "Học lập trình bắt đầu từ đâu?",
  "Sức khỏe và đời sống: Những điều cần biết",
  "Xu hướng thời trang mùa hè 2024",
  "Kinh nghiệm phỏng vấn xin việc thành công",
  "Những bộ phim đáng xem nhất trên Netflix",
  "Cách quản lý tài chính cá nhân hiệu quả",
  "Khám phá ẩm thực đường phố Việt Nam",
  "Lợi ích của việc đọc sách mỗi ngày",
  "Hướng dẫn tự học tiếng Anh tại nhà",
  "Những phát minh vĩ đại nhất lịch sử",
  "Bảo vệ môi trường: Hành động nhỏ, ý nghĩa lớn",
  "Tương lai của xe điện",
  "Làm sao để cân bằng giữa công việc và cuộc sống?",
  "Những kỹ năng mềm cần thiết cho sinh viên",
  "Top 5 smartphone đáng mua nhất hiện nay"
];

const contents = [
  "Nội dung bài viết này rất thú vị và bổ ích. Hãy cùng khám phá nhé!",
  "Đây là một chủ đề đang được rất nhiều người quan tâm. Bạn nghĩ sao về vấn đề này?",
  "Bài viết chia sẻ những kinh nghiệm thực tế và hữu ích. Hy vọng sẽ giúp ích cho bạn.",
  "Thông tin chi tiết và cập nhật mới nhất về chủ đề này. Đừng bỏ lỡ!",
  "Hãy cùng thảo luận và chia sẻ ý kiến của bạn ở phần bình luận nhé."
];

const seed = async () => {
  try {
    console.log("Starting seed...");

    // 0. Ensure ReadHistory table exists
    await query(`
      CREATE TABLE IF NOT EXISTS ReadHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
      )
    `);
    console.log("ReadHistory table checked/created.");

    // 1. Get Users
    let users = await query("SELECT id FROM Users");
    if (users.length === 0) {
      console.log("No users found. Creating a dummy user...");
      await query("INSERT INTO Users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)", 
        ['seed_user', 'seed@example.com', 'hash', 1]); 
      users = await query("SELECT id FROM Users");
    }
    const userIds = users.map(u => u.id);

    // 2. Get Categories
    let categories = await query("SELECT id FROM Categories");
    if (categories.length === 0) {
      console.log("No categories found. Creating a dummy category...");
      await query("INSERT INTO Categories (name) VALUES (?)", ['General']);
      categories = await query("SELECT id FROM Categories");
    }
    const catIds = categories.map(c => c.id);

    // 3. Check and Generate Posts
    const postsCountResult = await query("SELECT COUNT(*) as count FROM Posts");
    const currentCount = postsCountResult[0].count;
    const targetCount = 150;
    
    if (currentCount < targetCount) {
      const needed = targetCount - currentCount;
      console.log(`Generating ${needed} posts...`);
      const postsToInsert = [];
      const now = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);

      for (let i = 0; i < needed; i++) {
        const title = `${randomItem(titles)} - #${currentCount + i + 1}`;
        const content = randomItem(contents) + " " + randomItem(contents);
        const userId = randomItem(userIds);
        const catId = randomItem(catIds);
        const createdAt = generateRandomDate(oneMonthAgo, now);
        const thumbnail = `https://picsum.photos/seed/${currentCount + i}/800/400`; 

        postsToInsert.push([userId, catId, title, content, thumbnail, 'approved', createdAt]);
      }

      if (postsToInsert.length > 0) {
        const sql = "INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, created_at) VALUES ?";
        await query(sql, [postsToInsert]);
      }
      console.log("Posts inserted.");
    } else {
      console.log(`Already have ${currentCount} posts. Skipping post generation.`);
    }

    // 4. Generate ReadHistory
    console.log("Generating ReadHistory...");
    const posts = await query("SELECT id FROM Posts");
    const postIds = posts.map(p => p.id);
    
    const readsToInsert = [];
    // Generate ~500 reads
    for (let i = 0; i < 500; i++) {
      const uid = randomItem(userIds);
      const pid = randomItem(postIds);
      readsToInsert.push([uid, pid]);
    }

    if (readsToInsert.length > 0) {
      const sql = "INSERT INTO ReadHistory (user_id, post_id) VALUES ?";
      await query(sql, [readsToInsert]);
    }
    console.log("ReadHistory inserted.");

    // 5. Ensure view_count column exists in Posts table
    console.log("Checking view_count column...");
    try {
      const columnCheck = await query(`
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Posts'
        AND COLUMN_NAME = 'view_count'
      `);
      
      if (columnCheck[0].count === 0) {
        await query(`
          ALTER TABLE Posts 
          ADD COLUMN view_count INT DEFAULT 0
        `);
        console.log("view_count column added to Posts table.");
      } else {
        console.log("view_count column already exists.");
      }
    } catch (err) {
      console.error("Error checking/adding view_count column:", err.message);
      throw err;
    }

    // 6. Update view_count
    console.log("Updating view_count...");
    await query(`
      UPDATE Posts
      SET view_count = COALESCE((
        SELECT COUNT(*)
        FROM ReadHistory
        WHERE ReadHistory.post_id = Posts.id
      ), 0)
    `);
    console.log("view_count updated.");

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
