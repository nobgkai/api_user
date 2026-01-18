import jwt from "jsonwebtoken";

// 🔥 blacklist อยู่ใน middleware
const tokenBlacklist = new Set();

export const addTokenToBlacklist = (token) => {
  tokenBlacklist.add(token);
};

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "กรุณา login ก่อน" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "รูปแบบ token ไม่ถูกต้อง" });
    }

    const token = parts[1];

    // ❌ token นี้ logout ไปแล้ว
    if (tokenBlacklist.has(token)) {
      return res
        .status(401)
        .json({ message: "คุณได้ logout แล้ว กรุณา login ใหม่" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "token หมดอายุหรือไม่ถูกต้อง" });
  }
};

export default authMiddleware;
