// controllers/adminController.js
import pool from '../config/db.js';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with error handling
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Cloudinary configuration failed:', error);
}

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

    if (!req.file) return res.status(400).json({ message: 'Image file required' });

    let image_url;

    try {
      // Try Cloudinary first
      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: 'posters',
        resource_type: 'image'
      });
      image_url = uploadRes.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary upload failed:', uploadError);
      // Fallback to local path
      image_url = `/uploads/${req.file.filename}`;
    }

    // Remove local temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete temp upload:', err);
    });

    const result = await pool.query(
      'INSERT INTO posters (title, description, price, image_url, category_id, stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, price, image_url, category_id || null, stock || 0]
    );
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error('Poster creation error:', err);
    res.status(500).json({ message: 'Server error during poster creation' });
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
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    const { id } = req.params;

    // First, delete all order_items that reference this poster
    await client.query('DELETE FROM order_items WHERE poster_id = $1', [id]);

    // Then delete the poster itself
    const result = await client.query('DELETE FROM posters WHERE id = $1 RETURNING *', [id]);

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Poster not found' });
    }

    await client.query('COMMIT'); // Commit transaction
    res.json({ message: 'Poster deleted successfully', poster: result.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error

    if (err.code === '23503') { // Foreign key violation
      res.status(400).json({
        message: 'Cannot delete poster because it is referenced in existing orders. Please contact system administrator.'
      });
    } else {
      console.error('Error deleting poster:', err);
      res.status(500).json({ message: 'Server error during poster deletion' });
    }
  } finally {
    client.release();
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING *', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted', category: result.rows[0] });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createUserByAdmin(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length) return res.status(400).json({ message: 'Email already used' });

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