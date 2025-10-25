import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export async function addCategory(req, res) {
  try {
    const {name} = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function addPoster(req, res) {
  try {
    const { title, description, price, category_id, stock } = req.body;
    // file is available via multer as req.file
    if (!req.file) return res.status(400).json({ message: 'Image file required' });

    // upload to cloudinary
    const uploadRes = await cloudinary.uploader.upload(req.file.path, { folder: 'posters' });

    // remove local temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp upload:', err);
    });

    const image_url = uploadRes.secure_url;
    const result = await pool.query(
      'INSERT INTO posters (title, description, price, image_url, category_id, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, price, image_url, category_id || null, stock || 0]
    );
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function editPoster(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, stock } = req.body;

    const q = `UPDATE posters SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      price = COALESCE($3, price),
      category_id = COALESCE($4, category_id),
      stock = COALESCE($5, stock)
      WHERE id = $6 RETURNING *`;

    const result = await pool.query(q, [title, description, price, category_id, stock, id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Poster not found' });
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function deletePoster(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM posters WHERE id=$1 RETURNING *', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Poster not found' });
    res.json({ message: 'Deleted', poster: result.rows[0] });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createUserByAdmin(req, res) {
  // Only admin can call; this will create ordinary users
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    // check existing
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(400).json({ message: 'Email already used' });

    // hash password
    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, username, email, role',
      [username, email, hash, 'user']
    );
    res.json({ user: result.rows[0] });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}