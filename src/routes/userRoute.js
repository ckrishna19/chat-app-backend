import { Router } from "express";
import {
  registerUser,
  getAllProfile,
  loginUser,
  getMyProfile,
  getUserProfile,
  logOutUserController,
  sendOTP,
  verifyOTP,
  resetPassword,
} from "../controller/userController.js";
import { auth } from "../utils/auth.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.use(auth);
router.get("/me", getMyProfile);
router.post("/logout", logOutUserController);
router.get("/", getAllProfile);
router.get("/:id", getUserProfile);

export default router;
