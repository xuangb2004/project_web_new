import { db } from "../db.js";
import moment from "moment"; // Đảm bảo đã cài: npm install moment
import { sendEmail } from "../utils/email.js"; 

export const getDashboardStats = (req, res) => {
  const q = `
    SELECT 
      (SELECT COUNT(*) FROM Users WHERE role_id = 3) as total_users,
      (SELECT COUNT(*) FROM Users WHERE role_id = 2) as total_editors,
      (SELECT COUNT(*) FROM Posts) as total_posts,
      (SELECT COALESCE(SUM(ns.view_count), 0) FROM NewsStats ns) as total_views, 
      (SELECT COUNT(*) FROM Posts WHERE status = 'pending') as pending_posts
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data[0]);
  });
};

export const getEditorsList = (req, res) => {
  const q = `
    SELECT 
      u.id, u.username, u.email, u.avatar, u.name, u.age, 
      u.years_of_experience as years_of_experience, 
      u.created_at,
      COUNT(p.id) as post_count,
      COALESCE(SUM(ns.view_count), 0) as total_views
    FROM Users u
    LEFT JOIN Posts p ON u.id = p.user_id
    LEFT JOIN NewsStats ns ON p.id = ns.post_id
    WHERE u.role_id = 2 AND u.status = 'approved'
    GROUP BY u.id
    ORDER BY post_count DESC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const getPendingPosts = (req, res) => {
  const q = `
    SELECT p.*, u.username as author_name, c.name as category_name 
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
    LEFT JOIN Categories c ON p.category_id = c.id
    WHERE p.status = 'pending'
    ORDER BY p.created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updatePostStatus = (req, res) => {
  const postId = req.params.id;
  const status = req.body.status;

  const q = "UPDATE Posts SET status = ? WHERE id = ?";

  db.query(q, [status, postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Cập nhật trạng thái bài viết thành công!");
  });
};

export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const q = "DELETE FROM Users WHERE id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa người dùng!");
  });
};

export const getPendingEditors = (req, res) => {
  const q = `
    SELECT id, username, email, name, age, 
           years_of_experience,
           created_at, avatar
    FROM Users
    WHERE role_id = 2 AND status = 'pending'
    ORDER BY created_at ASC
  `;

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const updateUserStatus = (req, res) => {
  const userId = req.params.id;
  const newStatus = req.body.status; 

  const qGetUser = "SELECT email, username FROM Users WHERE id = ?";
  
  db.query(qGetUser, [userId], (err, data) => {
    if (err || data.length === 0) return res.status(500).json("Không tìm thấy user");
    
    const userEmail = data[0].email;
    const userName = data[0].username;

    const qUpdate = "UPDATE Users SET status = ? WHERE id = ?";
    
    db.query(qUpdate, [newStatus, userId], async (err, result) => {
      if (err) return res.status(500).json(err);

      let subject = "";
      let htmlContent = "";

      if (newStatus === 'approved' || newStatus === 'active') {
        subject = "🎉 Chúc mừng! Hồ sơ Nhà báo của bạn đã được duyệt";
        htmlContent = `<h3>Xin chào ${userName},</h3><p>Hồ sơ của bạn đã được duyệt.</p>`;
      } else {
        subject = "❌ Thông báo về hồ sơ đăng ký Nhà báo";
        htmlContent = `<h3>Xin chào ${userName},</h3><p>Hồ sơ của bạn đã bị từ chối.</p>`;
      }

      let emailSent = true;
      let emailErrorMessage = null;
      try {
        await sendEmail(userEmail, subject, htmlContent);
      } catch (emailError) {
        console.log("Lỗi gửi mail:", emailError);
        emailSent = false;
        emailErrorMessage = emailError.message;
      }

      if (emailSent) {
        return res.status(200).json({ message: "Đã cập nhật và gửi email!", emailSent: true });
      } else {
        return res.status(200).json({ message: "Đã cập nhật, gửi email lỗi.", emailSent: false, emailError: emailErrorMessage });
      }
    });
  });
};

export const deletePost = (req, res) => {
  const postId = req.params.id;
  const q = "DELETE FROM Posts WHERE id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa bài viết!");
  });
};

export const getReportedPosts = (req, res) => {
  const q = `
    SELECT p.id, p.title, u.username as author_name, COUNT(r.id) as report_count
    FROM Posts p
    JOIN Users u ON p.user_id = u.id
    JOIN Reports r ON p.id = r.post_id
    GROUP BY p.id
    ORDER BY report_count DESC
  `;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const deleteReports = (req, res) => {
  const postId = req.params.id;
  const q = "DELETE FROM Reports WHERE post_id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Đã xóa báo cáo của bài viết!");
  });
};

// --- MỚI: HÀM LẤY THỐNG KÊ BIỂU ĐỒ ---
export const getInteractionStats = (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json("Vui lòng chọn ngày bắt đầu và kết thúc");
  }

  // 1. Query Lượt Xem (ReadHistory)
  const qViews = `
    SELECT DATE(viewed_at) as date, COUNT(*) as count 
    FROM ReadHistory 
    WHERE viewed_at BETWEEN ? AND ? 
    GROUP BY DATE(viewed_at)
  `;

  // 2. Query Lượt Thích (Likes - cần cột created_at)
  const qLikes = `
    SELECT DATE(created_at) as date, COUNT(*) as count 
    FROM Likes 
    WHERE created_at BETWEEN ? AND ? 
    GROUP BY DATE(created_at)
  `;

  // 3. Query Bình Luận (Comments)
  const qComments = `
    SELECT DATE(date) as date, COUNT(*) as count 
    FROM Comments 
    WHERE date BETWEEN ? AND ? 
    GROUP BY DATE(date)
  `;

  const startQuery = `${startDate} 00:00:00`;
  const endQuery = `${endDate} 23:59:59`;

  // Chạy 3 câu lệnh song song
  Promise.all([
    new Promise((resolve, reject) => db.query(qViews, [startQuery, endQuery], (err, data) => err ? reject(err) : resolve(data))),
    new Promise((resolve, reject) => db.query(qLikes, [startQuery, endQuery], (err, data) => err ? reject(err) : resolve(data))),
    new Promise((resolve, reject) => db.query(qComments, [startQuery, endQuery], (err, data) => err ? reject(err) : resolve(data)))
  ])
  .then(([viewsData, likesData, commentsData]) => {
    // Tổng hợp dữ liệu
    const stats = {};
    const start = moment(startDate);
    const end = moment(endDate);

    // Tạo khung ngày rỗng (để ngày nào không có view vẫn hiện 0)
    for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
      stats[m.format('YYYY-MM-DD')] = { views: 0, likes: 0, comments: 0 };
    }

    // Fill data
    viewsData.forEach(item => {
      const d = moment(item.date).format('YYYY-MM-DD');
      if (stats[d]) stats[d].views = item.count;
    });

    likesData.forEach(item => {
      const d = moment(item.date).format('YYYY-MM-DD');
      if (stats[d]) stats[d].likes = item.count;
    });

    commentsData.forEach(item => {
      const d = moment(item.date).format('YYYY-MM-DD');
      if (stats[d]) stats[d].comments = item.count;
    });

    // Chuyển về mảng
    const result = Object.keys(stats).map(date => ({
      date,
      ...stats[date]
    })).sort((a,b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json(result);
  })
  .catch(err => {
    console.log(err);
    return res.status(500).json(err);
  });
};