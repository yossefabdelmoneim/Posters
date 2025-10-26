// CategoryPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";

function CategoryPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    // Get category name from navigation state or fetch it
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

      // If we don't have category name from state, try to get it from first poster
      if (!categoryName && data.length > 0 && data[0].category_name) {
        setCategoryName(data[0].category_name);
      }
    } catch (err) {
      console.error('Failed to fetch posters:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">Loading posters...</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            {categoryName || `Category ${categoryId}`}
            <span className="text-muted fs-6 ms-2">({posters.length} posters)</span>
          </h1>
        </div>
      </div>

      {posters.length === 0 ? (
        <div className="text-center py-5">
          <h3>No posters found in this category</h3>
          <Link to="/" className="btn btn-primary mt-3">Browse All Posters</Link>
        </div>
      ) : (
        <div className="row">
          {posters.map(poster => (
            <div key={poster.id} className="col-md-4 col-lg-3 mb-4">
              <div className="card h-100">
                <img
                  src={poster.image_url}
                  className="card-img-top"
                  alt={poster.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{poster.title}</h5>
                  <p className="card-text text-muted">LE {poster.price}</p>
                  <button className="btn btn-outline-primary btn-sm">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;