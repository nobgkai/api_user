import express from "express";
import bcrypt from "bcryptjs";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

export default function userRoutes(pool) {
  // ===== GET ALL =====
  /**
   * @openapi
   * /users:
   *   get:
   *     tags:
   *       - Users
   *     summary: 📋 ดูรายชื่อผู้ใช้ทั้งหมด
   *     description: |
   *       ใช้สำหรับดึงข้อมูลผู้ใช้ทั้งหมดในระบบ
   *       **ไม่แสดงรหัสผ่าน (password)**
   *       ต้อง login ก่อนจึงจะเรียกใช้งานได้
   *
   *     security:
   *       - BearerAuth: []
   *
   *     responses:
   *       200:
   *         description: ✅ ดึงข้อมูลผู้ใช้สำเร็จ
   *         content:
   *           application/json:
   *             example:
   *               - id: 1
   *                 firstname: สมชาย
   *                 lastname: ใจดี
   *                 username: admin01
   *                 role: admin
   *                 status: active
   *
   *       401:
   *         description: ❌ ยังไม่ได้ login หรือ token ไม่ถูกต้อง
   *         content:
   *           application/json:
   *             example:
   *               message: กรุณา login ก่อน
   *
   *       500:
   *         description: ❌ เกิดข้อผิดพลาดที่ server
   */
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, prefix, firstname, lastname, username, gender, role, status FROM tbl_users"
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===== CREATE =====
  /**
   * @openapi
   * /users:
   *   post:
   *     tags:
   *       - Users
   *     summary: ➕ เพิ่มผู้ใช้ใหม่
   *     description: |
   *       ใช้สำหรับสร้างผู้ใช้ใหม่ในระบบ
   *       ระบบจะทำการ **hash password ให้อัตโนมัติ**
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
   *               - firstname
   *               - lastname
   *             properties:
   *               username:
   *                 type: string
   *                 example: user01
   *               password:
   *                 type: string
   *                 example: 123456
   *               firstname:
   *                 type: string
   *                 example: สมหญิง
   *               lastname:
   *                 type: string
   *                 example: ใจดี
   *               role:
   *                 type: string
   *                 example: user
   *               status:
   *                 type: string
   *                 example: active
   *
   *     responses:
   *       201:
   *         description: ✅ สร้างผู้ใช้สำเร็จ
   *         content:
   *           application/json:
   *             example:
   *               message: สร้างผู้ใช้สำเร็จ
   *               user_id: 5
   *
   *       400:
   *         description: ❌ กรอกข้อมูลไม่ครบ
   *         content:
   *           application/json:
   *             example:
   *               message: กรุณากรอกข้อมูลที่จำเป็นให้ครบ
   *
   *       409:
   *         description: ❌ username ซ้ำ
   *         content:
   *           application/json:
   *             example:
   *               message: username นี้ถูกใช้งานแล้ว
   *
   *       500:
   *         description: ❌ เกิดข้อผิดพลาดที่ server
   */
  router.post("/", async (req, res) => {
    try {
      const {
        prefix,
        firstname,
        lastname,
        username,
        password,
        gender,
        birthdate,
        address,
        role,
        status,
      } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO tbl_users
         (prefix, firstname, lastname, username, password, gender, birthdate, address, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prefix,
          firstname,
          lastname,
          username,
          hashedPassword,
          gender,
          birthdate,
          address,
          role,
          status,
        ]
      );

      res.status(201).json({
        message: "User created",
        user_id: result.insertId,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===== UPDATE =====
  /**
   * @openapi
   * /users/{id}:
   *   put:
   *     tags:
   *       - Users
   *     summary: ✏️ แก้ไขข้อมูลผู้ใช้
   *     description: |
   *       ใช้สำหรับแก้ไขข้อมูลผู้ใช้ตาม ID
   *       ต้อง login ก่อนจึงจะใช้งานได้
   *
   *     security:
   *       - BearerAuth: []
   *
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: รหัสผู้ใช้
   *
   *     responses:
   *       200:
   *         description: ✅ แก้ไขข้อมูลสำเร็จ
   *         content:
   *           application/json:
   *             example:
   *               message: แก้ไขข้อมูลผู้ใช้สำเร็จ
   *
   *       401:
   *         description: ❌ ยังไม่ได้ login
   *
   *       404:
   *         description: ❌ ไม่พบผู้ใช้
   *         content:
   *           application/json:
   *             example:
   *               message: ไม่พบผู้ใช้ที่ต้องการแก้ไข
   *
   *       500:
   *         description: ❌ เกิดข้อผิดพลาดที่ server
   */

  // ===== UPDATE =====
  /**
   * @openapi
   * /users/{id}:
   *   put:
   *     tags:
   *       - Users
   *     summary: ✏️ แก้ไขข้อมูลผู้ใช้
   *     description: |
   *       ใช้สำหรับแก้ไขข้อมูลผู้ใช้ตาม ID
   *       ต้อง login ก่อนจึงจะใช้งานได้
   *
   *     security:
   *       - BearerAuth: []
   *
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: รหัสผู้ใช้
   *
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example:
   *             prefix: นาย
   *             firstname: สมชาย
   *             lastname: ใจดี
   *             username: somchai01
   *             gender: male
   *             birthdate: 2000-01-01
   *             address: เชียงใหม่
   *             status: active
   *
   *     responses:
   *       200:
   *         description: ✅ แก้ไขข้อมูลผู้ใช้สำเร็จ
   *         content:
   *           application/json:
   *             example:
   *               message: แก้ไขข้อมูลสำเร็จ
   *
   *       400:
   *         description: ❌ ไม่ได้ส่งข้อมูลสำหรับแก้ไข
   *         content:
   *           application/json:
   *             example:
   *               message: กรุณาส่งข้อมูลสำหรับแก้ไข
   *
   *       401:
   *         description: ❌ ยังไม่ได้ login
   *
   *       404:
   *         description: ❌ ไม่พบผู้ใช้
   *         content:
   *           application/json:
   *             example:
   *               message: ไม่พบผู้ใช้
   *
   *       500:
   *         description: ❌ เกิดข้อผิดพลาดที่ server
   */

  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      // ป้องกัน body ว่าง
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: "กรุณาส่งข้อมูลสำหรับแก้ไข",
        });
      }

      const {
        prefix,
        firstname,
        lastname,
        username,
        gender,
        birthdate,
        address,
        status,
      } = req.body;
      // 🔹 ดึง username เดิมจาก DB
      const [[user]] = await pool.query(
        "SELECT username FROM tbl_users WHERE id = ?",
        [id]
      );

      if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้" });
      }

      // 🔹 ถ้าไม่ส่ง username → ใช้ของเดิม
      const finalUsername = username ?? user.username;
      const [result] = await pool.query(
        `UPDATE tbl_users
       SET prefix = ?,
           firstname = ?,
           lastname = ?,
           username = ?, 
           gender = ?,
           birthdate = ?,
           address = ?,
           status = ?
       WHERE id = ?`,
        [
          prefix,
          firstname,
          lastname,
          username, // ✅ สำคัญมาก ต้องอยู่ตรงนี้
          gender,
          birthdate,
          address,
          status,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้" });
      }

      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ===== DELETE =====
  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     tags:
   *       - Users
   *     summary: 🗑 ลบผู้ใช้
   *     description: |
   *       ใช้สำหรับลบผู้ใช้ตาม ID
   *       ต้อง login ก่อน
   *
   *     security:
   *       - BearerAuth: []
   *
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: รหัสผู้ใช้
   *
   *     responses:
   *       200:
   *         description: ✅ ลบผู้ใช้สำเร็จ
   *         content:
   *           application/json:
   *             example:
   *               message: ลบผู้ใช้สำเร็จ
   *
   *       401:
   *         description: ❌ ยังไม่ได้ login
   *
   *       404:
   *         description: ❌ ไม่พบผู้ใช้
   *
   *       500:
   *         description: ❌ เกิดข้อผิดพลาดที่ server
   */
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await pool.query("DELETE FROM tbl_users WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้" });
      }

      res.json({ message: "ลบข้อมูลสำเร็จ" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
