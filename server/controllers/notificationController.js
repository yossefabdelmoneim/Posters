import pool from '../config/db.js';

export async function getNotifications(req, res) {
  try {
    // show all notifications. admin dashboard should poll or use sockets
    const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = true WHERE id=$1', [id]);
    res.json({ message: 'Marked read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
