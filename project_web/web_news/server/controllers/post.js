import { db } from "../db.js";

// =========================================================
// LẤY DANH SÁCH BÀI VIẾT (Đã fix lỗi trùng lặp bằng GROUP BY)
// =========================================================
export const getPosts = (req, res) => {
  const catName = req.query.cat;
  const uid = req.query.uid;
  const status = req.query.status;
  const sortBy = req.query.sortBy;
  const searchTerm = req.query.search;
  let q = `SELECT 
    p.*, 
    c.name as cat_name, 
    COALESCE(ns.view_count, 0) as view_count,
    (SELECT COUNT(*) FROM Comments WHERE post_id = p.id) as comment_count,
    (SELECT COUNT(*) FROM Likes WHERE post_id = p.id) as like_count
  FROM Posts p 
  LEFT JOIN Categories c ON p.category_id = c.id 
  LEFT JOIN NewsStats ns ON p.id = ns.post_id 
  WHERE 1=1`;
  
  const params = [];

  if (!uid) {
    q += " AND p.status = 'approved'";
  }

  if (catName) {
    q += " AND c.name = ?";
    params.push(catName);
  }

  if (uid) {
    q += " AND p.user_id = ?";
    params.push(uid);
  }

  if (status) {
    q += " AND p.status = ?";
    params.push(status);
  }
  if (searchTerm) {
    q += " AND p.title LIKE ?"; // Tìm tiêu đề chứa từ khóa
    params.push(`%${searchTerm}%`); // Thêm dấu % để tìm tương đối
  }
  // GROUP BY để tránh trùng lặp
  q += " GROUP BY p.id";

  // SORTING
  if (sortBy === 'random') {
    q += " ORDER BY RAND()"; 
  }
  else if (sortBy === 'likes') {
    q += " ORDER BY like_count DESC, p.created_at DESC";
  } else if (sortBy === 'comments') {
    q += " ORDER BY comment_count DESC, p.created_at DESC";
  } else if (sortBy === 'views' || sortBy === 'readcount') {
    q += " ORDER BY view_count DESC, p.created_at DESC";
  } else if (sortBy === 'time') {
    q += " ORDER BY p.created_at DESC";
  } else {
    const newRate = req.query.newRate ? parseFloat(req.query.newRate) : 0.5; 
    const readRate = req.query.readRate ? parseFloat(req.query.readRate) : 1;
    q += " ORDER BY (COALESCE(ns.view_count, 0) * ? - TIMESTAMPDIFF(HOUR, p.created_at, NOW()) * ?) DESC";
    params.push(readRate, newRate);
  }
  

  // --- SỬA LỖI 1055 TẠI ĐÂY ---
  // Bước 1: Tắt chế độ 'ONLY_FULL_GROUP_BY' cho phiên kết nối này
  const disableStrictMode = "SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))";

  db.query(disableStrictMode, (err) => {
      if (err) {
        console.error("Lỗi tắt strict mode:", err);
        return res.status(500).send(err);
      }

      // Bước 2: Chạy câu lệnh chính sau khi đã tắt chế độ khắt khe
      db.query(q, params, (err, data) => {
        if (err) {
          console.error("Lỗi truy vấn bài viết:", err);
          return res.status(500).json({ error: err.message || err, fatal: err.fatal || false });
        }
        return res.status(200).json(data);
      });
  });
};

// =========================================================
// LẤY CHI TIẾT 1 BÀI VIẾT
// =========================================================
export const getPost = (req, res) => {
  const q =
    "SELECT p.id, u.username, p.title, p.content, p.thumbnail, u.avatar, p.category_id, c.name as cat_name, COALESCE(ns.view_count, 0) as view_count, p.created_at as date " +
    "FROM Posts p " +
    "JOIN Users u ON u.id = p.user_id " +
    "LEFT JOIN Categories c ON c.id = p.category_id " +
    "LEFT JOIN NewsStats ns ON p.id = ns.post_id " +
    "WHERE p.id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

// =========================================================
// THÊM BÀI VIẾT MỚI
// =========================================================
export const addPost = (req, res) => {
  const { title, content, thumbnail, category_id, user_id } = req.body;

  // Validation
  if (!title || !title.trim()) {
    return res.status(400).json("Vui lòng nhập tiêu đề!");
  }
  if (!content || !content.trim()) {
    return res.status(400).json("Vui lòng nhập nội dung!");
  }
  if (!user_id) {
    return res.status(401).json("Bạn cần đăng nhập để đăng bài!");
  }

  const q = `
    INSERT INTO Posts (user_id, category_id, title, content, thumbnail, status) 
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  const values = [
    user_id,
    category_id || null,
    title.trim(),
    content,
    thumbnail || null,
  ];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json("Lỗi khi tạo bài viết: " + err.message);

    // Tạo luôn dòng thống kê NewsStats cho bài mới
    const statsQuery = "INSERT INTO NewsStats (post_id, view_count, comment_count, rating_avg) VALUES (?, 0, 0, 0)";
    db.query(statsQuery, [data.insertId], () => {
       // Không cần catch lỗi ở đây để tránh block response chính
       console.log("Đã khởi tạo NewsStats cho bài viết mới:", data.insertId);
    });

    return res.status(200).json({
      message: "Bài viết đã được tạo thành công!",
      postId: data.insertId,
    });
  });
};

// =========================================================
// XÓA BÀI VIẾT
// =========================================================
export const deletePost = (req, res) => {
  const postId = req.params.id;
  const { user_id } = req.body;

  if (!user_id) return res.status(401).json("Chưa đăng nhập!");

  // Kiểm tra quyền sở hữu bài viết trước khi xóa
  const checkQuery = "SELECT id, user_id FROM Posts WHERE id = ?";
  
  db.query(checkQuery, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Bài viết không tồn tại!");
    if (data[0].user_id !== user_id) return res.status(403).json("Bạn không có quyền xóa bài này!");

    const deleteQuery = "DELETE FROM Posts WHERE id = ?";
    
    db.query(deleteQuery, [postId], (err, data) => {
      if (err) return res.status(500).json("Lỗi khi xóa: " + err.message);
      return res.status(200).json("Bài viết đã được xóa!");
    });
  });
};

// =========================================================
// CẬP NHẬT BÀI VIẾT
// =========================================================
export const updatePost = (req, res) => {
  const postId = req.params.id;
  const { title, content, thumbnail, category_id, user_id } = req.body;

  if (!user_id) return res.status(401).json("Chưa đăng nhập!");

  const q = `
    UPDATE Posts 
    SET title = ?, 
        content = ?, 
        thumbnail = ?, 
        category_id = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `;

  const values = [
    title,
    content,
    thumbnail || null,
    category_id || null,
    postId,
    user_id,
  ];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.affectedRows === 0) return res.status(403).json("Bạn không có quyền sửa bài này!");
    return res.status(200).json("Cập nhật thành công!");
  });
};

// =========================================================
// LẤY THỐNG KÊ BÀI VIẾT (Biểu đồ)
// =========================================================
export const getPostStats = (req, res) => {
  const postId = req.params.id;
  const userId = req.query.user_id;

  const checkOwnershipQuery = "SELECT user_id FROM Posts WHERE id = ?";
  
  db.query(checkOwnershipQuery, [postId], (err, postData) => {
    if (err) return res.status(500).json(err);
    if (postData.length === 0) return res.status(404).json("Không tìm thấy bài viết");
    if (!userId || postData[0].user_id !== parseInt(userId)) {
      return res.status(403).json("Không có quyền xem thống kê");
    }

    // Lấy lượt xem theo ngày (30 ngày gần nhất)
    const readsPerDayQuery = `
      SELECT DATE(viewed_at) as date, COUNT(*) as read_count
      FROM ReadHistory WHERE post_id = ?
      GROUP BY DATE(viewed_at) ORDER BY date DESC LIMIT 30
    `;

    // Các query phụ lấy số liệu tổng quan
    const summaryQueries = `
      SELECT 
        (SELECT COUNT(*) FROM ReadHistory WHERE post_id = ? AND DATE(viewed_at) = CURDATE()) as newReadsToday,
        (SELECT COUNT(*) FROM Comments WHERE post_id = ?) as totalComments,
        (SELECT COUNT(*) FROM Comments WHERE post_id = ? AND DATE(created_at) = CURDATE()) as newCommentsToday,
        (SELECT COUNT(*) FROM Likes WHERE post_id = ?) as totalLikes,
        (SELECT COUNT(*) FROM Likes WHERE post_id = ? AND DATE(created_at) = CURDATE()) as newLikesToday
    `;
    
    // Thực thi query song song cho tối ưu
    db.query(readsPerDayQuery, [postId], (err, readsPerDay) => {
      if (err) return res.status(500).json(err);

      db.query(summaryQueries, [postId, postId, postId, postId, postId], (err2, summaryData) => {
        if (err2) return res.status(500).json(err2);
        
        const summary = summaryData[0]; // Kết quả trả về dòng đầu tiên
        return res.status(200).json({
          readsPerDay: readsPerDay || [],
          newReadsToday: summary.newReadsToday || 0,
          totalComments: summary.totalComments || 0,
          newCommentsToday: summary.newCommentsToday || 0,
          totalLikes: summary.totalLikes || 0,
          newLikesToday: summary.newLikesToday || 0,
        });
      });
    });
  });
};
export const getTrending = (req, res) => {
  const q = `
    SELECT p.id, p.title, p.thumbnail, p.created_at, COALESCE(ns.view_count, 0) as view_count
    FROM Posts p
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE p.status = 'approved'
    -- THÊM DÒNG NÀY ĐỂ CHẶN TRÙNG LẶP:
    GROUP BY p.id 
    ORDER BY view_count DESC
    LIMIT 4
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json({ error: err.message || err, fatal: err.fatal || false });
    return res.status(200).json(data);
  });
};