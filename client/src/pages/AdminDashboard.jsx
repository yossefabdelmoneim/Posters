// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import AdminPosters from "../components/AdminPosters";
import AdminOrders from "../components/AdminOrders";
import AdminCategories from "../components/AdminCategories";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("posters");

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === "posters" ? "active" : ""}
          onClick={() => setActiveTab("posters")}
        >
          Posters
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "posters" && <AdminPosters />}
        {activeTab === "categories" && <AdminCategories />}
        {activeTab === "orders" && <AdminOrders />}
      </div>
    </div>
  );
};

export default AdminDashboard;