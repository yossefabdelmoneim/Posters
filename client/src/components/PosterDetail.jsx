import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, Upload, Image, X } from "lucide-react";
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
  const [customImage, setCustomImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const isCustomPoster = id === "999";

  useEffect(() => {
    if (!isCustomPoster) {
      fetchPoster();
    } else {
      // For custom poster, create a placeholder object
      setPoster({
        id: 999,
        title: "Custom Poster - Upload Your Design",
        description: "Upload your own image and create a custom poster. We'll print your design on high-quality poster paper.",
        price: 25.00,
        image_url: "/images/custom-poster-placeholder.jpg",
        stock: 9999,
        category_name: "Custom"
      });
      setLoading(false);
    }
  }, [id, isCustomPoster]);

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

  const handleAddToCart = () => {
    if (isCustomPoster) {
      // For custom poster, require image upload
      if (!customImage) {
        setUploadError('Please upload your design first');
        return;
      }

      const cartItem = {
        id: `custom-${Date.now()}`, // Unique ID for custom items
        title: "Custom Poster - Your Design",
        price: poster.price,
        image_url: imagePreview, // Use the preview as image URL
        quantity: 1,
        customImage: customImage, // Store the file for later processing
        isCustom: true
      };

      addToCart(cartItem);
      alert('Custom poster added to cart! We will print your design.');
    } else {
      // Regular poster
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
        <div className="container">
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="poster-details-grid">
            <div className="poster-image-section">
              {isCustomPoster ? (
                <div className="custom-poster-upload">
                  {imagePreview ? (
                    <div className="custom-image-preview">
                      <img
                        src={imagePreview}
                        alt="Your custom design"
                        className="preview-image"
                      />
                      <button
                        onClick={removeCustomImage}
                        className="remove-image-btn"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
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
                    className="file-input"
                  />
                  {uploadError && (
                    <div className="upload-error">
                      {uploadError}
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={poster.image_url}
                  alt={poster.title}
                  className="poster-image"
                />
              )}
            </div>

            <div className="poster-info-section">
              <div className="poster-header">
                <h1>{poster.title}</h1>
                {isCustomPoster && (
                  <div className="custom-badge">
                    Custom Design
                  </div>
                )}
              </div>

              {poster.category_name && (
                <p className="category-badge">{poster.category_name}</p>
              )}

              <p className="poster-price">LE {poster.price}</p>

              <div className="stock-info">
                <Package size={16} />
                <span className={poster.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                  {isCustomPoster ? 'Available for custom orders' :
                   poster.stock > 0 ? `${poster.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {poster.description && (
                <div className="description-section">
                  <h3>Description</h3>
                  <p>{poster.description}</p>
                </div>
              )}

              {isCustomPoster && (
                <div className="custom-features">
                  <h3>Custom Poster Features</h3>
                  <ul>
                    <li>✓ High-quality poster printing</li>
                    <li>✓ Multiple sizes available</li>
                    <li>✓ Premium paper material</li>
                    <li>✓ Fast processing and shipping</li>
                  </ul>
                </div>
              )}

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={!isCustomPoster && poster.stock === 0}
                  className={`btn btn-primary ${(!isCustomPoster && poster.stock === 0) ? 'disabled' : ''}`}
                >
                  <ShoppingCart size={20} />
                  {isCustomPoster ? 'Add Custom Poster to Cart' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => navigate('/shop')}
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