// src/components/AdminCategories.jsx - UPDATED WITH DELETE FUNCTIONALITY
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminCategories.css";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/admin/category",
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCategoryName("");
      fetchCategories(); // Refresh the list
      alert("Category added successfully!");
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Failed to add category");
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? Posters in this category will have their category set to null.")) return;

    try {
      const token = localStorage.getItem("token");
      // Note: You'll need to add a delete category endpoint in your backend
      // For now, this is commented out since the endpoint doesn't exist
      // await axios.delete(`http://localhost:5000/api/admin/category/${categoryId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      alert("Delete category functionality would be implemented here. You need to add a DELETE /api/admin/category/:id endpoint in your backend.");
      // fetchCategories(); // Refresh the list
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  if (loading) return <div className="admin-loading">Loading categories...</div>;

  return (
    <div className="admin-categories">
      <h2>Category Management</h2>

      <form onSubmit={addCategory} className="add-category-form">
        <input
          type="text"
          placeholder="New category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          required
        />
        <button type="submit">Add Category</button>
      </form>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <span className="category-name">{category.name}</span>
            <div className="category-actions">
              <span className="category-count">{/* You could show poster count here */}</span>
              <button
                onClick={() => deleteCategory(category.id)}
                className="delete-category-btn"
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

export default AdminCategories;