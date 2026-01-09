import { db } from "../db.js";

export const getLikes = (req, res) => {
  // SỬA: Viết hoa tên bảng Likes
  const q = "SELECT user_id FROM Likes WHERE post_id = ?";

  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data.map(like => like.user_id));
  });
};

export const addLike = (req, res) => {
  // Thêm IGNORE: Nếu trùng thì SQL sẽ lờ đi, không báo lỗi, nhưng cũng không thêm mới
  const q = "INSERT IGNORE INTO Likes (`user_id`,`post_id`) VALUES (?)";
  
  const values = [req.body.user_id, req.body.post_id];

  db.query(q, [values], (err, data) => {
    if (err) {
      // Nếu không dùng INSERT IGNORE, bạn có thể check mã lỗi ở đây
      if (err.code === 'ER_DUP_ENTRY') {
         return res.status(409).json("Bạn đã like bài viết này rồi.");
      }
      console.log("Lỗi SQL Like:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json("Đã like!");
  });
};

export const deleteLike = (req, res) => {
  // SỬA: Viết hoa tên bảng Likes
  const q = "DELETE FROM Likes WHERE user_id = ? AND post_id = ?";

  db.query(q, [req.query.userId, req.query.postId], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    return res.status(200).json("Đã bỏ like.");
  });
};