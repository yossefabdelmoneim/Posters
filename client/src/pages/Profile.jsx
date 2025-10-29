import React, { useState, useEffect } from "react";
import { User, Package, LogOut, AlertCircle, Calendar, Home } from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            // Fetch user data
            const userResponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!userResponse.ok) throw new Error('Failed to fetch user data');
            const userData = await userResponse.json();
            setUser(userData);

            // Fetch user orders
            const ordersResponse = await fetch('http://localhost:5000/api/orders/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
            const ordersData = await ordersResponse.json();
            setOrders(ordersData);

        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        window.location.reload();
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': '#f59e0b',
            'processing': '#3b82f6',
            'paid': '#10b981',
            'shipped': '#8b5cf6',
            'delivered': '#10b981',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            'pending': 'Pending',
            'processing': 'Processing',
            'paid': 'Paid',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="user-dashboard">
                {/* Header - Matches Admin Dashboard */}
                <div className="admin-header">
                    <div className="admin-header-content">
                        <h1>My <span className="studios">Profile</span></h1>
                        <div className="admin-actions">
                            <button
                                className="btn btn-outline-warning"
                                onClick={() => navigate('/')}
                            >
                                <Home size={16}/>
                                Browse Posters
                            </button>
                        </div>
                    </div>
                </div>

                <div className="admin-container">
                    {/* Sidebar - Matches Admin Dashboard */}
                    <div className="admin-sidebar">
                        <nav className="admin-nav">
                            <button
                                className={`nav-item2 ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={20}/>
                                My Orders
                                <span className="sidebar-badge">{orders.length}</span>
                            </button>
                            <button
                                className={`nav-item2 ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                <User size={20}/>
                                Personal Info
                            </button>

                            <div style={{ marginTop: 'auto', padding: '20px 0' }}>
                                <button
                                    className="nav-item2 logout"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={20}/>
                                    Logout
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content - Matches Admin Dashboard */}
                    <div className="admin-main">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#c33', cursor: 'pointer' }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="tab-content">
                                <div className="section-header">
                                    <h2>My Orders</h2>
                                    <p>Track and manage your poster orders</p>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="empty-state">
                                        <Package size={64} />
                                        <h3>No orders yet</h3>
                                        <p>Start shopping to see your orders here</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/')}
                                        >
                                            Browse Posters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="orders-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Date</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.id}>
                                                        <td>#{order.id}</td>
                                                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td>LE {order.total}</td>
                                                        <td>
                                                            <span
                                                                className="status-badge"
                                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                                            >
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn-icon4 view"
                                                                onClick={() => navigate('/orders')}
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'info' && (
                            <div className="tab-content">
                                <div className="section-header">
                                    <h2>Personal Information</h2>
                                    <p>Manage your account details</p>
                                </div>

                                <div className="user-info-grid">
                                    <div className="info-card">
                                        <div className="info-header">
                                            <User size={20} />
                                            <h3>Account Details</h3>
                                        </div>
                                        <div className="info-content">
                                            <div className="info-item">
                                                <label>Username</label>
                                                <p>{user?.username}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Email Address</label>
                                                <p>{user?.email}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Account Type</label>
                                                <p className="role-badge">{user?.role}</p>
                                            </div>
                                            <div className="info-item">
                                                <label>Member Since</label>
                                                <p>
                                                    <Calendar size={14} style={{ marginRight: '8px' }} />
                                                    {new Date(user?.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;