import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser"; 
import multer from "multer";
import dotenv from "dotenv";

// Import thư viện Cloudinary
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Import Session Store
import MySQLStore from "express-mysql-session";

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

// Khởi tạo app
const app = express();
dotenv.config(); // Đọc file .env

// ==========================================
// 1. CẤU HÌNH CORS
// ==========================================
// Lưu ý: Cập nhật domain frontend của bạn vào đây
const FRONTEND_URLS = process.env.FRONTEND_URLS || "http://localhost:5173,https://project-web-new-ten.vercel.app,https://bk-news-lc77q2wy2-xuans-projects-b7843493.vercel.app";
const allowedOrigins = FRONTEND_URLS.split(',').map(s => s.trim());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ==========================================
// 2. CẤU HÌNH UPLOAD ẢNH (CLOUDINARY)
// ==========================================
// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// Tạo kho lưu trữ trên Cloudinary (THAY THẾ CODE CŨ TẠI ĐÂY)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'web_news_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const upload = multer({ storage: storage });

// API Upload trả về link online
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
      return res.status(400).json("No file uploaded");
  }
  // Trả về đường dẫn ảnh trên Cloudinary
  res.status(200).json(req.file.path); 
});

// ==========================================
// 3. CẤU HÌNH SESSION (MYSQL)
// ==========================================
const MySQLSessionStore = MySQLStore(session);
const sessionStore = new MySQLSessionStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
});

app.use(session({
  key: 'session_cookie_name',
  secret: "secret-key",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// ==========================================
// 4. ROUTES
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

// Test route
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});