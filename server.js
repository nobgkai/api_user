import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import authMiddleware from "./middleware/auth.js";
import jwt from "jsonwebtoken";
const app = express();
app.use(express.json());

// ===== MySQL Pool =====
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ============ API TESTING ============

// Test DB
app.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    res.json({ status: "ok", time: rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET users
app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tbl_users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Query failed" });
  }
});

// ============ CREATE USER (INSERT) ============

// POST users
app.post("/users", async (req, res) => {
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

    // ตรวจขั้นต่ำ
    if (!username || !password) {
      return res.status(400).json({
        error: "username and password are required",
      });
    }
    const [check] = await pool.query(
      "SELECT id FROM tbl_users WHERE username = ?",
      [username]
    );
    if (check.length > 0) {
      return res.status(409).json({
        message: "username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO tbl_users
      (prefix, firstname, lastname, username, password, gender, birthdate, address, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      prefix,
      firstname,
      lastname,
      username,
      hashedPassword,
      gender,
      birthdate,
      address,
      role || "admin",
      status || "active",
    ]);

    res.status(201).json({
      message: "User created",
      user_id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

//=============================== login ==============================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    // หา user
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

    // เช็ครหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "username หรือ password ไม่ถูกต้อง",
      });
    }

    // สร้าง token (ไม่สน role)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "login success",
      token: token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/getall", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, prefix, firstname, lastname, username, gender, birthdate, address, role, status, created_at FROM tbl_users"
    );

    res.json({
      message: "ดึงข้อมูลสำเร็จ",
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  res.json({
    message: "คุณ login แล้ว",
    user: req.user,
  });
});

// ============ UPDATE USER ============
app.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { prefix, firstname, lastname, gender, birthdate, address, status } =
      req.body;

    const sql = `
      UPDATE tbl_users
      SET
        prefix = ?,
        firstname = ?,
        lastname = ?,
        gender = ?,
        birthdate = ?,
        address = ?,
        status = ?
      WHERE id = ?
    `;

    const [result] = await pool.query(sql, [
      prefix,
      firstname,
      lastname,
      gender,
      birthdate,
      address,
      status,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "ไม่พบผู้ใช้",
      });
    }

    res.json({
      message: "แก้ไขข้อมูลสำเร็จ",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ============ DELETE USER ============
app.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM tbl_users WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "ไม่พบผู้ใช้",
      });
    }

    res.json({
      message: "ลบข้อมูลสำเร็จ",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
