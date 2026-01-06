import express from "express";
import { getComments, addComment,deleteComment, updateComment } from "../controllers/comment.js";
const router = express.Router();
router.get("/", getComments);
router.post("/", addComment);
router.delete("/:id", deleteComment);
router.put("/:id", updateComment);
export default router;