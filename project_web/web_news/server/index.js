import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser"; 
import multer from "multer";

// Import Routes
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import adminRoutes from "./routes/admin.js"; 
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import userRoutes from "./routes/users.js";
import interactionRoutes from "./routes/interactions.js";
import categoryRoutes from "./routes/category.js";
import reportRoutes from "./routes/reports.js";
import aiRoutes from "./routes/ai.js";

const app = express();

// ==========================================
// 1. CẤU HÌNH CORS (PHẢI NẰM TRÊN CÙNG)
// ==========================================
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true // Quan trọng: Cho phép nhận Cookie
}));

// ==========================================
// 2. CẤU HÌNH PARSER (ĐỌC DỮ LIỆU)
// ==========================================
app.use(express.json());
app.use(cookieParser()); // Đọc cookie sau khi đã qua cửa CORS

// ==========================================
// 3. CẤU HÌNH UPLOAD ẢNH
// ==========================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); 
  },
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// ==========================================
// 4. (TÙY CHỌN) SESSION
// ==========================================
// Nếu bạn dùng JWT token (access_token) thì cái này không thực sự tác động đến Login,
// nhưng nếu muốn giữ lại thì để ở đây.
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ==========================================
// 5. ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chat", aiRoutes);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});