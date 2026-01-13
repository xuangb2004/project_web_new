import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser"; 
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
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
const FRONTEND_URLS = process.env.FRONTEND_URLS || "http://localhost:5173,https://project-web-new-ten.vercel.app";
const allowedOrigins = FRONTEND_URLS.split(',').map(s => s.trim());
console.log("🔧 Allowed frontend origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server, mobile, curl, etc.
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    console.warn('Blocked CORS request from:', origin);
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true // Quan trọng: Cho phép nhận Cookie
}));

// Health endpoint for quick diagnostics
app.get('/health', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).json({ db: false, error: err.message });
    return res.json({ db: true });
  });
});

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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Cấu hình kho lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'web_news_uploads', // Tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Định dạng cho phép
  },
});

const upload = multer({ storage: storage });

// API Upload
app.post("/api/upload", upload.single("file"), (req, res) => {
  // Khi dùng Cloudinary, đường dẫn ảnh đầy đủ sẽ nằm trong req.file.path
  // Ví dụ: https://res.cloudinary.com/demo/image/upload/v16.../anh.jpg
  if (!req.file) {
      return res.status(400).json("No file uploaded");
  }
  res.status(200).json(req.file.path); // Trả về đường dẫn ảnh Online
});
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
