const express = require("express");
const { put } = require("@vercel/blob");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

// Send a binary request with ?filename=photo.jpg and Content-Type: image/*.
router.post(
  "/upload",
  requireAuth,
  express.raw({ type: ["image/*", "application/octet-stream"], limit: "4mb" }),
  async (req, res, next) => {
    try {
      const filename = String(req.query.filename || "upload").replace(/[^a-zA-Z0-9._-]/g, "-");
      if (!filename || !req.body?.length) return res.status(400).json({ message: "A file is required" });

      const blob = await put(`uploads/${req.user.id}/${Date.now()}-${filename}`, req.body, {
        access: "public",
        addRandomSuffix: true,
        contentType: req.headers["content-type"] || "application/octet-stream",
      });

      res.status(201).json({ url: blob.url, pathname: blob.pathname, contentType: blob.contentType });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
