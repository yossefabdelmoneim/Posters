// routes/adminRoutes.js
import express from "express";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware.js";
import {
    addCategory,
    addPoster,
    editPoster,
    deletePoster,
    createUserByAdmin, deleteCategory
} from "../controllers/adminController.js";
import multer from "multer";

const router = express.Router();

// Multer setup for poster image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // temporary folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ---- CATEGORIES ----
router.post("/category", authenticateToken, requireAdmin, addCategory);

// ---- POSTERS ----
router.post("/posters", authenticateToken, requireAdmin, upload.single("image"), addPoster);
router.put("/posters/:id", authenticateToken, requireAdmin, editPoster);
router.delete("/posters/:id", authenticateToken, requireAdmin, deletePoster);
router.delete("/category/:id", authenticateToken, requireAdmin, deleteCategory);
// ---- USERS ----
router.post("/users", authenticateToken, requireAdmin, createUserByAdmin);

export default router;