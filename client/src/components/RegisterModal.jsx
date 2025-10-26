import React, { useState } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import "./LoginModal.css";

function RegisterModal({ show, onHide, onLoginClick, onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.user); // Notify parent component
        onHide(); // Close modal
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">Register</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <div className="field mb-3">
            <div className="label">Username</div>
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field mb-3">
            <div className="label">Email address</div>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field mb-4">
            <div className="label">Password</div>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="action">
            <Button
              type="submit"
              className="w-100 btn-warning modern-btn"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>

        <div className="switch text-center mt-3">
          <span>Already have an account? </span>
          <button className="link-btn" onClick={onLoginClick}>
            Login here
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default RegisterModal;