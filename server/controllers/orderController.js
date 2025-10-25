// controllers/orderController.js
import pool from '../config/db.js';

export async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { items, total } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'No items' });

    await client.query('BEGIN');

    const orderRes = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1,$2,$3) RETURNING *',
      [userId, total, 'paid']
    );
    const order = orderRes.rows[0];

    const insertPromises = items.map(it => {
      return client.query(
        'INSERT INTO order_items (order_id, poster_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, it.poster_id, it.quantity, it.price]
      );
    });
    await Promise.all(insertPromises);

    // create notification for admin(s) - simple approach: insert a notification with admin_id = NULL
    const message = `User ${req.user.username || req.user.email} made a purchase (order ${order.id})`;
    // Option A: insert to notifications without admin_id so admin dashboard can list all unread notifications
    await client.query('INSERT INTO notifications (user_id, message) VALUES ($1,$2)', [null, message]);

    await client.query('COMMIT');

    res.json({ orderId: order.id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
}

export async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminGetOrders(req, res) {
  try {
    const orders = await pool.query('SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
    res.json(orders.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function adminUpdateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Add this function for order items
export async function getOrderItems(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify the order belongs to the user (or user is admin)
    const orderCheck = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [id, userId, req.user.role === 'admin']
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const result = await pool.query(
      `SELECT oi.*, p.title as poster_title, p.image_url 
       FROM order_items oi 
       LEFT JOIN posters p ON oi.poster_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}