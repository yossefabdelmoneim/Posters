import React, { useState, useEffect } from 'react';
import {
    Package,
    LogOut
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: '2024-01-15',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'http://localhost:3000/api';

    // Fetch user data and orders from backend
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                // Fetch user profile
                const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData);
                }

                // Fetch user orders
                const ordersResponse = await fetch(`${API_BASE_URL}/orders/my`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (ordersResponse.ok) {
                    const ordersData = await ordersResponse.json();
                    setOrders(ordersData);
                } else {
                    // Fallback to sample orders
                    setOrders([
                        {
                            id: 'FLXR-123456',
                            date: '2024-03-15',
                            total: 750,
                            status: 'delivered',
                            items: [
                                {
                                    name: 'Urban Legends',
                                    price: 245,
                                    quantity: 1,
                                    image: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=100&h=100&fit=crop',
                                    image_url: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=100&h=100&fit=crop'
                                },
                                {
                                    name: 'Desert Vibes',
                                    price: 280,
                                    quantity: 1,
                                    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=100&h=100&fit=crop',
                                    image_url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=100&h=100&fit=crop'
                                }
                            ]
                        }
                    ]);
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                // Use sample data if API fails
                setOrders([
                    {
                        id: 'FLXR-123456',
                        date: '2024-03-15',
                        total: 750,
                        status: 'delivered',
                        items: [
                            {
                                name: 'Urban Legends',
                                price: 245,
                                quantity: 1,
                                image: 'https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=100&h=100&fit=crop'
                            }
                        ]
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    // Order functions
    const viewOrderDetails = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/items`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const orderItems = await response.json();
                // You can display this in a modal or separate page
                console.log('Order items:', orderItems);
                alert(`Order ${orderId} details loaded - check console`);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Error loading order details');
        }
    };

    const reorder = async (orderId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/reorder`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Items added to cart successfully!');
            } else {
                alert('Reorder feature coming soon!');
            }
        } catch (error) {
            console.error('Error reordering:', error);
            alert('Reorder feature coming soon!');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'processing': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'delivered': return 'Delivered';
            case 'shipped': return 'Shipped';
            case 'processing': return 'Processing';
            case 'cancelled': return 'Cancelled';
            default: return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="user-profile">
            {/* Header */}
            <div className="profile-header">
                <div className="container">
                    <h1>My Account</h1>
                    <p>Manage your orders and account</p>
                </div>
            </div>

            <div className="container">
                <div className="profile-layout">
                    {/* Sidebar - Simplified */}
                    <div className="profile-sidebar">
                        <div className="sidebar-section">
                            <div className="user-summary">
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                                <h3>{user.name}</h3>
                                <p>{user.email}</p>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <button
                                className="nav-item active"
                            >
                                <Package size={20} />
                                My Orders
                                <span className="badge">{orders.length}</span>
                            </button>
                            <div className="nav-divider"></div>
                            <button className="nav-item logout" onClick={handleLogout}>
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </nav>
                    </div>

                    {/* Main Content - Only Orders */}
                    <div className="profile-content">
                        <div className="tab-content">
                            <div className="tab-header">
                                <h2>My Orders</h2>
                                <p>Track and manage your orders</p>
                            </div>

                            {orders.length === 0 ? (
                                <div className="empty-state">
                                    <Package size={48} />
                                    <h3>No orders yet</h3>
                                    <p>Start shopping to see your orders here</p>
                                    <a href="/" className="btn btn-primary">Start Shopping</a>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map(order => (
                                        <div key={order.id} className="order-card">
                                            <div className="order-header">
                                                <div className="order-info">
                                                    <h4>Order #{order.id}</h4>
                                                    <p>Placed on {new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="order-status">
                                                    <span
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {getStatusText(order.status)}
                                                    </span>
                                                    <span className="order-total">LE {order.total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="order-items">
                                                {order.items && order.items.map((item, index) => (
                                                    <div key={index} className="order-item">
                                                        <img src={item.image_url || item.image} alt={item.name} />
                                                        <div className="item-info">
                                                            <h5>{item.name}</h5>
                                                            <p>Quantity: {item.quantity}</p>
                                                        </div>
                                                        <span className="item-price">LE {item.price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="order-actions">
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => viewOrderDetails(order.id)}
                                                >
                                                    View Details
                                                </button>
                                                {order.status === 'delivered' && (
                                                    <button
                                                        className="btn btn-outline"
                                                        onClick={() => reorder(order.id)}
                                                    >
                                                        Reorder
                                                    </button>
                                                )}
                                                {order.status === 'shipped' && (
                                                    <button className="btn btn-outline">Track Order</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;