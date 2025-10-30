import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Home, Package, ShoppingCart, Search} from "lucide-react";
import {useCart} from "../Context/CartContext";
import "./Shop.css";
import Navbar from "../components/Navbar";

function Shop() {
    const navigate = useNavigate();
    const {addToCart} = useCart();
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

        if (searchTerm) {
            filtered = filtered.filter(poster =>
                poster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                poster.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                poster.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(poster =>
                poster.category_id === parseInt(selectedCategory)
            );
        }

        setFilteredPosters(filtered);
    };

    const handleAddToCart = (poster) => {
        if (poster.stock > 0) {
            const cartItem = {
                id: poster.id,
                title: poster.title,
                price: parseFloat(poster.price),
                image_url: poster.image_url,
                quantity: 1
            };

            console.log('Adding to cart:', cartItem);

            try {
                addToCart(cartItem);
                // alert(`${poster.title} added to cart!`);
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Failed to add item to cart');
            }
        } else {
            alert('This poster is out of stock!');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar/>
                <div className="shop-page">
                    <div className="shop-loading">
                        <div className="shop-spinner"></div>
                        <p>Loading posters...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar/>
            <div className="shop-page">
                {/*<div className="shop-header">*/}
                {/*    <div className="shop-header-content">*/}
                {/*        <h1>Shop <span className="shop-title-accent">All Posters</span></h1>*/}
                {/*        <div className="shop-header-actions">*/}
                {/*            <button*/}
                {/*                className="shop-btn shop-btn-primary"*/}
                {/*                onClick={() => navigate('/')}*/}
                {/*            >*/}
                {/*                <Home size={16}/>*/}
                {/*                Home*/}
                {/*            </button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="shop-layout">
                    <div className="shop-sidebar">
                        <nav className="shop-nav">
                            <div className="shop-filters">
                                <h4 className="filters-title">Filters</h4>

                                <div className="filter-group">
                                    <label className="filter-label">Search</label>
                                    <div className="shop-search-container">
                                        <Search size={16}/>
                                        <input
                                            type="text"
                                            placeholder="Search posters..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="shop-search-input"
                                        />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="shop-category-select"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="shop-results-count">
                                    <span className="results-number">{filteredPosters.length}</span>
                                    <span className="results-text">posters found</span>
                                </div>
                            </div>
                        </nav>
                    </div>

                    <div className="shop-main">
                        <div className="shop-content">
                            <div className="shop-section-header">
                                <div className="shop-header-info">
                                    <h2>All Posters</h2>
                                    <p>Discover our complete collection</p>
                                </div>
                                <span className="shop-poster-count">{filteredPosters.length} posters</span>
                            </div>

                            {filteredPosters.length === 0 ? (
                                <div className="shop-empty-state">
                                    <Package size={64}/>
                                    <h3>No posters found</h3>
                                    <p>Try adjusting your search or filters</p>
                                    <button
                                        className="shop-btn shop-btn-primary"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedCategory("all");
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="shop-posters-grid">
                                    {filteredPosters.map(poster => (
                                        <div key={poster.id} className="shop-poster-card">
                                            <div className="shop-poster-image">
                                                <img
                                                    src={poster.image_url}
                                                    alt={poster.title}
                                                    className="shop-poster-img"
                                                />
                                                <div
                                                    className={`shop-stock-badge ${poster.stock === 0 ? 'shop-out-of-stock' : poster.stock < 5 ? 'shop-low-stock' : 'shop-in-stock'}`}>
                                                    {poster.stock === 0 ? 'Out of Stock' : poster.stock < 5 ? `Only ${poster.stock} left` : 'In Stock'}
                                                </div>
                                            </div>
                                            <div className="shop-poster-info">
                                                <h3 className="shop-poster-title">{poster.title}</h3>
                                                {poster.category_name && (
                                                    <p className="shop-poster-category">{poster.category_name}</p>
                                                )}
                                                <p className="shop-poster-price">LE {poster.price}</p>
                                                <div className="shop-poster-actions">
                                                    <button
                                                        className={`shop-btn shop-action-btn ${poster.stock === 0 ? 'shop-btn-disabled' : ''}`}
                                                        onClick={() => handleAddToCart(poster)}
                                                        disabled={poster.stock === 0}
                                                    >
                                                        <ShoppingCart size={16}/>
                                                        Add to Cart
                                                    </button>
                                                    <button
                                                        className="shop-btn shop-btn-outline"
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

export default Shop;