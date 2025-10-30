import React, {useState, useEffect} from "react";
import {Package, Eye, AlertCircle, Home, ChevronLeft} from "lucide-react";
import Navbar from "../components/Navbar";
import {useNavigate} from "react-router-dom";
import "./Orders.css";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingItems, setLoadingItems] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const response = await fetch('http://localhost:5000/api/orders/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                throw new Error('Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderItems = async (orderId) => {
        setLoadingItems(prev => ({...prev, [orderId]: true}));
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/items`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const items = await response.json();
                setOrderItems(prev => ({...prev, [orderId]: items}));
            } else {
                throw new Error('Failed to fetch order items');
            }
        } catch (err) {
            console.error('Error fetching order items:', err);
            setError('Failed to load order details');
        } finally {
            setLoadingItems(prev => ({...prev, [orderId]: false}));
        }
    };

    const handleViewDetails = async (order) => {
        if (selectedOrder?.id === order.id) {
            setSelectedOrder(null);
        } else {
            setSelectedOrder(order);
            if (!orderItems[order.id]) {
                await fetchOrderItems(order.id);
            }
        }
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
                <Navbar/>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your orders...</p>
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
                        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                            <h1>My <span className="studios">Orders</span></h1>
                        </div>
                        <div className="admin-actions">
                            <button
                                className="btn btn-outline-warning"
                                onClick={() => navigate('/shop')}
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
                            <div className="sidebar-stats">
                                <div className="stat-item">
                                    <span className="stat-number">{orders.length}</span>
                                    <span className="stat-label">Total Orders</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">
                                        {orders.filter(o => o.status === 'delivered').length}
                                    </span>
                                    <span className="stat-label">Delivered</span>
                                </div>
                            </div>

                            <div style={{marginTop: 'auto', padding: '20px 0'}}>
                                <button
                                    className="nav-item1"
                                    onClick={() => navigate('/profile')}
                                >
                                    <Package size={20}/>
                                    Back to Profile
                                </button>
                            </div>
                        </nav>
                    </div>

                    {/* Main Content - Matches Admin Dashboard */}
                    <div className="admin-main">
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={20}/>
                                <span>{error}</span>
                                <button
                                    onClick={() => setError(null)}
                                    style={{
                                        marginLeft: 'auto',
                                        background: 'none',
                                        border: 'none',
                                        color: '#c33',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <div className="tab-content">
                            <div className="section-header">
                                <h2>Order History</h2>
                                <p>View and track all your orders</p>
                            </div>

                            {orders.length === 0 ? (
                                <div className="empty-state">
                                    <Package size={64}/>
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
                                <div className="orders-table-container">
                                    <table className="orders-table">
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
                                            <React.Fragment key={order.id}>
                                                <tr>
                                                    <td>#{order.id}</td>
                                                    <td>
                                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td>LE {Number(order.total).toFixed(2)}</td>
                                                    <td>
                                                            <span
                                                                className="status-badge"
                                                                style={{backgroundColor: getStatusColor(order.status)}}
                                                            >
                                                                {getStatusText(order.status)}
                                                            </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-icon1 view"
                                                            onClick={() => handleViewDetails(order)}
                                                        >
                                                            <Eye size={16}/>
                                                            {selectedOrder?.id === order.id ? 'Hide' : 'View'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {selectedOrder?.id === order.id && (
                                                    <tr className="order-details-row">
                                                        <td colSpan="5">
                                                            <div className="order-details-panel">
                                                                <h4>Order Items</h4>
                                                                {loadingItems[order.id] ? (
                                                                    <div className="loading-items">
                                                                        <div className="spinner small"></div>
                                                                        <p>Loading items...</p>
                                                                    </div>
                                                                ) : orderItems[order.id] ? (
                                                                    <div className="order-items-grid">
                                                                        {orderItems[order.id].map(item => (
                                                                            <div key={item.id}
                                                                                 className="order-item-card">
                                                                                <img
                                                                                    src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                                                                                    alt={item.poster_title}
                                                                                    className="item-image"
                                                                                    onError={(e) => {
                                                                                        e.target.src = '/placeholder-poster.jpg';
                                                                                    }}
                                                                                />
                                                                                <div className="item-details">
                                                                                    <h5>{item.poster_title || 'Unknown Poster'}</h5>
                                                                                    <div className="item-meta">
                                                                                        <span>Quantity: {item.quantity}</span>
                                                                                        <span>Price: LE {Number(item.price).toFixed(2)}</span>
                                                                                        <span className="item-total">
                                                                                                Total: LE {(item.quantity * item.price).toFixed(2)}
                                                                                            </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="loading-items">
                                                                        <p>No items found for this order.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Orders;