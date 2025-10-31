// src/pages/Home.jsx
import React, {useState, useEffect} from "react";
import {
    Menu, User, ShoppingBag, X,
    Grid, Layers, Frame, Star, TrendingUp, Tag,
    Palette, UserCircle, Package, Heart, Settings,
    HelpCircle, Mail, MessageCircle, MapPin
} from "lucide-react";
import {useCart} from "../Context/CartContext";
import {useNavigate} from "react-router-dom";
import "./Home.css";
import Navbar from "../components/Navbar";

const Home = () => {
    const {addToCart, getCartItemsCount} = useCart();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use the correct backend URL
    const API_BASE_URL = 'http://localhost:5000/api';

    // Fetch products and categories on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching data from backend...');

                // Fetch posters from your backend
                const postersResponse = await fetch(`${API_BASE_URL}/posters`);
                if (!postersResponse.ok) {
                    throw new Error(`Failed to fetch posters: ${postersResponse.status}`);
                }
                const postersData = await postersResponse.json();
                console.log('Posters data received:', postersData);

                // Fetch categories from your backend
                const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
                let categoriesData = [];
                if (categoriesResponse.ok) {
                    categoriesData = await categoriesResponse.json();
                    console.log('Categories data received:', categoriesData);
                }

                // Filter out any custom poster that might be in the database (id 999)
                const filteredPosters = postersData.filter(poster => poster.id !== 999);

                // Transform poster data to match your component structure
                const transformedProducts = filteredPosters.map(poster => ({
                    id: poster.id,
                    title: poster.title,
                    description: poster.description || "No description available",
                    type: poster.category_name ? `${poster.category_name} • 30×40 cm` : 'Standard Frame • 30×40 cm',
                    price: parseFloat(poster.price) || 0,
                    isText: false, // All regular posters are image posters
                    image: poster.image_url || getFallbackImage(poster.id),
                    category_name: poster.category_name,
                    content: null,
                    originalData: poster
                }));

                // Add custom poster as a special product - ONLY ONE CUSTOM POSTER
                const customPoster = {
                    id: 999,
                    title: "Custom Poster - Upload Your Design",
                    description: "Upload your own image and create a custom poster. We'll print your design on high-quality poster paper.",
                    type: "Custom Design • Multiple Sizes",
                    price: 250.00,
                    isText: true, // This is explicitly a text poster for homepage display
                    image: null,
                    category_name: "Custom",
                    content: {
                        title: "UPLOAD",
                        subtitle: "YOUR",
                        title2: "DESIGN",
                        subtitle2: "HERE!"
                    },
                    originalData: {
                        id: 999,
                        title: "Custom Poster - Upload Your Design",
                        description: "Upload your own image and create a custom poster. We'll print your design on high-quality poster paper.",
                        price: 250.00,
                        image_url: null,
                        stock: 9999,
                        category_name: "Custom",
                        is_custom: true
                    }
                };

                // Add custom poster to the beginning of the products array
                transformedProducts.unshift(customPoster);

                console.log('Transformed products:', transformedProducts);
                setProducts(transformedProducts);
                setCategories(categoriesData);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper function for fallback images
    const getFallbackImage = (id) => {
        const images = [
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        ];
        return images[id % images.length];
    };

    // Menu functions
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleAddToCart = (product, e) => {
        e.stopPropagation(); // Prevent navigation when clicking add to cart

        // For custom poster, navigate to custom poster page instead of adding to cart directly
        if (product.id === 999) {
            navigate('/poster/999');
            return;
        }

        addToCart(product);
    };

    const handlePosterClick = (poster) => {
        // Navigate to product detail page
        navigate(`/poster/${poster.id}`);
    };

    // Get frame style class based on product - HOME SPECIFIC
    const getHomeFrameStyle = (product, index) => {
        const frameStyles = [
            'home-frame-modern-black',
            'home-frame-gallery',
            'home-frame-floating',
            'home-frame-minimal',
            'home-frame-luxury',
            'home-frame-text-poster',
            'home-frame-text-poster-2',
            'home-frame-text-poster-3'
        ];

        if (product.isText) {
            // For custom poster, use a specific style
            if (product.id === 999) {
                return 'home-frame-custom-poster';
            }
            return frameStyles[5 + (index % 3)]; // Use text poster frames
        }
        return frameStyles[index % 5]; // Use regular frames
    };

    return (
        <div className="home-page">
            <Navbar/>

            {/* Marquee */}
            <div className="home-marquee">
                <span>SHIPPING ALL OVER EGYPT • FREE SHIPPING ABOVE 2500 EGP • LIMITED EDITION DESIGNS AVAILABLE NOW</span>
            </div>

            {/* Hero Section */}
            <section
                className="home-hero-header"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/BackGroundImage.jpg")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >

            </section>

            {/* Products Section */}
            <section className="home-products home-section" id="products">
                <div className="home-container">
                    <h2 className="home-section-title">FEATURED POSTERS</h2>

                    {loading && (
                        <div className="home-loading" style={{textAlign: 'center', padding: '60px', fontSize: '18px'}}>
                            Loading products...
                        </div>
                    )}

                    {error && (
                        <div className="home-error" style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#dc3545',
                            background: '#ffeaea',
                            borderRadius: '8px',
                            margin: '20px 0'
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {!loading && !error && products.length === 0 && (
                        <div className="home-no-products" style={{textAlign: 'center', padding: '60px', color: '#666'}}>
                            <p style={{fontSize: '18px', marginBottom: '10px'}}>No posters found</p>
                        </div>
                    )}

                    {!loading && !error && products.length > 0 && (
                        <div className="home-product-grid">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="home-product-card"
                                    onClick={() => handlePosterClick(product)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <div className="home-product-frame">
                                        <div className={`home-frame-inner ${getHomeFrameStyle(product, index)}`}>
                                            {product.isText ? (
                                                <div className="home-poster-content">
                                                    <div className="home-poster-title">{product.content?.title}</div>
                                                    <div
                                                        className="home-poster-subtitle">{product.content?.subtitle}</div>
                                                    {product.content?.title2 && (
                                                        <>
                                                            <div
                                                                className="home-poster-title">{product.content.title2}</div>
                                                            <div
                                                                className="home-poster-subtitle">{product.content.subtitle2}</div>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    className="home-poster-image"
                                                    onError={(e) => {
                                                        e.target.src = getFallbackImage(product.id);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="home-product-info">
                                        <h3 className="home-product-title">{product.title}</h3>
                                        <p className="home-product-frame-type">{product.type}</p>
                                        <p className="home-product-price">LE {product.price.toFixed(2)}</p>
                                        <button
                                            className="home-add-to-cart-btn"
                                            onClick={(e) => handleAddToCart(product, e)}
                                        >
                                            {product.id === 999 ? 'Customize Now' : '+ Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Side Menu */}
            {isMenuOpen && (
                <>
                    <div className="home-menu-overlay" onClick={toggleMenu}></div>
                    <div className="home-side-menu">
                        <header style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px',
                            borderBottom: '2px solid #333'
                        }}>
                            <h2 style={{margin: 0, color: 'white'}}>MENU</h2>
                            <button
                                onClick={toggleMenu}
                                aria-label="Close Menu"
                                style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}
                            >
                                <X size={20}/>
                            </button>
                        </header>
                        <div className="home-menu-content">
                            {/* Categories Section */}
                            <div className="home-menu-section">
                                <h3><Grid size={18}/> Categories</h3>
                                <ul className="home-menu-list">
                                    <li><a href="#products"><Layers size={16}/> All Collections</a></li>
                                    {categories.map(category => (
                                        <li key={category.id}>
                                            <a href={`/category/${category.id}`}>
                                                <Frame size={16}/> {category.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Shop Section */}
                            <div className="home-menu-section">
                                <h3><ShoppingBag size={18}/> Shop</h3>
                                <ul className="home-menu-list">
                                    <li><a href="#products"><Star size={16}/> New Arrivals</a></li>
                                    <li><a href="#products"><TrendingUp size={16}/> Best Sellers</a></li>
                                    <li><a href="#products"><Tag size={16}/> On Sale</a></li>
                                    <li><a href="/poster/999"><Palette size={16}/> Custom Design</a></li>
                                </ul>
                            </div>

                            {/* Account Section */}
                            <div className="home-menu-section">
                                <h3><User size={18}/> Account</h3>
                                <ul className="home-menu-list">
                                    <li><a href="/profile"><UserCircle size={16}/> My Profile</a></li>
                                    <li><a href="/orders"><Package size={16}/> My Orders</a></li>
                                    <li><a href="/wishlist"><Heart size={16}/> Wishlist</a></li>
                                    <li><a href="/settings"><Settings size={16}/> Settings</a></li>
                                </ul>
                            </div>

                            {/* Help Section */}
                            <div className="home-menu-section">
                                <h3><HelpCircle size={18}/> Help</h3>
                                <ul className="home-menu-list">
                                    <li><a href="/contact"><Mail size={16}/> Contact Us</a></li>
                                    <li><a href="/faq"><MessageCircle size={16}/> FAQ</a></li>
                                    <li><a href="/track-order"><MapPin size={16}/> Track Order</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-content">
                    <div className="home-footer-section">
                        <h3>FLXR STUDIOS</h3>
                        <p>Expressing what words can't through bold, loud designs that make a statement in any
                            space.</p>
                    </div>
                </div>
                <div className="home-footer-bottom">
                    <p>&copy; {new Date().getFullYear()} FLXR STUDIOS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;