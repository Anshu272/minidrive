import cloudinary from "../config/cloudinary.js";
import File from "../models/File.js";
import User from "../models/User.js";
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // ✨ Step 1: Determine the resource type before uploading
    // If it's a PDF, we force 'raw'. For others (images/videos), we let 'auto' handle it.
    const isPdf = req.file.mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "auto";

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "minidrive",
          resource_type: resourceType, // ✨ Use the determined type here
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const file = await File.create({
      user: req.user.id,
      originalName: req.file.originalname,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      mimeType: req.file.mimetype,
      size: req.file.size,
      // ✨ Recommended: Store the resource type in your DB 
      // so you know how to delete it later!
      resourceType: uploadResult.resource_type 
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};


/* ================= GET MY FILES ================= */
export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    const files = await File.find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      files,
    });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({
      message: "Failed to fetch files",
    });
  }
};
/* ================= DELETE FILE ================= */
export const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role; // Make sure your auth middleware provides 'role'

    // 1. Find the file by ID only (don't filter by user yet)
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // 2. PERMISSION CHECK:
    // User can delete if they are the OWNER OR they are an ADMIN
    const isOwner = file.user.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You do not have permission to delete this file" });
    }

    // 3. Delete from Cloudinary
    // Tip: Use resource_type: file.resourceType if you stored it, otherwise use 'auto' or 'image'
    await cloudinary.uploader.destroy(file.publicId, {
       resource_type: file.resourceType || "image" 
    });

    // 4. Delete from database
    await file.deleteOne();

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};

export const viewFileController = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const file = await File.findById(fileId)
      .populate("user", "username email")
      .populate("sharedWith.user", "username email");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    /* ================= 1. OWNER (HIGHEST PRIORITY) ================= */
    if (file.user._id.toString() === userId.toString()) {
      return res.status(200).json({
        access: "owner",
        file,
      });
    }

    /* ================= 2. SHARED USER ================= */
    const sharedEntry = file.sharedWith.find(
      (entry) => entry.user._id.toString() === userId.toString()
    );

    if (sharedEntry) {
      return res.status(200).json({
        access: sharedEntry.permission, // "edit" | "view"
        file,
      });
    }

    /* ================= 3. ADMIN OVERRIDE ================= */
    if (userRole === "admin") {
      return res.status(200).json({
        access: "admin", // ✅ FIXED
        file,
      });
    }

    /* ================= 4. NO ACCESS ================= */
    return res.status(403).json({
      access: "none",
      message: "No access",
    });
  } catch (error) {
    console.error("viewFileController error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const shareFileByEmail = async (req, res) => {
  try {
    const { email, role } = req.body;
    const fileId = req.params.id;
    const ownerId = req.user.id;

    // 1. Find the user by email
    const userToShareWith = await User.findOne({ email: email.toLowerCase() });
    if (!userToShareWith) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    // 2. Find the file
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    // 3. Security check: Is the requester the owner?
    if (file.user.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 4. Update or Add permission
    const existingIndex = file.sharedWith.findIndex(
      (s) => s.user.toString() === userToShareWith._id.toString()
    );

    if (existingIndex > -1) {
      file.sharedWith[existingIndex].permission = role;
    } else {
      file.sharedWith.push({ user: userToShareWith._id, permission: role });
    }

    await file.save();
    res.status(200).json({ message: `Access granted to ${email}` });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const revokeAccessController = async (req, res) => {
  try {
    const { id } = req.params; // File ID
    const { userId } = req.body; // ID of the user to remove
    const ownerId = req.user.id;

    const file = await File.findById(id);

    if (!file) return res.status(404).json({ message: "File not found" });

    // Only the owner can revoke access
    if (file.user.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove the user from the sharedWith array
    file.sharedWith = file.sharedWith.filter(
      (item) => item.user.toString() !== userId
    );

    await file.save();

    res.status(200).json({ message: "Access revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const renameFile = async (req, res) => {
  try {
    res.send("hello")
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({ message: "New name is required" });
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      { originalName:newName },
      { new: true, runValidators: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({ message: "File renamed", file: updatedFile });
  } catch (error) {
    res.status(500).json({ message: "Server error during rename", error: error.message });
  }
};

export const updateFileContent = async (req, res) => {
  try {
    
    const { id } = req.params;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Find the file and check permissions
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: "File not found" });

    // Check if user is owner or has 'edit' permission
    const isOwner = file.user.toString() === userId.toString();
    const isEditor = file.sharedWith.some(
      (s) => s.user.toString() === userId.toString() && s.permission === "edit"
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "You do not have permission to update this file" });
    }

    // 2. Delete the OLD file from Cloudinary
    if (file.publicId) {
      await cloudinary.uploader.destroy(file.publicId);
    }

    // 3. Upload the NEW file to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "minidrive",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // 4. Update the existing database record
    file.url = uploadResult.secure_url;
    file.publicId = uploadResult.public_id;
    file.size = req.file.size;
    file.mimeType = req.file.mimetype;
    file.originalName = req.file.originalname; // Optional: update name to the new file's name

    await file.save();

    res.status(200).json({
      message: "File updated successfully",
      file,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// fileController.js
export const getAllFilesAdmin = async (req, res) => {
  try {
    // Fetch all files and include the owner's username and email
    const files = await File.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all files" });
  }
};