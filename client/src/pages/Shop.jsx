// src/pages/Shop.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import "./Shop.css";

const Shop = () => {
  const [posters, setPosters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchPosters();
    fetchCategories();
  }, []);

  const fetchPosters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posters");
      setPosters(res.data);
    } catch (err) {
      console.error("Error fetching posters:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const filteredPosters = selectedCategory === "all"
    ? posters
    : posters.filter(poster => poster.category_id === parseInt(selectedCategory));

  const handleAddToCart = (poster, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(poster);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading posters...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="shop-page">
        <div className="shop-header">
          <h1>Shop Posters</h1>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="posters-grid">
          {filteredPosters.map(poster => (
            <div key={poster.id} className="poster-card">
              <Link to={`/poster/${poster.id}`} className="poster-link">
                <img src={poster.image_url} alt={poster.title} />
                <div className="poster-info">
                  <h3>{poster.title}</h3>
                  <p className="price">${poster.price}</p>
                  {poster.category_name && (
                    <span className="category-tag">{poster.category_name}</span>
                  )}
                </div>
              </Link>
              <button
                onClick={(e) => handleAddToCart(poster, e)}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Shop;