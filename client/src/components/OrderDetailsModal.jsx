// src/components/OrderDetailsModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OrderDetailsModal.css";

const OrderDetailsModal = ({ order, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order) {
      fetchOrderItems();
    }
  }, [order]);

  const fetchOrderItems = async () => {
    try {
      // We need to create this endpoint in the backend
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/orders/${order.id}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderItems(res.data);
    } catch (err) {
      console.error("Error fetching order items:", err);
      // For now, show mock data
      setOrderItems([
        { id: 1, poster_title: "Sample Poster 1", quantity: 2, price: 24.99 },
        { id: 2, poster_title: "Sample Poster 2", quantity: 1, price: 19.99 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <h2>Order Details #{order.id}</h2>

        <div className="order-info">
          <div className="info-row">
            <span>Order Date:</span>
            <span>{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span>Status:</span>
            <span className={`status status-${order.status}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <div className="info-row">
            <span>Total:</span>
            <span className="total-amount">${order.total}</span>
          </div>
        </div>

        <h3>Order Items</h3>

        {loading ? (
          <div className="loading">Loading items...</div>
        ) : (
          <div className="order-items-list">
            {orderItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-info">
                  <h4>{item.poster_title || `Item ${item.id}`}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;