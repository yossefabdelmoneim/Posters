// controllers/orderController.js
import pool from '../config/db.js';

export async function createOrder(req, res) {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const { items, total } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'No items' });

    await client.query('BEGIN');

    // 1. First check stock for all items
    for (const item of items) {
      const stockCheck = await client.query(
        'SELECT stock, title FROM posters WHERE id = $1',
        [item.poster_id || item.id] // Support both poster_id and id
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Poster not found`);
      }

      const currentStock = stockCheck.rows[0].stock;
      const posterTitle = stockCheck.rows[0].title;

      if (currentStock < item.quantity) {
        throw new Error(`Not enough stock for "${posterTitle}". Available: ${currentStock}, requested: ${item.quantity}`);
      }
    }

    // 2. Update stock for all items
    for (const item of items) {
      await client.query(
        'UPDATE posters SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.poster_id || item.id]
      );
    }

    // 3. Create order
    const orderRes = await client.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1,$2,$3) RETURNING *',
      [userId, total, 'processing'] // Changed from 'paid' to 'processing'
    );
    const order = orderRes.rows[0];

    // 4. Create order items
    const insertPromises = items.map(it => {
      return client.query(
        'INSERT INTO order_items (order_id, poster_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, it.poster_id || it.id, it.quantity, it.price]
      );
    });
    await Promise.all(insertPromises);

    // 5. Create notification
    const message = `User ${req.user.username || req.user.email} made a purchase (order ${order.id})`;
    await client.query('INSERT INTO notifications (user_id, message) VALUES ($1,$2)', [null, message]);

    await client.query('COMMIT');

    res.json({
      orderId: order.id,
      success: true,
      message: 'Order created successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', err);
    res.status(500).json({
      message: err.message || 'Server error during order creation',
      success: false
    });
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