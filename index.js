import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ===== Routes =====
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", authRoutes(pool));
app.use("/api/users", userRoutes(pool));

// ===== GLOBAL PING =====
app.get("/ping", (req, res) => {
  res.json({
    message: "API is alive",
    time: new Date().toISOString(),
  });
});
// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger → http://localhost:${PORT}/api-docs`);
});
