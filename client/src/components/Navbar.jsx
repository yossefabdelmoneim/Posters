import React, {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Search, UserRound, Menu, ShoppingBasket, LogOut, X, SearchX, Home} from "lucide-react";
import "./Navbar.css"
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import { useCart } from "../Context/CartContext";

function Navbar() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [user, setUser] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [allPosters, setAllPosters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const {getCartItemsCount } = useCart();
    const cartCount = getCartItemsCount();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Check if user is logged in on component mount
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Fetch all posters when search modal opens
    useEffect(() => {
        if (showSearchModal) {
            fetchAllPosters();
        }
    }, [showSearchModal]);

    // Fetch categories when sidebar opens
    useEffect(() => {
        if (showSidebar) {
            fetchCategories();
        }
    }, [showSidebar]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyboard = (event) => {
            if (event.key === "Escape") {
                if (showSearchModal) {
                    closeSearchModal();
                } else if (showSidebar) {
                    closeSidebar();
                }
            } else if (event.key === "Enter" && showSearchModal && searchResults.length > 0) {
                handlePosterClick(searchResults[0]);
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        return () => document.removeEventListener('keydown', handleKeyboard);
    }, [showSearchModal, showSidebar, searchResults]);

    const fetchAllPosters = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/posters');
            const data = await response.json();
            setAllPosters(data);
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

    const handleSuccessfulLogin = (userData) => {
        setUser(userData);
    };

    const openSearchModal = () => {
        setShowSearchModal(true);
        setSearchQuery("");
        setSearchResults([]);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    const openSidebar = () => {
        setShowSidebar(true);
    };

    const closeSidebar = () => {
        setShowSidebar(false);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }

        const matches = allPosters.filter(poster => {
            const titleMatch = poster.title.toLowerCase().includes(query.toLowerCase());
            const descriptionMatch = poster.description?.toLowerCase().includes(query.toLowerCase());
            const categoryMatch = poster.category_name?.toLowerCase().includes(query.toLowerCase());
            const priceMatch = poster.price.toString().includes(query);

            return titleMatch || descriptionMatch || categoryMatch || priceMatch;
        });

        setSearchResults(matches);
    };

    const handlePosterClick = (poster) => {
        closeSearchModal();
        navigate(`/poster/${poster.id}`);
    };

    const handleCategoryClick = (categoryId) => {
        closeSidebar();
        navigate(`/category/${categoryId}`);
    };

    const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowSidebar(false);
    // Force a complete page reload to reset all state
    window.location.href = '/';
    window.location.reload();
};

    const handleBackdropClick = (event) => {
        if (event.target.classList.contains('search-modal')) {
            closeSearchModal();
        }
    };

    const handleSidebarBackdropClick = (event) => {
        if (event.target.classList.contains('sidebar-backdrop')) {
            closeSidebar();
        }
    };

    return (
        <>
            <div className={`navbar-container ${scrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <header className="d-flex flex-wrap justify-content-center py-3 border-bottom">
                        <Link
                            to="/"
                            className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
                        >
                            <span className="fs-4 text">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                     strokeLinecap="round" strokeLinejoin="round"
                                     className="lucide lucide-frame" aria-hidden="true">
                                    <line x1="22" x2="2" y1="6" y2="6"></line>
                                    <line x1="22" x2="2" y1="18" y2="18"></line>
                                    <line x1="6" x2="6" y1="2" y2="22"></line>
                                    <line x1="18" x2="18" y1="2" y2="22"></line>
                                </svg>
                                FLXR <span className="studios rounded">studios</span>
                            </span>
                        </Link>

                        <ul className="nav nav-pills align-items-center">
                            {/* Search Button */}
                            <li className="nav-item">
                                <button
                                    className="nav-link btn"
                                    onClick={openSearchModal}
                                >
                                    <Search className="icon"/>
                                </button>
                            </li>

                            {/* User Icon */}
                            <li className="nav-item dropdown">
                                {user ? (
                                    <>
                                        <button
                                            className="nav-link btn dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <UserRound className="icon"/>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><span className="dropdown-item-text">Hello, {user.username}</span></li>
                                            <li>
                                                <hr className="dropdown-divider"/>
                                            </li>
                                            {user.role === 'admin' && (
                                                <li><Link to="/admin" className="dropdown-item">Admin Dashboard</Link></li>
                                            )}
                                            <li><Link to="/orders" className="dropdown-item">My Orders</Link></li>
                                            <li>
                                                <button className="dropdown-item text-danger" onClick={handleLogout}>
                                                    <LogOut size={16} className="me-2"/>
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </>
                                ) : (
                                    <button
                                        className="nav-link btn"
                                        onClick={() => setShowLogin(true)}
                                    >
                                        <UserRound className="icon"/>
                                    </button>
                                )}
                            </li>

                            {/* Cart Icon with Badge */}
                            <li className="nav-item">
                                <Link to="/cart" className="nav-link cart-icon-container">
                                    <ShoppingBasket className="icon"/>
                                    {cartCount > 0 && (
                                        <span className="cart-badge">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    )}
                                </Link>
                            </li>

                            {/* Menu Button */}
                            <li className="nav-item">
                                <button
                                    className="nav-link btn"
                                    onClick={openSidebar}
                                >
                                    <Menu className="icon"/>
                                </button>
                            </li>
                        </ul>
                    </header>
                </div>
            </div>

            {/* Rest of your Navbar component (sidebar, search modal, auth modals) remains the same */}
            {showSidebar && (
                <>
                    <div
                        className="sidebar-backdrop"
                        onClick={handleSidebarBackdropClick}
                    />
                    <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
                        <div className="sidebar-header">
                            <h3>Menu</h3>
                            <button
                                className="close-sidebar"
                                onClick={closeSidebar}
                            >
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="sidebar-content">
                            {/* Profile Section */}
                            <div className="sidebar-section">
                                <h4>Profile</h4>
                                {user ? (
                                    <Link
                                        to="/profile"
                                        className="profile-link"
                                        onClick={closeSidebar}
                                    >
                                        <UserRound size={18}/>
                                        View Profile
                                    </Link>
                                ) : (
                                    <button
                                        className="profile-link"
                                        onClick={() => {
                                            closeSidebar();
                                            setShowLogin(true);
                                        }}
                                    >
                                        <UserRound size={18}/>
                                        Login / Register
                                    </button>
                                )}
                            </div>

                            {/* Categories Section */}
                            <div className="sidebar-section">
                                <h4>Categories</h4>
                                <ul className="categories-list">
                                    {categories.map(category => (
                                        <li key={category.id}>
                                            <button
                                                className="category-item"
                                                onClick={() => handleCategoryClick(category.id)}
                                            >
                                                {category.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Quick Links */}
                            <div className="sidebar-section">
                                <h4>Quick Links</h4>
                                <ul className="categories-list">
                                    <li>
                                        <Link
                                            to="/"
                                            className="category-item"
                                            onClick={closeSidebar}
                                        >
                                            <Home size={16} style={{marginRight: '12px'}}/>
                                            Home
                                        </Link>
                                    </li>
                                    {user && (
                                        <>
                                            <li>
                                                <Link
                                                    to="/orders"
                                                    className="category-item"
                                                    onClick={closeSidebar}
                                                >
                                                    My Orders
                                                </Link>
                                            </li>
                                            {user.role === 'admin' && (
                                                <li>
                                                    <Link
                                                        to="/admin"
                                                        className="category-item"
                                                        onClick={closeSidebar}
                                                    >
                                                        Admin Dashboard
                                                    </Link>
                                                </li>
                                            )}
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Search Modal */}
            {showSearchModal && (
                <div
                    className="search-modal"
                    onClick={handleBackdropClick}
                >
                    <div className="search-modal-content">
                        <div className="search-header">
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <Search style={{
                                    position: 'absolute',
                                    left: '16px',
                                    color: '#666',
                                    width: '20px',
                                    height: '20px',
                                    zIndex: 1
                                }}/>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search posters by title, category, or price..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoFocus
                                />
                                <button
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onClick={closeSearchModal}
                                >
                                    <X size={20}/>
                                </button>
                            </div>
                        </div>

                        <div className="search-body">
                            <div style={{
                                padding: '16px 0',
                                color: '#666',
                                fontSize: '14px',
                                borderBottom: '1px solid #f5f5f5',
                                marginBottom: '16px'
                            }}>
                                {searchQuery === "" ? "Type to search through our collection" :
                                    `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
                            </div>

                            <div>
                                {searchQuery === "" ? (
                                    <div className="search-hint">
                                        <div style={{
                                            background: '#f8f9fa',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '12px',
                                            padding: '30px',
                                            textAlign: 'center'
                                        }}>
                                            <h3>💡 Search Tips</h3>
                                            <p>
                                                Try searching for: "urban", "desert", "neon", "cairo"<br/>
                                                Press Enter to select the first result • Press Escape to close
                                            </p>
                                        </div>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '60px 20px',
                                        color: '#666'
                                    }}>
                                        <SearchX size={48}/>
                                        <p style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '16px',
                                            color: '#666'
                                        }}>No posters found matching "{searchQuery}"</p>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#999'
                                        }}>
                                            Try different keywords or browse our categories
                                        </p>
                                    </div>
                                ) : (
                                    <div className="results-grid">
                                        {searchResults.map(poster => (
                                            <button
                                                key={poster.id}
                                                className="poster-result"
                                                onClick={() => handlePosterClick(poster)}
                                            >
                                                <img
                                                    src={poster.image_url}
                                                    alt={poster.title}
                                                    style={{
                                                        width: '60px',
                                                        height: '80px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e5e5e5'
                                                    }}
                                                />
                                                <div style={{flex: 1}}>
                                                    <h4>{poster.title}</h4>
                                                    <p>{poster.category_name}</p>
                                                    <p style={{
                                                        margin: 0,
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#e67300'
                                                    }}>LE {poster.price}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Modals */}
            <LoginModal
                show={showLogin}
                onHide={() => setShowLogin(false)}
                onRegisterClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                }}
                onSuccess={handleSuccessfulLogin}
            />
            <RegisterModal
                show={showRegister}
                onHide={() => setShowRegister(false)}
                onLoginClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                }}
                onSuccess={handleSuccessfulLogin}
            />
        </>
    );
}

export default Navbar;