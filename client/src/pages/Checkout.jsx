import React, { useState, useEffect } from "react";
import { ArrowLeft, Frame } from "lucide-react";
import './Checkout.css';

const Checkout = () => {
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        governorate: "",
        postalCode: "",
        notes: "",
        payment: "cod"
    });
    const [errors, setErrors] = useState({});

    const API_BASE_URL = 'http://localhost:3000/api';
    const SHIPPING_THRESHOLD = 2500;
    const SHIPPING_COST = 50;

    // Fetch cart items from localStorage or context
    useEffect(() => {
        const fetchCartItems = () => {
            try {
                // Try to get cart from localStorage first
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    const cartData = JSON.parse(savedCart);
                    setCartItems(cartData);
                } else {
                    // Fallback to sample data
                    setCartItems([
                        {
                            id: 1,
                            name: 'URBAN LEGENDS',
                            title: 'URBAN LEGENDS',
                            price: 245,
                            quantity: 1,
                            variant: 'Black Frame / 20*30 cm',
                            image: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=400&h=500&fit=crop',
                            image_url: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=400&h=500&fit=crop'
                        },
                        {
                            id: 2,
                            name: 'DESERT VIBES',
                            title: 'DESERT VIBES',
                            price: 280,
                            quantity: 2,
                            variant: 'White Frame / 30*40 cm',
                            image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=500&fit=crop',
                            image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=500&fit=crop'
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                setCartItems([]);
            }
        };

        fetchCartItems();
    }, []);

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    // Validation functions
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone) => phone.replace(/\D/g, '').length >= 10;

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "email":
                if (!value.trim()) {
                    error = "Email is required";
                } else if (!isValidEmail(value)) {
                    error = "Please enter a valid email address";
                }
                break;
            case "phone":
                if (!value.trim()) {
                    error = "Phone number is required";
                } else if (!isValidPhone(value)) {
                    error = "Please enter a valid phone number";
                }
                break;
            case "firstName":
            case "lastName":
            case "address":
            case "city":
                if (!value.trim()) error = "This field is required";
                break;
            case "governorate":
                if (!value) error = "Please select a governorate";
                break;
            default:
                break;
        }

        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        Object.keys(formData).forEach(key => {
            if (key !== "postalCode" && key !== "notes") {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstErrorField = document.querySelector('.input-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items to your cart before checking out.");
            return;
        }

        setLoading(true);

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                alert("Please log in to complete your order");
                window.location.href = '/login';
                return;
            }

            // Prepare order data for API
            const orderData = {
                shipping_address: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    governorate: formData.governorate,
                    postal_code: formData.postalCode,
                    notes: formData.notes
                },
                payment_method: formData.payment,
                items: cartItems.map(item => ({
                    poster_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                subtotal: subtotal,
                shipping_cost: shipping,
                total: total
            };

            console.log('Sending order data:', orderData);

            // Send order to backend
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }

            const orderResponse = await response.json();

            // Set order number from response
            setOrderNumber(orderResponse.order_number || `FLXR-${Date.now().toString().slice(-8)}`);
            setShowSuccessModal(true);

            // Clear cart after successful order
            localStorage.removeItem('cart');
            setCartItems([]);

        } catch (err) {
            console.error("Checkout error:", err);
            alert(err.message || "Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const selectPayment = (method) => {
        setFormData(prev => ({
            ...prev,
            payment: method
        }));
    };

    const closeModal = () => {
        setShowSuccessModal(false);
        // Reset form after successful order
        setFormData({
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            address: "",
            city: "",
            governorate: "",
            postalCode: "",
            notes: "",
            payment: "cod"
        });
        // Redirect to home
        window.location.href = '/';
    };

    return (
        <div className="checkout-page">
            {/* Marquee Banner */}
            <div className="marquee">
                <span>SHIPPING ALL OVER EGYPT • FREE SHIPPING ABOVE 2500 EGP • LIMITED EDITION DESIGNS AVAILABLE NOW</span>
            </div>

            {/* Main Header */}
            <div className="main-header">
                <div className="header-content">
                    <a href="/" className="logo">
                        <Frame size={24} />
                        FLXR<span>Studio</span>
                    </a>
                    <a href="/" className="back-to-cart">
                        <ArrowLeft size={16} />
                        Back to Home
                    </a>
                </div>
            </div>

            <div className="checkout-container">
                {/* Checkout Form */}
                <div className="checkout-form">
                    <h1 className="page-title">Checkout</h1>

                    <form onSubmit={handleSubmit}>
                        {/* Contact Information */}
                        <div className="section">
                            <div className="section-title">Contact Information</div>
                            <div className="form-group">
                                <label>Email Address <span className="required">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="you@example.com"
                                    className={errors.email ? "input-error" : ""}
                                    required
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label>Phone Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="+20 123 456 7890"
                                    className={errors.phone ? "input-error" : ""}
                                    required
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="section">
                            <div className="section-title">Shipping Address</div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={errors.firstName ? "input-error" : ""}
                                        required
                                    />
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Last Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={errors.lastName ? "input-error" : ""}
                                        required
                                    />
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Street Address <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    placeholder="Street address, building number, floor"
                                    className={errors.address ? "input-error" : ""}
                                    required
                                />
                                {errors.address && <span className="error-message">{errors.address}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={errors.city ? "input-error" : ""}
                                        required
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Governorate <span className="required">*</span></label>
                                    <select
                                        name="governorate"
                                        value={formData.governorate}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className={errors.governorate ? "input-error" : ""}
                                        required
                                    >
                                        <option value="">Select Governorate</option>
                                        <option value="Cairo">Cairo</option>
                                        <option value="Giza">Giza</option>
                                        <option value="Alexandria">Alexandria</option>
                                        <option value="Qalyubia">Qalyubia</option>
                                        <option value="Sharqia">Sharqia</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.governorate && <span className="error-message">{errors.governorate}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Postal Code (Optional)</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    placeholder="12345"
                                />
                            </div>

                            <div className="form-group">
                                <label>Additional Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Special delivery instructions, apartment details, etc."
                                />
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="section">
                            <div className="section-title">Payment Method</div>
                            <div className="payment-methods">
                                <label className={`payment-option ${formData.payment === 'cod' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={formData.payment === 'cod'}
                                        onChange={() => selectPayment('cod')}
                                    />
                                    <span className="payment-icon">💵</span>
                                    <div className="payment-info">
                                        <h4>Cash on Delivery</h4>
                                        <p>Pay with cash when you receive your order</p>
                                    </div>
                                </label>
                                <label className={`payment-option ${formData.payment === 'card' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={formData.payment === 'card'}
                                        onChange={() => selectPayment('card')}
                                    />
                                    <span className="payment-icon">💳</span>
                                    <div className="payment-info">
                                        <h4>Credit / Debit Card</h4>
                                        <p>Visa, Mastercard, American Express</p>
                                    </div>
                                </label>
                                <label className={`payment-option ${formData.payment === 'instapay' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="instapay"
                                        checked={formData.payment === 'instapay'}
                                        onChange={() => selectPayment('instapay')}
                                    />
                                    <span className="payment-icon">📱</span>
                                    <div className="payment-info">
                                        <h4>InstaPay</h4>
                                        <p>Instant mobile payment transfer</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="place-order-btn mobile-only"
                            disabled={loading || cartItems.length === 0}
                        >
                            {loading ? "Processing..." : `Complete Order - LE ${total.toFixed(2)}`}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                    <div className="order-summary-title">Order Summary</div>

                    {cartItems.length === 0 ? (
                        <div className="empty-cart-message">
                            <p>Your cart is empty</p>
                            <a href="/" className="btn btn-primary">Continue Shopping</a>
                        </div>
                    ) : (
                        <>
                            {subtotal < SHIPPING_THRESHOLD && subtotal > 0 && (
                                <div className="shipping-notice">
                                    <span>✓</span>
                                    <span><strong>FREE SHIPPING</strong> on orders over LE 2,500.00</span>
                                </div>
                            )}

                            <div className="order-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <img
                                            src={item.image_url || item.image}
                                            alt={item.title || item.name}
                                            className="summary-item-image"
                                        />
                                        <div className="summary-item-info">
                                            <h4>{item.title || item.name}</h4>
                                            <p>{item.variant || "Standard"}</p>
                                            <p className="summary-item-price">{item.quantity} × LE {item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>LE {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'FREE' : `LE ${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span className="amount">LE {total.toFixed(2)} EGP</span>
                                </div>
                            </div>

                            <button
                                className="place-order-btn"
                                onClick={handleSubmit}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? "Processing..." : `Complete Order - LE ${total.toFixed(2)}`}
                            </button>

                            <div className="security-badges">
                                <div className="security-badge">
                                    <span>🔒</span>
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="security-badge">
                                    <span>✓</span>
                                    <span>Money Back Guarantee</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="success-icon">✓</div>
                        <h2>Order Confirmed!</h2>
                        <p>Thank you for your purchase. A confirmation email has been sent to:</p>
                        <p><strong>{formData.email}</strong></p>
                        <div className="order-number">
                            Order Number
                            <strong>{orderNumber}</strong>
                        </div>
                        <p>We'll notify you when your order ships.</p>
                        <button className="modal-btn" onClick={closeModal}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;