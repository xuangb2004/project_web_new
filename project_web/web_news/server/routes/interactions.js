import express from "express";
import { getSavedPostIds, toggleBookmark, getSavedPosts, addToHistory, getHistoryPosts,deleteHistory,checkBookmark } from "../controllers/interaction.js";

const router = express.Router();

// Bookmarks
router.get("/bookmarks/ids", getSavedPostIds); // Lấy danh sách ID đã lưu
router.get("/bookmarks/check", checkBookmark); // Kiểm tra bài viết đã lưu chưa
router.post("/bookmarks", toggleBookmark);     // Lưu / Bỏ lưu
router.get("/bookmarks", getSavedPosts);       // Lấy danh sách bài chi tiết

// History
router.post("/history", addToHistory);         // Ghi lịch sử
router.get("/history", getHistoryPosts);       // Lấy danh sách lịch sử
router.delete("/history", deleteHistory);

export default router;