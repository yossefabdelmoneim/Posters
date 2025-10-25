// src/components/Navbar.jsx - UPDATED
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
          PosterShop
        </Link>

        <div className={`nav-links ${isMenuOpen ? "nav-links-open" : ""}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)}>Shop</Link>

          {user ? (
            <>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              {user.role === "admin" && (
                <Link to="/admin" className="admin-link" onClick={() => setIsMenuOpen(false)}>
                  Admin Panel
                </Link>
              )}
              <div className="user-info">
                <User size={16} />
                <span>{user.username || user.email}</span>
                {user.role === "admin" && <span className="admin-badge">Admin</span>}
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" onClick={() => setIsMenuOpen(false)}>
            <ShoppingCart />
            {getCartCount() > 0 && <span className="badge">{getCartCount()}</span>}
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;