// controllers/posterController.js
import pool from '../config/db.js';

export async function getAllPosters(req, res) {
  try {
    // Remove the is_active filter since we're using soft delete with stock=0
    const q = 'SELECT p.*, c.name as category_name FROM posters p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC';
    const result = await pool.query(q);
    res.json(result.rows);
  }
  catch (err) {
    console.error('Error fetching posters:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getPosterById(req, res) {
  try {
    const { id } = req.params;
    const q = 'SELECT p.*, c.name as category_name FROM posters p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id=$1';
    const result = await pool.query(q, [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Poster not found' });
    res.json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function getPostersByCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const q = 'SELECT p.*, c.name as category_name FROM posters p LEFT JOIN categories c ON p.category_id = c.id WHERE p.category_id = $1 ORDER BY p.created_at DESC';
    const result = await pool.query(q, [categoryId]);
    res.json(result.rows);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}