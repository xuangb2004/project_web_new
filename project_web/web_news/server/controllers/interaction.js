import { db } from "../db.js";

// --- BOOKMARK (LƯU BÀI) ---

export const getSavedPostIds = (req, res) => {
  const q = "SELECT post_id FROM Bookmarks WHERE user_id = ?";
  db.query(q, [req.query.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(item => item.post_id));
  });
};

export const toggleBookmark = (req, res) => {
  const { user_id, post_id } = req.body;

  const qCheck = "SELECT * FROM Bookmarks WHERE user_id = ? AND post_id = ?";
  db.query(qCheck, [user_id, post_id], (err, data) => {
    if (err) return res.status(500).json(err);

    if (data.length > 0) {
      const qDelete = "DELETE FROM Bookmarks WHERE user_id = ? AND post_id = ?";
      db.query(qDelete, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã bỏ lưu bài viết.");
      });
    } else {
      const qInsert = "INSERT INTO Bookmarks (user_id, post_id) VALUES (?, ?)";
      db.query(qInsert, [user_id, post_id], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Đã lưu bài viết.");
      });
    }
  });
};

export const getSavedPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT 
      p.*, c.name as cat_name, b.created_at as saved_at,
      COALESCE(ns.view_count, 0) as view_count,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN Bookmarks b ON p.id = b.post_id 
    JOIN Categories c ON p.category_id = c.id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE b.user_id = ? 
    ORDER BY b.created_at DESC`;
    
  db.query(q, [userId, userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const enrichedData = data.map(post => ({
      ...post,
      is_saved: post.is_saved > 0,
      is_liked: post.is_liked > 0
    }));
    return res.status(200).json(enrichedData);
  });
};

// --- HISTORY (LỊCH SỬ XEM) ---

export const addToHistory = (req, res) => {
  const { user_id, post_id } = req.body;

  // Use a transaction + SELECT ... FOR UPDATE for concurrency safety
  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);

    const qCheck = "SELECT id FROM ReadHistory WHERE user_id = ? AND post_id = ? FOR UPDATE";
    db.query(qCheck, [user_id, post_id], (err, data) => {
      if (err) return db.rollback(() => res.status(500).json(err));

      if (data.length > 0) {
        // Update viewed_at
        const qUpdate = "UPDATE ReadHistory SET viewed_at = NOW() WHERE id = ?";
        db.query(qUpdate, [data[0].id], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));
          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json(err));
            return res.status(200).json("Updated history");
          });
        });
      } else {
        // Insert and increment view_count
        const qInsert = "INSERT INTO ReadHistory (user_id, post_id, viewed_at) VALUES (?, ?, NOW())";
        db.query(qInsert, [user_id, post_id], (err) => {
          if (err) return db.rollback(() => res.status(500).json(err));

          const qCheckStats = "SELECT post_id FROM NewsStats WHERE post_id = ?";
          db.query(qCheckStats, [post_id], (err, stats) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            if (stats.length === 0) {
              const qInsertStats = "INSERT INTO NewsStats (post_id, view_count, comment_count, rating_avg) VALUES (?, 1, 0, 0)";
              db.query(qInsertStats, [post_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));
                db.commit((err) => {
                  if (err) return db.rollback(() => res.status(500).json(err));
                  return res.status(200).json("Đã cập nhật lịch sử.");
                });
              });
            } else {
              const qUpdateStats = "UPDATE NewsStats SET view_count = view_count + 1 WHERE post_id = ?";
              db.query(qUpdateStats, [post_id], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));
                db.commit((err) => {
                  if (err) return db.rollback(() => res.status(500).json(err));
                  return res.status(200).json("Đã cập nhật lịch sử.");
                });
              });
            }
          });
        });
      }
    });
  });
};

export const getHistoryPosts = (req, res) => {
  const userId = req.query.userId;
  const q = `
    SELECT DISTINCT 
      p.*, c.name as cat_name, rh.viewed_at,
      COALESCE(ns.view_count, 0) as view_count,
      (SELECT COUNT(*) FROM Bookmarks WHERE post_id = p.id AND user_id = ?) AS is_saved,
      (SELECT COUNT(*) FROM Likes WHERE post_id = p.id AND user_id = ?) AS is_liked
    FROM Posts p 
    JOIN ReadHistory rh ON p.id = rh.post_id 
    JOIN Categories c ON p.category_id = c.id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE rh.user_id = ? 
    ORDER BY rh.viewed_at DESC`;

  db.query(q, [userId, userId, userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const enrichedData = data.map(post => ({
      ...post,
      is_saved: post.is_saved > 0,
      is_liked: post.is_liked > 0
    }));
    return res.status(200).json(enrichedData);
  });
};

export const deleteHistory = (req, res) => {
  const userId = req.query.userId;
  const q = "DELETE FROM ReadHistory WHERE user_id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa toàn bộ lịch sử.");
  });
};
export const getHistory = (req, res) => {
  const userId = req.query.userId;
  
  // Sửa 'viewed_posts' thành 'readhistory'
  // Lưu ý: Kiểm tra cột thời gian là 'created_at' hay 'viewed_at' trong DB của bạn
  const q = `
    SELECT p.id, p.title, p.thumbnail, p.cat, c.name AS cat_name, h.viewed_at,
           (SELECT COUNT(*) FROM Likes WHERE user_id = ? AND post_id = p.id) AS is_liked,
           (SELECT COUNT(*) FROM Bookmarks WHERE user_id = ? AND post_id = p.id) AS is_saved
    FROM ReadHistory h
    JOIN Posts p ON h.post_id = p.id
    LEFT JOIN Categories c ON p.cat = c.id
    WHERE h.user_id = ? 
      AND p.status = 'approved'  <-- THÊM DÒNG NÀY
    ORDER BY h.viewed_at DESC
  `;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};