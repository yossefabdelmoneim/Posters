import React, { useState } from 'react';
import { useCart } from '../Context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Truck, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Checkout.css';

function Checkout() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const total = getCartTotal();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to checkout');
        navigate('/login');
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          poster_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: total
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Order response:', result);

      if (response.ok && result.success) {
        // SUCCESS: Only clear cart after successful order
        clearCart();
        alert('Order placed successfully!');
        navigate('/orders');
      } else {
        // FAILURE: Don't clear cart, show error
        alert(`Order failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="checkout-empty">
          <div className="empty-cart-message">
            <Package size={64} />
            <h2>Your cart is empty</h2>
            <p>Add some posters before checking out</p>
            <button
              onClick={() => navigate('/shop')}
              className="btn btn-primary"
            >
              Browse Posters
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <button
            onClick={() => navigate('/cart')}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>

          <div className="checkout-layout">
            <div className="checkout-form-section">
              <h1>Checkout</h1>

              <form onSubmit={handleCheckout} className="checkout-form">
                {/* Shipping Information */}
                <div className="form-section">
                  <h3>
                    <Truck size={20} />
                    Shipping Information
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="form-section">
                  <h3>
                    <CreditCard size={20} />
                    Payment Information
                  </h3>
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="checkout-btn"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Pay LE ${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            {/* Order Summary Section - SIMPLIFIED */}
            <div className="order-summary-section">
              <div className="order-summary">
                <div className="summary-header">
                  <h3>Order Summary</h3>
                  <span className="items-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="order-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="order-item">
                      <img src={item.image_url} alt={item.title} className="item-image" />
                      <div className="item-details">
                        <h4 className="item-title">{item.title}</h4>
                        <div className="item-info">
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">LE {item.price} each</span>
                        </div>
                      </div>
                      <div className="item-total">
                        LE {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>LE {total.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span className="free-shipping">FREE</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>LE {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="security-badge">
                  <Shield size={18} />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;