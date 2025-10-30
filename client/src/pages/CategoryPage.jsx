import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, ArrowLeft, ShoppingCart } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../Context/CartContext"; // Make sure this path is correct
import "./CategoryPage.css";

function CategoryPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // Get addToCart function from context
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (location.state?.categoryName) {
      setCategoryName(location.state.categoryName);
    }
    fetchPostersByCategory();
  }, [categoryId]);

  const fetchPostersByCategory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posters/category/${categoryId}`);
      const data = await response.json();
      setPosters(data);

      if (!categoryName && data.length > 0 && data[0].category_name) {
        setCategoryName(data[0].category_name);
      }
    } catch (err) {
      console.error('Failed to fetch posters:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return "out-of-stock";
    if (stock < 5) return "low-stock";
    return "in-stock";
  };

  const getStockText = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 5) return `Only ${stock} left`;
    return "In Stock";
  };

  // Add to cart function
  const handleAddToCart = (poster) => {
    if (poster.stock > 0) {
      addToCart({
        id: poster.id,
        title: poster.title,
        price: poster.price,
        image_url: poster.image_url,
        quantity: 1
      });
      // Optional: Show feedback to user
      // alert(`${poster.title} added to cart!`);
    } else {
      // alert('This poster is out of stock!');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="category-dashboard">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading posters...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="category-dashboard">

        <div className="admin-container">
          <div className="admin-sidebar">
            <nav className="admin-nav">
              <button className="nav-item1 active">
                <Package size={20}/>
                {categoryName || `Category ${categoryId}`}
              </button>

              <div style={{ marginTop: 'auto', padding: '20px 0' }}>
                <button
                  className="nav-item1"
                  onClick={() => navigate('/')}
                >
                  <Home size={20}/>
                  All Categories
                </button>
              </div>
            </nav>
          </div>

          <div className="admin-main">
            <div className="tab-content">
              <div className="section-header">
                <div className="header-info">
                  <h2>{categoryName || `Category ${categoryId}`}</h2>
                  <p>Explore posters in this category</p>
                </div>
                <span className="category-count">{posters.length} posters</span>
              </div>

              {posters.length === 0 ? (
                <div className="empty-state">
                  <Package size={64} />
                  <h3>No posters found in this category</h3>
                  <p>There are currently no posters available in this category.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    Browse All Posters
                  </button>
                </div>
              ) : (
                <div className="posters-grid1">
                  {posters.map(poster => (
                    <div key={poster.id} className="poster-card1">
                      <div className="poster-image-category">
                        <img
                          src={poster.image_url}
                          alt={poster.title}
                        />
                        <div className={`stock-badge1 ${getStockBadge(poster.stock)}`}>
                          {getStockText(poster.stock)}
                        </div>
                      </div>
                      <div className="poster-info">
                        <h3>{poster.title}</h3>
                        <p className="poster-price">LE {poster.price}</p>
                        <div className="poster-actions1">
                          <button
                            className={`btn btn-primary btn-sm ${poster.stock === 0 ? 'disabled' : ''}`}
                            onClick={() => handleAddToCart(poster)}
                            disabled={poster.stock === 0}
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate(`/poster/${poster.id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategoryPage;