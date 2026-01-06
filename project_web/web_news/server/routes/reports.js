import express from "express";
import { addReport, getReportedPosts, getReportsForPost, checkReport } from "../controllers/report.js";

const router = express.Router();

router.get("/check", checkReport); // Check if user reported a post
router.post("/", addReport);
router.get("/", getReportedPosts); // For admin dashboard list
router.get("/:id", getReportsForPost); // Get details of reports for a specific post

export default router;
