import React, {useState} from "react";
import {Minus, Plus, Trash2} from "lucide-react";
import {useCart} from "../Context/CartContext";
import "./Cart.css"; // Add this line to import the CSS
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";

const Cart = () => {
    const {cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart} = useCart();
    const [orderNote, setOrderNote] = useState("");

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
        if (window.confirm(`Remove "${itemName}" from your cart?`)) {
            removeFromCart(itemId);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        navigate("/checkout");
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar/>
                <div className="cart-page">
                    <div className="empty-cart">
                        <h2>Your cart is empty</h2>
                        <p>Start shopping to add items to your cart</p>
                        <a href="/" className="shop-btn">Start Shopping</a>
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
                <button onClick={clearCart} className="clear-cart-btn">
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
                                <p className="item-variant">{item.variant || "Standard"}</p>
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

                    <a href="/shop" className="continue-shopping">
                        Continue Shopping
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Cart;