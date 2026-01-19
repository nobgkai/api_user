import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authMiddleware, { addTokenToBlacklist } from "../middleware/auth.js";

const router = express.Router();

export default function authRoutes(pool) {
  // ===== LOGIN =====
  /**
   * @openapi
   * /login:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 🔐 Login
   *     description: |
   *       ใช้สำหรับเข้าสู่ระบบด้วย username และ password
   *       หากข้อมูลถูกต้อง ระบบจะส่ง JWT Token กลับไป
   *
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: test001
   *               password:
   *                 type: string
   *                 example: 123456
   *
   *     responses:
   *       200:
   *         description: ✅ Login success
   *         content:
   *           application/json:
   *             example:
   *               message: login success
   *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   *       400:
   *         description: ❌ Missing username or password
   *         content:
   *           application/json:
   *             example:
   *               message: username and password are required
   *
   *       401:
   *         description: ❌ Invalid username or password
   *
   *       500:
   *         description: ❌ Server error
   */
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "username and password are required",
        });
      }

      const [rows] = await pool.query(
        "SELECT * FROM tbl_users WHERE username = ?",
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({
          message: "username หรือ password ไม่ถูกต้อง",
        });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "username หรือ password ไม่ถูกต้อง",
        });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "login success",
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  // ===== LOGOUT =====================================
  /**
   * @openapi
   * /logout:
   *   post:
   *     tags:
   *       - Auth
   *     summary: 🚪 Logout
   *     description: |
   *       ใช้สำหรับออกจากระบบ
   *
   *       🔹 หมายเหตุ:
   *       - ระบบใช้ JWT (Stateless)
   *       - Server จะไม่ลบ token
   *       - Client ต้องลบ token เอง
   *
   *     security:
   *       - BearerAuth: []
   *
   *     responses:
   *       200:
   *         description: ✅ Logout success
   *         content:
   *           application/json:
   *             example:
   *               message: logout success
   *
   *       401:
   *         description: ❌ Unauthorized (missing or invalid token)
   *
   *       500:
   *         description: ❌ Server error
   */
  router.post("/logout", authMiddleware, (req, res) => {
    // Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    // 🔥 blacklist token (ทำให้ใช้ต่อไม่ได้)
    addTokenToBlacklist(token);

    res.json({ message: "logout success" });
  });

  // ===== PROFILE =====
  /**
   * @openapi
   * /profile:
   *   get:
   *     tags:
   *       - Auth
   *     summary: 👤 Get profile
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: ✅ Authorized
   *       401:
   *         description: ❌ Unauthorized
   */

  router.get("/profile", authMiddleware, (req, res) => {
    res.json({
      message: "คุณ login แล้ว",
      user: req.user,
    });
  });

  return router;
}
