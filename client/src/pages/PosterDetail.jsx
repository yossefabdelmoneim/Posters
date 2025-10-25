import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PosterDetail.css";

const PosterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poster, setPoster] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchPoster();
  }, [id]);

  const fetchPoster = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posters/${id}`);
      setPoster(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = () => {
    // Add to cart logic here
    alert(`Added ${quantity} ${poster.title} to cart`);
  };

  if (!poster) return <div className="loading">Loading...</div>;

  return (
    <div className="poster-detail-page">
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      <div className="poster-detail">
        <div className="poster-image">
          <img src={poster.image_url} alt={poster.title} />
        </div>

        <div className="poster-info">
          <h1>{poster.title}</h1>
          {poster.category_name && (
            <p className="category">{poster.category_name}</p>
          )}
          <p className="description">{poster.description}</p>
          <p className="price">${poster.price}</p>

          <div className="quantity-selector">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          <button onClick={addToCart} className="add-to-cart-btn">
            Add to Cart - ${(poster.price * quantity).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PosterDetail;