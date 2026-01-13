import express from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { uploadFile, getMyFiles,deleteFile,viewFileController,shareFileByEmail, revokeAccessController, renameFile, updateFileContent, getAllFilesAdmin } from "../controllers/fileController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// Upload file (protected)
router.post("/share/:id", authMiddleware, shareFileByEmail);
router.get("/admin/all-files", authMiddleware, getAllFilesAdmin);
router.delete("/revoke/:id", authMiddleware, revokeAccessController);
router.put("/update-content/:id",authMiddleware, upload.single("file"), updateFileContent);
router.put("/rename/:id",authMiddleware, renameFile);
router.get("/showfile/:id",authMiddleware, viewFileController);
router.post( "/upload", authMiddleware, upload.single("file"), uploadFile);
router.get( "/my-files", authMiddleware, getMyFiles);
router.delete( "/delete/:id", authMiddleware, deleteFile)




export default router;
