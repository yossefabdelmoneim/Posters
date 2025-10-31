import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, Minus, Plus, Upload, Image, X } from "lucide-react";
import Navbar from "./Navbar";
import { useCart } from "../Context/CartContext";
import "./PosterDetail.css";

function PosterDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [poster, setPoster] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStyle, setSelectedStyle] = useState("Black Frame");
    const [selectedSize, setSelectedSize] = useState("20*30 cm");
    const [quantity, setQuantity] = useState(1);
    const [recommendedPosters, setRecommendedPosters] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(false);

    // ✅ ADDED: State for frame color
    const [frameClass, setFrameClass] = useState("black-frame");

    // ✅ ADDED: State for custom poster upload
    const [customImage, setCustomImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const isCustomPoster = id === "999";

    // Style options
    const styleOptions = [
        "Black Frame",
        "White Frame",
        "Tableau Wooden NDF",
        "350 gsm Coated Paper"
    ];

    // Size options
    const sizeOptions = [
        "20*30 cm",
        "30*40 cm",
        "40*50 cm",
        "50*60 cm",
        "50*70 cm"
    ];

    // ✅ ADDED: Function to map style to frame class
    const getFrameClassFromStyle = (style) => {
        switch(style) {
            case "Black Frame":
                return "black-frame";
            case "White Frame":
                return "white-frame";
            case "Tableau Wooden NDF":
                return "wood-frame";
            case "350 gsm Coated Paper":
                return "paper-frame";
            default:
                return "black-frame";
        }
    };

    // ✅ ADDED: Function to handle style selection
    const handleStyleSelect = (style) => {
        setSelectedStyle(style);
        setFrameClass(getFrameClassFromStyle(style));
    };

    // ✅ ADDED: Custom poster image upload functions
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setUploadError(null);

        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size must be less than 5MB');
            return;
        }

        setCustomImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const removeCustomImage = () => {
        setCustomImage(null);
        setImagePreview(null);
        setUploadError(null);
        // Reset file input
        const fileInput = document.getElementById('custom-image-upload');
        if (fileInput) fileInput.value = '';
    };

    // Helper function to ensure price is a number
    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            const numericValue = parseFloat(price.replace(/[^\d.]/g, ''));
            return isNaN(numericValue) ? 0 : numericValue;
        }
        return 0;
    };

    useEffect(() => {
        if (!isCustomPoster) {
            fetchPoster();
        } else {
            setPoster({
                id: 999,
                title: "Custom Poster - Upload Your Design",
                description: "Upload your own image and create a custom poster. We'll print your design on high-quality poster paper.",
                price: 25.00,
                originalPrice: 35.00,
                image_url: "/images/custom-poster-placeholder.jpg",
                stock: 9999,
                category_name: "Custom"
            });
            setLoading(false);
        }
    }, [id, isCustomPoster]);

    useEffect(() => {
        if (poster && !isCustomPoster) {
            fetchRecommendedPosters();
        } else if (isCustomPoster) {
            fetchRandomPosters();
        }
    }, [poster, isCustomPoster]);

    const fetchPoster = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/posters/${id}`);
            if (!response.ok) throw new Error('Poster not found');
            const data = await response.json();

            // Ensure price is a number
            const price = parsePrice(data.price);
            const originalPrice = price * 1.5;

            const posterWithPrice = {
                ...data,
                price: price,
                originalPrice: originalPrice
            };
            setPoster(posterWithPrice);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendedPosters = async () => {
        setLoadingRecommended(true);
        try {
            let url = 'http://localhost:5000/api/posters';

            if (poster.category_id) {
                url = `http://localhost:5000/api/posters/category/${poster.category_id}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                let data = await response.json();

                // Ensure prices are numbers in recommended posters too
                data = data.map(poster => ({
                    ...poster,
                    price: parsePrice(poster.price)
                }));

                data = data.filter(p => p.id !== poster.id);

                if (data.length < 4 && poster.category_id) {
                    const additionalResponse = await fetch('http://localhost:5000/api/posters');
                    if (additionalResponse.ok) {
                        const additionalData = await additionalResponse.json();
                        const additionalPosters = additionalData
                            .filter(p => p.id !== poster.id && !data.some(dp => dp.id === p.id))
                            .slice(0, 4 - data.length);

                        const additionalPostersWithNumericPrices = additionalPosters.map(poster => ({
                            ...poster,
                            price: parsePrice(poster.price)
                        }));

                        data = [...data, ...additionalPostersWithNumericPrices];
                    }
                }

                setRecommendedPosters(data.slice(0, 4));
            }
        } catch (err) {
            console.error('Failed to fetch recommended posters:', err);
            fetchRandomPosters();
        } finally {
            setLoadingRecommended(false);
        }
    };

    const fetchRandomPosters = async () => {
        setLoadingRecommended(true);
        try {
            const response = await fetch('http://localhost:5000/api/posters');
            if (response.ok) {
                let data = await response.json();

                // Ensure prices are numbers
                data = data.map(poster => ({
                    ...poster,
                    price: parsePrice(poster.price)
                }));

                data = data.filter(p => p.id !== (poster?.id || id));
                const shuffled = [...data].sort(() => 0.5 - Math.random());
                setRecommendedPosters(shuffled.slice(0, 4));
            }
        } catch (err) {
            console.error('Failed to fetch random posters:', err);
        } finally {
            setLoadingRecommended(false);
        }
    };

    // ✅ UPDATED: Handle both regular and custom posters
    const handleAddToCart = () => {
        if (isCustomPoster) {
            // For custom poster, require image upload
            if (!customImage) {
                setUploadError('Please upload your design first');
                return;
            }

            const cartItem = {
                id: `custom-${Date.now()}`,
                title: "Custom Poster - Your Design",
                price: poster.price,
                image_url: imagePreview,
                quantity: quantity,
                style: selectedStyle,
                size: selectedSize,
                frameColor: frameClass,
                customImage: customImage,
                isCustom: true
            };

            addToCart(cartItem);
            alert('Custom poster added to cart! We will print your design.');
        } else {
            // Regular poster
            if (poster && poster.stock > 0) {
                const cartItem = {
                    id: poster.id,
                    title: poster.title,
                    price: poster.price,
                    image_url: poster.image_url,
                    quantity: quantity,
                    style: selectedStyle,
                    size: selectedSize,
                    frameColor: frameClass
                };

                addToCart(cartItem);
                alert('Added to cart!');
            } else {
                alert('This poster is out of stock!');
            }
        }
    };

    const handleRecommendedPosterClick = (posterId) => {
        navigate(`/poster/${posterId}`);
        window.scrollTo(0, 0);
    };

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prev => prev > 1 ? prev - 1 : 1);
    };

    // Safe price display function
    const displayPrice = (price) => {
        const numericPrice = parsePrice(price);
        return `LE ${numericPrice.toFixed(2)}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="poster-details-loading-container">
                    <div className="poster-details-spinner"></div>
                    <p>Loading poster...</p>
                </div>
            </>
        );
    }

    if (error || !poster) {
        return (
            <>
                <Navbar />
                <div className="poster-details-error-container">
                    <h2>Poster not found</h2>
                    <button onClick={() => navigate('/')} className="poster-details-btn poster-details-btn-primary">
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
                <div className="poster-details-container">
                    <button
                        onClick={() => navigate(-1)}
                        className="poster-details-back-btn"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>

                    <div className="poster-details-layout">
                        {/* ✅ UPDATED: Conditional rendering for custom vs regular poster */}
                        <div className="poster-details-image-container">
                            {isCustomPoster ? (
                                <div className="poster-details-custom-upload">
                                    {imagePreview ? (
                                        <div className="poster-details-custom-preview">
                                            <img
                                                src={imagePreview}
                                                alt="Your custom design"
                                                className="poster-details-preview-image"
                                            />
                                            <button
                                                onClick={removeCustomImage}
                                                className="poster-details-remove-image-btn"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="poster-details-upload-placeholder">
                                            <Image size={48} />
                                            <h3>Upload Your Design</h3>
                                            <p>Click to select an image file</p>
                                            <span>JPEG, PNG, GIF, WebP • Max 5MB</span>
                                        </div>
                                    )}
                                    <input
                                        id="custom-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="poster-details-file-input"
                                    />
                                    {uploadError && (
                                        <div className="poster-details-upload-error">
                                            {uploadError}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={`poster-details-frame ${frameClass}`}>
                                    <img
                                        src={poster.image_url}
                                        alt={poster.title}
                                        className="poster-details-image-with-frame"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="poster-details-product-details">
                            <h1 className="poster-details-title">{poster.title}</h1>

                            {!isCustomPoster && poster.category_name && (
                                <p className="poster-details-category-badge">{poster.category_name}</p>
                            )}

                            <div className="poster-details-price-section">
                                <span className="poster-details-current-price">{displayPrice(poster.price)}</span>
                                {poster.originalPrice && (
                                    <span className="poster-details-original-price">{displayPrice(poster.originalPrice)}</span>
                                )}
                            </div>

                            <div className="poster-details-description-section">
                                <p>{poster.description}</p>
                                {!isCustomPoster && (
                                    <p className="poster-details-description-note">
                                        Our designs are available in black or white frames, Tableau Wooden NDF, or as premium 350 gsm coated paper prints.
                                        Each option is crafted to match different styles – from sleek modern finishes to artistic textures – and offered
                                        in five versatile sizes ranging from 20-30 cm to 50-70 cm. Every piece is carefully packaged and securely shipped
                                        to ensure it arrives in perfect condition, ready to elevate your space.
                                    </p>
                                )}
                            </div>

                            {isCustomPoster && (
                                <div className="poster-details-custom-features">
                                    <h3>Custom Poster Features</h3>
                                    <ul>
                                        <li>✓ High-quality poster printing</li>
                                        <li>✓ Multiple sizes available</li>
                                        <li>✓ Premium paper material</li>
                                        <li>✓ Fast processing and shipping</li>
                                    </ul>
                                </div>
                            )}

                            {/* Style Options */}
                            <div className="poster-details-option-section">
                                <h3>Style Option?</h3>
                                <div className="poster-details-options-grid">
                                    {styleOptions.map(style => (
                                        <button
                                            key={style}
                                            className={`poster-details-style-option ${selectedStyle === style ? 'active' : ''}`}
                                            onClick={() => handleStyleSelect(style)}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Options */}
                            <div className="poster-details-option-section">
                                <h3>Size</h3>
                                <div className="poster-details-options-grid">
                                    {sizeOptions.map(size => (
                                        <button
                                            key={size}
                                            className={`poster-details-size-option ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="poster-details-quantity-section">
                                <h3>Quantity</h3>
                                <div className="poster-details-quantity-selector">
                                    <button
                                        className="poster-details-quantity-btn"
                                        onClick={decreaseQuantity}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="poster-details-quantity-display">{quantity}</span>
                                    <button
                                        className="poster-details-quantity-btn"
                                        onClick={increaseQuantity}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="poster-details-action-buttons">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!isCustomPoster && poster.stock === 0}
                                    className={`poster-details-btn poster-details-btn-primary ${(!isCustomPoster && poster.stock === 0) ? 'disabled' : ''}`}
                                >
                                    <ShoppingCart size={20} />
                                    {isCustomPoster ? 'Add Custom Poster to Cart' : 'Add to Cart'}
                                </button>

                                <button
                                    onClick={() => navigate('/shop')}
                                    className="poster-details-btn poster-details-btn-outline"
                                >
                                    Continue Shopping
                                </button>
                            </div>

                            {/* Stock Info - Only for regular posters */}
                            {!isCustomPoster && (
                                <div className="poster-details-stock-info">
                                    <Package size={16} />
                                    <span className={poster.stock > 0 ? 'poster-details-in-stock' : 'poster-details-out-of-stock'}>
                                        {poster.stock > 0 ? `in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* You May Also Like Section - Only for regular posters */}
                    {!isCustomPoster && (recommendedPosters.length > 0 || loadingRecommended) && (
                        <div className="poster-details-recommended-section">
                            <h2>You may also like</h2>

                            {loadingRecommended ? (
                                <div className="poster-details-loading-recommended">
                                    <div className="poster-details-spinner"></div>
                                    <p>Loading recommendations...</p>
                                </div>
                            ) : (
                                <div className="poster-details-recommended-grid">
                                    {recommendedPosters.map((recommendedPoster) => (
                                        <div
                                            key={recommendedPoster.id}
                                            className="poster-details-recommended-poster-card"
                                            onClick={() => handleRecommendedPosterClick(recommendedPoster.id)}
                                        >
                                            <div className="poster-details-recommended-image-container">
                                                <img
                                                    src={recommendedPoster.image_url}
                                                    alt={recommendedPoster.title}
                                                    className="poster-details-recommended-poster-image"
                                                />
                                            </div>
                                            <div className="poster-details-recommended-poster-info">
                                                <h4>{recommendedPoster.title}</h4>
                                                {recommendedPoster.category_name && (
                                                    <p className="poster-details-recommended-poster-category">{recommendedPoster.category_name}</p>
                                                )}
                                                <p className="poster-details-recommended-poster-price">{displayPrice(recommendedPoster.price)}</p>
                                                <div className="poster-details-recommended-stock-badge">
                                                    {recommendedPoster.stock > 0 ? (
                                                        <span className="poster-details-in-stock">In Stock</span>
                                                    ) : (
                                                        <span className="poster-details-out-of-stock">Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default PosterDetails;