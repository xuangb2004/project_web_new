import { db } from "../db.js";
// Import hàm gửi mail vừa tạo
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
  // Lưu ý: Mình sửa total_views lấy từ bảng Posts (nếu bạn không dùng bảng NewsStats) 
  // hoặc giữ nguyên NewsStats nếu DB bạn có.

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

// --- HÀM NÀY ĐÃ ĐƯỢC SỬA ĐỂ GỬI MAIL ---
export const updateUserStatus = (req, res) => {
  const userId = req.params.id;
  const newStatus = req.body.status; // 'approved' hoặc 'rejected' (accepts 'active' for backward compatibility)

  // 1. Lấy thông tin User trước để gửi mail
  const qGetUser = "SELECT email, username FROM Users WHERE id = ?";
  
  db.query(qGetUser, [userId], (err, data) => {
    if (err || data.length === 0) return res.status(500).json("Không tìm thấy user");
    
    const userEmail = data[0].email;
    const userName = data[0].username;

    // 2. Cập nhật Status
    const qUpdate = "UPDATE Users SET status = ? WHERE id = ?";
    
    db.query(qUpdate, [newStatus, userId], async (err, result) => {
      if (err) return res.status(500).json(err);

      // 3. Gửi Email thông báo (Chạy ngầm, không chặn response)
      let subject = "";
      let htmlContent = "";

      if (newStatus === 'approved' || newStatus === 'active') {
        subject = "🎉 Chúc mừng! Hồ sơ Nhà báo của bạn đã được duyệt";
        htmlContent = `
          <h3>Xin chào ${userName},</h3>
          <p>Chúc mừng bạn! Yêu cầu đăng ký trở thành Nhà báo tại <b>MyNews</b> của bạn đã được Admin phê duyệt.</p>
          <p>Bây giờ bạn có thể đăng nhập và bắt đầu viết bài.</p>
          <a href="http://localhost:5173/login">Đăng nhập ngay</a>
        `;
      } else {
        subject = "❌ Thông báo về hồ sơ đăng ký Nhà báo";
        htmlContent = `
          <h3>Xin chào ${userName},</h3>
          <p>Rất tiếc, hồ sơ đăng ký trở thành Nhà báo của bạn chưa phù hợp với tiêu chí của chúng tôi vào lúc này.</p>
          <p>Hồ sơ của bạn đã bị từ chối. Bạn có thể liên hệ admin để biết thêm chi tiết.</p>
        `;
      }

      // Gọi hàm gửi mail và trả về trạng thái gửi email cho client
      let emailSent = true;
      let emailErrorMessage = null;
      try {
        await sendEmail(userEmail, subject, htmlContent);
      } catch (emailError) {
        console.log("Lỗi gửi mail:", emailError);
        emailSent = false;
        emailErrorMessage = emailError.message || String(emailError);
      }

      if (emailSent) {
        return res.status(200).json({ message: "Đã cập nhật trạng thái và gửi email thông báo!", emailSent: true });
      } else {
        return res.status(200).json({ message: "Đã cập nhật trạng thái, nhưng gửi email thất bại.", emailSent: false, emailError: emailErrorMessage });
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