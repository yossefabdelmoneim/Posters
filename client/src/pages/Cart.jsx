// Cart.jsx
import React, {useState} from "react";
import {Minus, Plus, Trash2} from "lucide-react";
import {useCart} from "../Context/CartContext";
import "./Cart.css";
import {useNavigate, Link} from "react-router-dom";
import Navbar from "../components/Navbar";

const Cart = () => {
    const {cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart} = useCart();
    const [orderNote, setOrderNote] = useState("");

    const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    const SHIPPING_THRESHOLD = 2500;
    const SHIPPING_COST = 50;

    const subtotal = getCartTotal();
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    const navigate = useNavigate();

    const increaseQuantity = (itemId) => {
        const item = cartItems.find(item => item.id === itemId);
        if (item && item.quantity < 99) {
            updateQuantity(itemId, item.quantity + 1);
        }
    };

    const decreaseQuantity = (itemId) => {
        const item = cartItems.find(item => item.id === itemId);
        if (item && item.quantity > 1) {
            updateQuantity(itemId, item.quantity - 1);
        }
    };


    const handleRemoveItem = (itemId, itemName) => {
        setItemToRemove({ id: itemId, name: itemName });
        setShowRemoveModal(true);
    };


    const confirmRemoveItem = () => {
        if (itemToRemove) {
            removeFromCart(itemToRemove.id);
            setShowRemoveModal(false);
            setItemToRemove(null);
        }
    };


    const handleCheckout = () => {
        if (cartItems.length === 0) {
            setShowEmptyCartModal(true);
            return;
        }
        navigate("/checkout");
    };


    const handleClearCart = () => {
        if (cartItems.length === 0) return;

        setShowRemoveModal(true);
        setItemToRemove({ id: 'all', name: 'all items' });
    };


    const confirmClearCart = () => {
        clearCart();
        setShowRemoveModal(false);
        setItemToRemove(null);
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar/>
                <div className="cart-page">
                    <div className="empty-cart">
                        <h2>Your cart is empty</h2>
                        <p>Start shopping to add items to your cart</p>

                        <Link to="/shop" className="shop-btn">Start Shopping</Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="cart-page">
            <Navbar/>
            <div className="cart-header">
                <h1>Shopping Cart</h1>

                <button onClick={handleClearCart} className="clear-cart-btn">
                    Clear Cart
                </button>
            </div>

            <div className="cart-content">
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image_url || item.image} alt={item.title || item.name}/>

                            <div className="item-details">
                                <h3>{item.title || item.name}</h3>
                                <p className="item-price">LE {(item.price || 0).toFixed(2)}</p>
                                <p className="item-variant">
                                    {item.style && `Style: ${item.style}`}
                                    {item.size && ` | Size: ${item.size}`}
                                    {item.frameColor && ` | Frame: ${item.frameColor.replace('-frame', '')}`}
                                </p>
                                {item.isCustom && (
                                    <p className="item-variant" style={{color: '#ff8000', fontStyle: 'italic'}}>
                                        Custom Poster
                                    </p>
                                )}
                            </div>

                            <div className="quantity-controls">
                                <button
                                    onClick={() => decreaseQuantity(item.id)}
                                    className="quantity-btn"
                                >
                                    <Minus size={16}/>
                                </button>
                                <span className="quantity">{item.quantity}</span>
                                <button
                                    onClick={() => increaseQuantity(item.id)}
                                    className="quantity-btn"
                                >
                                    <Plus size={16}/>
                                </button>
                            </div>

                            <div className="item-total">
                                LE {((item.price || 0) * item.quantity).toFixed(2)}
                            </div>

                            <button
                                onClick={() => handleRemoveItem(item.id, item.title || item.name)}
                                className="remove-btn"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-line">
                        <span>Subtotal:</span>
                        <span>LE {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-line">
                        <span>Shipping:</span>
                        <span>{shipping === 0 ? 'FREE' : `LE ${shipping.toFixed(2)}`}</span>
                    </div>
                    {subtotal < SHIPPING_THRESHOLD && (
                        <div className="shipping-notice">
                            Add LE {(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for FREE shipping!
                        </div>
                    )}
                    <div className="summary-line total">
                        <span>Total:</span>
                        <span>LE {total.toFixed(2)}</span>
                    </div>

                    <div className="order-note">
                        <label>Order note (optional)</label>
                        <textarea
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder="Add a note to your order..."
                        />
                    </div>

                    <button onClick={handleCheckout} className="checkout-btn">
                        Proceed to Checkout
                    </button>


                    <Link to="/shop" className="continue-shopping">
                        Continue Shopping
                    </Link>
                </div>
            </div>


            {showEmptyCartModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Empty Cart</h3>
                            <button className="close-btn" onClick={() => setShowEmptyCartModal(false)}>
                                <Trash2 size={20}/>
                            </button>
                        </div>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '16px', color: '#333', marginBottom: '24px' }}>
                                Your cart is empty! Please add some items before proceeding to checkout.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowEmptyCartModal(false)}
                                >
                                    OK
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => navigate('/shop')}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {showRemoveModal && itemToRemove && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Confirm Removal</h3>
                            <button className="close-btn" onClick={() => setShowRemoveModal(false)}>
                                <Trash2 size={20}/>
                            </button>
                        </div>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '16px', color: '#333', marginBottom: '24px' }}>
                                {itemToRemove.id === 'all'
                                    ? 'Are you sure you want to remove all items from your cart?'
                                    : `Are you sure you want to remove "${itemToRemove.name}" from your cart?`
                                }
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowRemoveModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={itemToRemove.id === 'all' ? confirmClearCart : confirmRemoveItem}
                                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;