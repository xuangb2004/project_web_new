import express from "express";
import {
  register,
  login,
  logout,
  editorRegister,
  googleAuth,
} from "../controllers/auth.js"; 

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/editor-register", editorRegister);
router.post("/google", googleAuth);
export default router;