import { db } from "../db.js";
import jwt from "jsonwebtoken"; // Import JWT để xác thực

export const getComments = (req, res) => {
  const q = `
    SELECT c.*, u.id AS userId, u.username, u.avatar 
    FROM Comments c 
    JOIN Users u ON u.id = c.user_id
    WHERE c.post_id = ? 
    ORDER BY c.created_at DESC
  `;

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  if (!req.body.desc || !req.body.user_id || !req.body.post_id) {
    return res.status(400).json("Thiếu thông tin!");
  }

  const q = "INSERT INTO Comments(`content`, `created_at`, `user_id`, `post_id`, `parent_id`) VALUES (?, NOW(), ?, ?, ?)";
  
  const values = [
    req.body.desc,
    req.body.user_id,
    req.body.post_id,
    req.body.parent_id || null
  ];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Bình luận thành công!");
  });
};

// --- CHỨC NĂNG MỚI: XÓA COMMENT ---
export const deleteComment = (req, res) => {
  // 1. Kiểm tra đăng nhập
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Bạn chưa đăng nhập!");

  // 2. Xác thực Token
  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token không hợp lệ!");

    const commentId = req.params.id;
    // 3. Chỉ xóa nếu comment đó thuộc về user đang đăng nhập (userInfo.id)
    const q = "DELETE FROM Comments WHERE id = ? AND user_id = ?";

    db.query(q, [commentId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.json("Đã xóa bình luận!");
      return res.status(403).json("Bạn chỉ có thể xóa bình luận của mình!");
    });
  });
};

// --- CHỨC NĂNG MỚI: SỬA COMMENT ---
export const updateComment = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Bạn chưa đăng nhập!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token không hợp lệ!");

    const commentId = req.params.id;
    // Chỉ update nếu user_id khớp
    const q = "UPDATE Comments SET content = ? WHERE id = ? AND user_id = ?";

    db.query(q, [req.body.content, commentId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.json("Đã sửa bình luận!");
      return res.status(403).json("Bạn chỉ có thể sửa bình luận của mình!");
    });
  });
};