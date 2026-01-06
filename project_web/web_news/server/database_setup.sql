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
    name VARCHAR(100),
    age INT,
    years_of_experience INT,
    phone VARCHAR(20),
    address TEXT,
    dob DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'male',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id)
  );

  -- 4. Bảng Categories (Danh mục)
  CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT -- Cho phép để trống (NULL)
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
    category_id INT NULL, -- cho phép NULL để ON DELETE SET NULL
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
-- 9. Tạo bảng Likes (Lưu ai đã like bài nào)
CREATE TABLE IF NOT EXISTS Likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
  UNIQUE KEY unique_like (user_id, post_id) -- Mỗi người chỉ like 1 lần/bài
);
-- 10.Bảng Bookmarks (Lưu bài viết)
CREATE TABLE IF NOT EXISTS Bookmarks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bookmark (user_id, post_id), -- Mỗi bài chỉ lưu 1 lần
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);
-- 11. Bảng ReadHistory (Lịch sử xem)
CREATE TABLE IF NOT EXISTS ReadHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);

-- 12. Bang Reports (Bao cao vi pham)
CREATE TABLE IF NOT EXISTS Reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);
