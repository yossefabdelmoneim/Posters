// src/pages/Home.jsx - UPDATED
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />
      <Hero />

      {user && user.role === "admin" && (
        <div className="admin-quick-access">
          <div className="container">
            <h2>Admin Quick Access</h2>
            <div className="admin-links">
              <Link to="/admin" className="admin-link">
                Manage Posters
              </Link>
              <Link to="/admin" className="admin-link">
                Manage Categories
              </Link>
              <Link to="/admin" className="admin-link">
                View Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;