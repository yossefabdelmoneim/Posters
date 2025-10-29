import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Package, ShoppingCart, Search } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../Context/CartContext";
import "./Shop.css"

function ShopPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [posters, setPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchAllPosters();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterPosters();
  }, [posters, searchTerm, selectedCategory]);

  const fetchAllPosters = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/posters');
      const data = await response.json();
      setPosters(data);
      setFilteredPosters(data);
    } catch (err) {
      console.error('Failed to fetch posters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const filterPosters = () => {
    let filtered = posters;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(poster =>
        poster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poster.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poster.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(poster =>
        poster.category_id === parseInt(selectedCategory)
      );
    }

    setFilteredPosters(filtered);
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

  const handleAddToCart = (poster) => {
    if (poster.stock > 0) {
      addToCart({
        id: poster.id,
        title: poster.title,
        price: poster.price,
        image_url: poster.image_url,
        quantity: 1
      });
      alert(`${poster.title} added to cart!`);
    } else {
      alert('This poster is out of stock!');
    }
  };

  if (loading) {
    return (
      <>
        <div className="shop-dashboard">
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
      <div className="shop-dashboard">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>Shop <span className="studios">All Posters</span></h1>
            <div className="admin-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                <Home size={16}/>
                Home
              </button>
            </div>
          </div>
        </div>

        <div className="admin-container">
          <div className="admin-sidebar">
            <nav className="admin-nav">
              <div className="filters-section">
                <h4>Filters</h4>

                {/* Search Filter */}
                <div className="filter-group">
                  <label>Search</label>
                  <div className="search-input-container">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search posters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Results Count */}
                <div className="results-count">
                  <span className="count">{filteredPosters.length}</span>
                  <span>posters found</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="admin-main">
            <div className="tab-content">
              <div className="section-header">
                <div className="header-info">
                  <h2>All Posters</h2>
                  <p>Discover our complete collection</p>
                </div>
                <span className="category-count">{filteredPosters.length} posters</span>
              </div>

              {filteredPosters.length === 0 ? (
                <div className="empty-state">
                  <Package size={64} />
                  <h3>No posters found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="posters-grid">
                  {filteredPosters.map(poster => (
                    <div key={poster.id} className="poster-card">
                      <div className="poster-image">
                        <img
                          src={poster.image_url}
                          alt={poster.title}
                        />
                        <div className={`stock-badge ${getStockBadge(poster.stock)}`}>
                          {getStockText(poster.stock)}
                        </div>
                      </div>
                      <div className="poster-info">
                        <h3>{poster.title}</h3>
                        {poster.category_name && (
                          <p className="poster-category">{poster.category_name}</p>
                        )}
                        <p className="poster-price">LE {poster.price}</p>
                        <div className="poster-actions">
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

export default ShopPage;