import express from "express";
import { 
  getDashboardStats, 
  getEditorsList, 
  getPendingPosts, 
  updatePostStatus,
  deleteUser,
  getPendingEditors,
  updateUserStatus,
  deletePost,
  getReportedPosts,
  deleteReports
} from "../controllers/admin.js";

const router = express.Router();

router.get("/stats", getDashboardStats);
router.get("/editors", getEditorsList);
router.get("/editors/pending", getPendingEditors);
router.put("/users/:id/status", updateUserStatus);
router.get("/posts/pending", getPendingPosts);
router.put("/posts/:id/status", updatePostStatus);
router.delete("/users/:id", deleteUser);
router.delete("/posts/:id", deletePost);
router.get("/reports", getReportedPosts);
router.delete("/reports/:id", deleteReports);

export default router;
