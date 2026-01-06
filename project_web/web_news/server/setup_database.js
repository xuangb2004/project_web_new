import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình kết nối
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT || 3306,
  multipleStatements: true // QUAN TRỌNG: Cho phép chạy nhiều lệnh SQL cùng lúc
});

const dbName = "web_news"; // Tên Database

console.log("🚀 Đang khởi tạo Database News Website...");

const initQuery = `
  -- 1. Reset Database
  DROP DATABASE IF EXISTS ${dbName};
  CREATE DATABASE ${dbName};
  USE ${dbName};

  -- 2. Bảng Roles
  CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
  );

  -- 3. Bảng Users (Có avatar và thông tin editor)
  CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    avatar VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    -- Thông tin Editor (cho đăng ký)
    name VARCHAR(100),
    age INT,
    years_of_experience INT,
    -- Thông tin chi tiết (cho admin quản lý)
    article_count INT DEFAULT 0,
    total_likes INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
  );
  ALTER TABLE Users 
ADD COLUMN phone VARCHAR(20),
ADD COLUMN address TEXT,
ADD COLUMN dob DATE, -- Ngày sinh
ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT 'male',
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';

  -- 4. Bảng Categories (Danh mục)
  CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
  );

  -- 5. Bảng Tags
  CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
  );

  -- 6. Bảng Posts (Bài viết - Có thumbnail & status)
  CREATE TABLE Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL, -- Cho phép NULL để khi xóa danh mục bài viết không mất
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    thumbnail VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
  );

  -- 7. Bảng PostTags
  CREATE TABLE PostTags (
    post_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
  );

  -- 8. Bảng Comments
  CREATE TABLE Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );
  ALTER TABLE Comments 
ADD COLUMN parent_id INT DEFAULT NULL,
ADD CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES Comments(id) ON DELETE CASCADE;

  -- 9. Bảng Likes (Thích bài viết)
  CREATE TABLE Likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (post_id, user_id), -- Mỗi người chỉ like 1 lần/bài
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
  );

  -- 10. Bảng NewsStats (Thống kê bài viết)
  CREATE TABLE NewsStats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    view_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    rating_avg FLOAT DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
  );
  -- 11. Bảng Bookmarks (Lưu bài viết)
CREATE TABLE IF NOT EXISTS Bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bookmark (user_id, post_id), -- Mỗi bài chỉ lưu 1 lần
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);
-- 12.Bảng ReadHistory (Lịch sử xem)
CREATE TABLE IF NOT EXISTS ReadHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);

  -- ==========================================
  -- SEED DATA (DỮ LIỆU MẪU)
  -- ==========================================

  -- 1. Roles
  INSERT INTO Roles (name) VALUES ('Admin'), ('Editor'), ('User');

  -- 2. Users (Pass: 123456)
  INSERT INTO Users (username, email, password_hash, role_id, name, age, years_of_experience, status) VALUES 
  ('admin', 'admin@gmail.com', '$2b$10$fGPbmDB.1xP4mT5PBFxt3OCxQJSflwGB/nkTKHyxq0ARHF1LFYW2u', 1, 'Admin User', 30, 5, 'approved'),
  ('user1', 'user1@gmail.com', '$2b$10$fGPbmDB.1xP4mT5PBFxt3OCxQJSflwGB/nkTKHyxq0ARHF1LFYW2u', 3, 'Regular User', 25, 0, 'approved'),
  ('editor1', 'editor1@gmail.com', '$2b$10$fGPbmDB.1xP4mT5PBFxt3OCxQJSflwGB/nkTKHyxq0ARHF1LFYW2u', 2, 'Nguyễn Văn Editor', 28, 3, 'approved');

  -- 3. Categories
  INSERT INTO Categories (name, description) VALUES 
  ('Thời sự', 'Tin tức chính trị, xã hội, đời sống hàng ngày'),
  ('Thế giới', 'Tin tức quốc tế, xung đột, ngoại giao'),
  ('Kinh doanh', 'Tài chính, chứng khoán, thị trường, bất động sản'),
  ('Công nghệ', 'Điện thoại, AI, Máy tính, Xu hướng công nghệ'),
  ('Thể thao', 'Bóng đá trong nước, quốc tế, Tennis, Esports'),
  ('Giải trí', 'Showbiz, Phim ảnh, Âm nhạc, Thời trang');

  -- 4. Tags
  INSERT INTO Tags (name) VALUES ('#Hot'), ('#BreakingNews'), ('#AI'), ('#BóngĐá'), ('#Bitcoin'), ('#Showbiz');

  -- 5. Posts (Dữ liệu mẫu phong phú)
  
  -- Công nghệ (Cat 4)
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (3, 4, 'Trí tuệ nhân tạo AI đang thay đổi ngành lập trình năm 2025 như thế nào?', '<p>Sự bùng nổ của các công cụ AI như ChatGPT, Copilot...</p>', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', 'approved', TRUE),
  (3, 4, 'Review iPhone 16 Pro Max: Có đáng để nâng cấp?', '<p>Chi tiết về hiệu năng, camera và thời lượng pin...</p>', 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'approved', FALSE);

  -- Thể thao (Cat 5)
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (3, 5, 'Đội tuyển Việt Nam chốt danh sách dự Asian Cup', '<p>26 cầu thủ sẽ lên đường sang Qatar...</p>', 'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg', 'approved', TRUE),
  (3, 5, 'Kết quả Cúp C1 Châu Âu: Real Madrid lội ngược dòng ngoạn mục', '<p>Real Madrid thắng 3-1 trong một đêm thăng hoa...</p>', 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg', 'approved', FALSE);

  -- Kinh doanh (Cat 3)
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (3, 3, 'Giá vàng hôm nay lập đỉnh mới, người dân đổ xô đi bán', '<p>Thị trường vàng trong nước sáng nay ghi nhận mức tăng kỷ lục...</p>', 'https://images.pexels.com/photos/259209/pexels-photo-259209.jpeg', 'approved', TRUE),
  (3, 3, 'Thị trường bất động sản có dấu hiệu ấm lên vào cuối năm', '<p>Thanh khoản đang dần quay trở lại phân khúc căn hộ...</p>', 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg', 'approved', FALSE);

  -- Thế Giới (Cat 2)
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (3, 2, 'Biến đổi khí hậu gây ra đợt nắng nóng kỷ lục tại Châu Âu', '<p>Nhiệt độ vượt ngưỡng 40 độ C ở nhiều thành phố...</p>', 'https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg', 'approved', FALSE);

  -- Giải Trí (Cat 6)
  INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status, is_featured) VALUES 
  (3, 6, 'Phim bom tấn mới của Hollywood phá đảo phòng vé toàn cầu', '<p>Bộ phim đạt 500 triệu USD sau 3 ngày...</p>', 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 'approved', TRUE);

  -- 6. NewsStats
  INSERT INTO NewsStats (post_id, view_count, comment_count, rating_avg) VALUES 
  (1, 1500, 20, 4.5), (2, 800, 5, 4.0), (3, 2300, 45, 4.8), (4, 1200, 10, 4.2), 
  (5, 5000, 100, 4.9), (6, 300, 2, 3.5), (7, 900, 15, 4.1), (8, 2500, 60, 4.7);

  -- 7. PostTags
  INSERT INTO PostTags (post_id, tag_id) VALUES (1, 1), (1, 3), (3, 1), (3, 4), (5, 1);
`;

// Thực thi
connection.query(initQuery, (err) => {
  if (err) {
    console.error("❌ Lỗi tạo database:", err);
  } else {
    console.log("✅ Database 'web_news' đã được khởi tạo thành công!");
    console.log("✅ Đã tạo đầy đủ các bảng: Users, Posts, Comments, Likes, NewsStats...");
    console.log("✅ Đã thêm dữ liệu mẫu phong phú.");
    console.log("⚠️  LƯU Ý: Hãy chắc chắn file .env của bạn có dòng: DB_NAME=web_news");
  }
  connection.end();
});