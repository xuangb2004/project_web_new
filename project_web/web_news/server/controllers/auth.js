import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
// Thư viện Google Auth mới thêm
import { OAuth2Client } from "google-auth-library";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
const EDITOR_ROLE_ID = 2;

// --- CẤU HÌNH REGEX (LUẬT KIỂM TRA) ---
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/;

// --- CẤU HÌNH GOOGLE CLIENT ---
// Bạn nhớ tạo biến môi trường GOOGLE_CLIENT_ID trong file .env nhé
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json("Email không hợp lệ! (Ví dụ: user@example.com)");
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json(
      "Mật khẩu phải trên 6 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
    );
  }

  const q = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(q, [email, username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi server");
    
    if (data.length) {
      if (data[0].email === email) return res.status(409).json("Email này đã được sử dụng!");
      if (data[0].username === username) return res.status(409).json("Tên đăng nhập đã tồn tại!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const qInsert = "INSERT INTO Users(`username`,`email`,`password_hash`, `role_id`, `avatar`) VALUES (?)";
    const roleIdUser = 3; 
    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    const values = [username, email, hash, roleIdUser, defaultAvatar];

    db.query(qInsert, [values], (err, data) => {
      if (err) return res.status(500).json("Lỗi khi tạo User: " + err.message);
      return res.status(200).json("Đăng ký thành công!");
    });
  });
};

export const login = (req, res) => {
  const q = "SELECT * FROM Users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi khi tìm kiếm người dùng");
    if (data.length === 0) return res.status(404).json("Sai tên đăng nhập hoặc mật khẩu!");

    const user = data[0];

    if (Number(user.role_id) === 2) {
      if (user.status === 'rejected') {
        return res.status(403).json("Tài khoản của bạn đã bị từ chối!");
      }
      if (user.status === 'pending') {
        return res.status(403).json("Tài khoản Editor của bạn đang chờ Admin phê duyệt.");
      }
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      user.password_hash
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Sai tên đăng nhập hoặc mật khẩu!");

    const token = jwt.sign({ id: user.id }, "jwtkey");
    const { password_hash, ...other } = user;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true
      })
      .status(200)
      .json(other);
  });
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true
  }).status(200).json("Đã đăng xuất.");
};

export const editorRegister = (req, res) => {
  const {
    username,
    email,
    password,
    name,
    age,
    years_of_experience,
    avatar,
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json("Vui lòng nhập đầy đủ username, email và password.");
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json("Email không hợp lệ! (Ví dụ: editor@example.com)");
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json(
      "Mật khẩu phải trên 6 ký tự, bao gồm ít nhất 1 chữ cái, 1 số và 1 ký tự đặc biệt (@$!%*?&)."
    );
  }

  const checkQuery = "SELECT * FROM Users WHERE email = ? OR username = ?";

  db.query(checkQuery, [email, username], (err, data) => {
    if (err) return res.status(500).json(err.message || "Lỗi kiểm tra trùng lặp");
    
    if (data.length) {
       if (data[0].email === email) return res.status(409).json("Email này đã được sử dụng!");
       if (data[0].username === username) return res.status(409).json("Tên đăng nhập đã tồn tại!");
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const insertQuery =
      "INSERT INTO Users(`username`,`email`,`password_hash`,`role_id`,`name`,`age`,`years_of_experience`,`avatar`, `status`) VALUES (?)";

    const values = [
      username,
      email,
      hash,
      2, 
      name || null,
      age ? Number(age) : null,
      years_of_experience ? Number(years_of_experience) : null,
      avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      'pending'
    ];

    db.query(insertQuery, [values], (insertErr) => {
      if (insertErr) return res.status(500).json(insertErr.message || "Lỗi khi tạo tài khoản Editor");
      return res.status(200).json("Đăng ký Editor thành công! Vui lòng chờ Admin duyệt.");
    });
  });
};

// --- HÀM MỚI: XỬ LÝ ĐĂNG NHẬP GOOGLE ---
export const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Xác thực token gửi lên từ Frontend với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    // 2. Lấy thông tin user từ Google
    const { name, email, picture } = ticket.getPayload();

    // 3. Kiểm tra xem email này đã có trong Database chưa
    const q = "SELECT * FROM Users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) return res.status(500).json(err);

      if (data.length > 0) {
        // --- TRƯỜNG HỢP 1: ĐÃ CÓ TÀI KHOẢN ---
        const user = data[0];
        
        // Tạo token JWT
        const token = jwt.sign({ id: user.id }, "jwtkey");
        const { password_hash, ...other } = user;

        // Trả về cookie và thông tin user (giống hệt hàm login thường)
        res
          .cookie("access_token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .status(200)
          .json(other);
      } else {
        // --- TRƯỜNG HỢP 2: CHƯA CÓ TÀI KHOẢN (Tạo mới) ---
        
        // Tạo mật khẩu ngẫu nhiên cho user Google (để đảm bảo tính bảo mật và not null)
        const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(generatedPassword, salt);
        
        const roleIdUser = 3; // Role mặc định là User thường

        const qInsert = "INSERT INTO Users(`username`,`email`,`password_hash`, `role_id`, `avatar`) VALUES (?)";
        const values = [name, email, hash, roleIdUser, picture];

        db.query(qInsert, [values], (err, data) => {
          if (err) return res.status(500).json(err);

          // Lấy ID vừa tạo để tạo token
          const token = jwt.sign({ id: data.insertId }, "jwtkey");

          // Tạo object user để trả về frontend
          const newUser = {
             id: data.insertId,
             username: name,
             email: email,
             role_id: roleIdUser,
             avatar: picture
          };

          res
            .cookie("access_token", token, {
              httpOnly: true,
              sameSite: "none",
              secure: true,
            })
            .status(200)
            .json(newUser);
        });
      }
    });
  } catch (err) {
    console.log("Google Auth Error:", err);
    res.status(500).json(err);
  }
};