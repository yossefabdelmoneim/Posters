import React, { useState } from 'react';
import { useCart } from '../Context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, MapPin, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Checkout.css';

function Checkout() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showGovernoratePopup, setShowGovernoratePopup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    governorate: '',
    city: ''
  });

  const egyptGovernorates = [
    'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Port Said', 'Suez',
    'Dakahlia', 'Sharqia', 'Monufia', 'Gharbia', 'Beheira', 'Ismailia',
    'Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena',
    'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matrouh',
    'North Sinai', 'South Sinai', 'Damietta', 'Kafr El Sheikh'
  ].sort();

  const total = getCartTotal();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGovernorateSelect = (governorate) => {
    setFormData({ ...formData, governorate });
    setShowGovernoratePopup(false);
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

      const orderData = {
        items: cartItems.map(item => ({
          poster_id: item.id,
          quantity: item.quantity,
          price: item.price,
          style: item.style,
          size: item.size
        })),
        total,
        shipping_info: formData,
        payment_method: 'cash'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        clearCart();
        alert('Order placed successfully! You will pay cash on delivery.');
        navigate('/orders');
      } else {
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
        <div className="co-empty">
          <div className="co-empty-card">
            <Package size={64} />
            <h2>Your cart is empty</h2>
            <p>Add some posters before checking out</p>
            <button onClick={() => navigate('/shop')} className="co-btn co-btn-primary">
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
      <div className="co-page">
        <div className="co-container">
          <button onClick={() => navigate('/cart')} className="co-back-btn">
            <ArrowLeft size={20} />
            Back to Cart
          </button>

          <div className="co-layout">
            {/* Form Section */}
            <div className="co-form-wrapper">
              <h1>Checkout</h1>

              <form onSubmit={handleCheckout} className="co-form">
                <div className="co-section">
                  <h3>
                    <Truck size={20} />
                    Shipping Information
                  </h3>

                  <div className="co-row">
                    <div className="co-group">
                      <label>Full Name *</label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                    <div className="co-group">
                      <label>Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="co-row">
                    <div className="co-group">
                      <label>Mobile Number *</label>
                      <div className="co-input-icon">
                        <Phone size={18} className="co-icon" />
                        <input
                          type="tel"
                          name="mobile"
                          placeholder="01XXXXXXXXX"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="co-group">
                      <label>Governorate *</label>
                      <div
                        className="co-select"
                        onClick={() => setShowGovernoratePopup(true)}
                      >
                        <input
                          type="text"
                          name="governorate"
                          value={formData.governorate}
                          placeholder="Select Governorate"
                          readOnly
                          required
                        />
                        <MapPin size={18} className="co-select-icon" />
                      </div>
                    </div>
                  </div>

                  <div className="co-group">
                    <label>Address *</label>
                    <div className="co-input-icon">
                      <MapPin size={18} className="co-icon" />
                      <input
                        type="text"
                        name="address"
                        placeholder="Street address, building, apartment, etc."
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="co-group">
                    <label>City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                </div>

                <button
                  type="submit"
                  className="co-submit-btn"
                  disabled={loading || !formData.governorate}
                >
                  {loading ? (
                    <>
                      <div className="co-spinner"></div> Processing...
                    </>
                  ) : (
                    `Place Order - LE ${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="co-summary-wrapper">
              <div className="co-summary">
                <div className="co-summary-header">
                  <h3>Order Summary</h3>
                  <span className="co-items-badge">{cartItems.length} items</span>
                </div>

                <div className="co-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="co-item">
                      <img src={item.image_url} alt={item.title} className="co-item-img" />
                      <div className="co-item-info">
                        <h4 className="co-item-title">{item.title}</h4>
                        <div className="co-item-specs">
                          <span className="co-spec">{item.style}</span>
                          <span className="co-spec">{item.size}</span>
                        </div>
                        <div className="co-item-meta">
                          <span className="co-qty">Qty: {item.quantity}</span>
                          <span className="co-price">LE {item.price} each</span>
                        </div>
                      </div>
                      <div className="co-item-total">
                        LE {(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="co-totals">
                  <div className="co-total-row">
                    <span>Subtotal</span>
                    <span>LE {total.toFixed(2)}</span>
                  </div>
                  <div className="co-total-row">
                    <span>Shipping</span>
                    <span className="co-free">FREE</span>
                  </div>
                  <div className="co-total-row co-grand-total">
                    <span>Total</span>
                    <span>LE {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="co-delivery">
                  <div className="co-delivery-estimate">
                    <Truck size={18} />
                    Estimated delivery: 3-5 business days
                  </div>
                  <p className="co-shipping-note">Free standard shipping across Egypt</p>
                </div>

                <div className="co-payment-note">
                  <p>Cash on Delivery - Pay when you receive your order</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Governorate Popup */}
        {showGovernoratePopup && (
          <div className="co-overlay" onClick={() => setShowGovernoratePopup(false)}>
            <div className="co-popup" onClick={(e) => e.stopPropagation()}>
              <div className="co-popup-header">
                <h3>Select Governorate</h3>
                <button className="co-popup-close" onClick={() => setShowGovernoratePopup(false)}>
                  ×
                </button>
              </div>
              <div className="co-popup-body">
                <div className="co-search">
                  <input
                    type="text"
                    placeholder="Search governorate..."
                    className="co-search-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="co-list">
                  {egyptGovernorates.map((gov) => (
                    <button
                      key={gov}
                      className={`co-option ${formData.governorate === gov ? 'co-selected' : ''}`}
                      onClick={() => handleGovernorateSelect(gov)}
                    >
                      {gov}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Checkout;