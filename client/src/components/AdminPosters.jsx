// src/components/AdminPosters.jsx - UPDATED WITH FULL FUNCTIONALITY
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPosters.css";

const AdminPosters = () => {
  const [posters, setPosters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    stock: ""
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchPosters();
    fetchCategories();
  }, []);

  const fetchPosters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posters");
      setPosters(res.data);
    } catch (err) {
      console.error("Error fetching posters:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category_id: "",
      stock: ""
    });
    setImageFile(null);
    setEditingPoster(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("category_id", formData.category_id);
      submitData.append("stock", formData.stock || "0");

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      if (editingPoster) {
        // Update existing poster
        await axios.put(
          `http://localhost:5000/api/admin/posters/${editingPoster.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new poster
        await axios.post(
          "http://localhost:5000/api/admin/posters",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      resetForm();
      fetchPosters(); // Refresh the list
      alert(editingPoster ? "Poster updated successfully!" : "Poster added successfully!");
    } catch (err) {
      console.error("Error saving poster:", err);
      alert("Failed to save poster");
    }
  };

  const deletePoster = async (id) => {
    if (!window.confirm("Are you sure you want to delete this poster?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/posters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosters(); // Refresh list
      alert("Poster deleted successfully!");
    } catch (err) {
      console.error("Error deleting poster:", err);
      alert("Failed to delete poster");
    }
  };

  const startEdit = (poster) => {
    setEditingPoster(poster);
    setFormData({
      title: poster.title,
      description: poster.description || "",
      price: poster.price,
      category_id: poster.category_id || "",
      stock: poster.stock || "0"
    });
    setShowAddForm(true);
  };

  if (loading) return <div className="admin-loading">Loading posters...</div>;

  return (
    <div className="admin-posters">
      <div className="admin-header">
        <h2>Poster Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="add-poster-btn"
        >
          {showAddForm ? 'Cancel' : 'Add New Poster'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="add-poster-form">
          <h3>{editingPoster ? 'Edit Poster' : 'Add New Poster'}</h3>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Stock:</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {!editingPoster && (
            <div className="form-group">
              <label>Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingPoster}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingPoster ? 'Update Poster' : 'Add Poster'}
            </button>
            <button type="button" onClick={resetForm} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="posters-grid">
        {posters.map(poster => (
          <div key={poster.id} className="poster-admin-card">
            <img src={poster.image_url} alt={poster.title} />
            <div className="poster-admin-info">
              <h4>{poster.title}</h4>
              <p className="price">${poster.price}</p>
              <p className="category">{poster.category_name || 'No category'}</p>
              <p className="stock">Stock: {poster.stock || 0}</p>
              <p className="description">{poster.description}</p>
            </div>
            <div className="poster-actions">
              <button
                onClick={() => startEdit(poster)}
                className="edit-btn"
              >
                Edit
              </button>
              <button
                onClick={() => deletePoster(poster.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPosters;