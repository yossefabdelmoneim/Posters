// PosterDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function PosterDetail() {
  const { id } = useParams();
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoster();
  }, [id]);

  const fetchPoster = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posters/${id}`);
      const data = await response.json();
      setPoster(data);
    } catch (err) {
      console.error('Failed to fetch poster:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (!poster) return <div className="container mt-4">Poster not found</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img
            src={poster.image_url}
            alt={poster.title}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-6">
          <h1>{poster.title}</h1>
          <p className="text-muted">{poster.category_name}</p>
          <p className="fs-3 text-primary">LE {poster.price}</p>
          <p>{poster.description}</p>
          <button className="btn btn-primary btn-lg">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default PosterDetail;