import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";
import pool from "../config/db.js"; // make sure this is your postgres pool

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Authenticate token and attach user info to req.user
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // contains { id, username, email } from JWT
    next();
  });
}

// Require admin role by fetching latest role from DB
export async function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const result = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const role = result.rows[0].role;

    if (role !== 'admin')
      return res.status(403).json({ message: 'Admin only' });

    next(); // user is admin
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}