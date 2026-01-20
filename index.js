import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";

import swaggerSpec from "./swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// ===== DB Pool =====
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ===== API Routes =====
app.use("/api", authRoutes(pool));
app.use("/api/users", userRoutes(pool));

// ===== Swagger JSON =====
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

// ===== Swagger UI (STATIC) =====
app.get("/api-docs", (req, res) => {
  res.sendFile(path.join(__dirname, "swagger-ui.html"));
});

// ===== GLOBAL PING =====
app.get("/ping", (req, res) => {
  res.json({
    message: "API is alive",
    time: new Date().toISOString(),
  });
});

// ===== Start Server (LOCAL ONLY) =====
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger → http://localhost:${PORT}/api-docs`);
  });
}

// ❌ ห้าม listen บน Vercel
export default app;
