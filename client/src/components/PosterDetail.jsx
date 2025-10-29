import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import "./PosterDetail.css"

function PosterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoster();
  }, [id]);

  const fetchPoster = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posters/${id}`);
      if (!response.ok) throw new Error('Poster not found');
      const data = await response.json();
      setPoster(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (poster && poster.stock > 0) {
      addToCart({
        id: poster.id,
        title: poster.title,
        price: poster.price,
        image_url: poster.image_url,
        quantity: 1
      });
      alert('Added to cart!');
    } else {
      alert('This poster is out of stock!');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading poster...</p>
        </div>
      </>
    );
  }

  if (error || !poster) {
    return (
      <>
        <Navbar />
        <div className="error-container">
          <h2>Poster not found</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="poster-details-page">
        <div className="container_poster">
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="poster-details-grid">
            <div className="poster-image-section">
              <img
                src={poster.image_url}
                alt={poster.title}
                className="poster-image"
              />
            </div>

            <div className="poster-info-section">
              <h1>{poster.title}</h1>

              {poster.category_name && (
                <p className="category-badge">{poster.category_name}</p>
              )}

              <p className="poster-price">LE {poster.price}</p>

              <div className="stock-info">
                <Package size={16} />
                <span className={poster.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {poster.stock > 0 ? `${poster.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {poster.description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p>{poster.description}</p>
                </div>
              )}

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={poster.stock === 0}
                  className={`btn btn-primary ${poster.stock === 0 ? 'disabled' : ''}`}
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="btn btn-outline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PosterDetails;