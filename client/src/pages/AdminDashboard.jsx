// AdminDashboard.jsx
import React, {useState, useEffect} from 'react';
import {
    Package,
    ShoppingCart,
    Users,
    Settings,
    Plus,
    Edit,
    Trash2,
    Upload,
    Eye,
    X,
    CheckCircle,
    AlertCircle,
    Info,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('posters');
    const [posters, setPosters] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingPoster, setEditingPoster] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [loadingOrderItems, setLoadingOrderItems] = useState({});
    const navigate = useNavigate();


    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [actionCallback, setActionCallback] = useState(null);

    // Pop-up notification state
    const [notifications, setNotifications] = useState([]);

    // Add a new notification
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        setNotifications(prev => [notification, ...prev]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    // Remove a notification
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };


    const showConfirmation = (message, callback) => {
        setConfirmMessage(message);
        setActionCallback(() => callback);
        setShowConfirmModal(true);
    };


    const handleConfirm = () => {
        if (actionCallback) {
            actionCallback();
        }
        setShowConfirmModal(false);
        setActionCallback(null);
    };


    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
        setActionCallback(null);
    };


    const handlePosterClick = (posterId) => {
        navigate(`/poster/${posterId}`);
    };

    // Notification component
    const Notification = ({ notification }) => {
        const getIcon = () => {
            switch (notification.type) {
                case 'success':
                    return <CheckCircle size={20} />;
                case 'error':
                    return <AlertCircle size={20} />;
                default:
                    return <Info size={20} />;
            }
        };

        const getBackgroundColor = () => {
            switch (notification.type) {
                case 'success':
                    return '#10b981';
                case 'error':
                    return '#ef4444';
                default:
                    return '#3b82f6';
            }
        };

        return (
            <div
                className="notification"
                style={{
                    backgroundColor: getBackgroundColor(),
                    color: 'white'
                }}
            >
                <div className="notification-content">
                    {getIcon()}
                    <span>{notification.message}</span>
                </div>
                <button
                    onClick={() => removeNotification(notification.id)}
                    className="notification-close"
                >
                    <X size={16} />
                </button>
            </div>
        );
    };

    const fetchOrderItems = async (orderId) => {
        setLoadingOrderItems(prev => ({...prev, [orderId]: true}));
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
        } catch (error) {
            console.error('Error fetching order items:', error);
            addNotification('Error loading order details: ' + error.message, 'error');
        } finally {
            setLoadingOrderItems(prev => ({...prev, [orderId]: false}));
        }
    };

    const handleViewOrder = async (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
        if (!orderItems[order.id]) {
            await fetchOrderItems(order.id);
        }
    };

    /* Status badge function */
    const getStatusColor = (status) => {
        const colors = {
            'processing': '#3b82f6',
            'paid': '#10b981',
            'pending': '#f59e0b',
            'shipped': '#8b5cf6',
            'delivered': '#10b981',
            'cancelled': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            'processing': 'Processing',
            'paid': 'Paid',
            'pending': 'Pending',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return texts[status] || status;
    };

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category_id: '',
        stock: '',
        image: null
    });

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch data based on active tab
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (activeTab === 'posters') {
                const response = await fetch('http://localhost:5000/api/posters');
                if (response.ok) {
                    const data = await response.json();
                    setPosters(data);
                }
            } else if (activeTab === 'orders') {
                const response = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            addNotification('Error fetching data: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPoster = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('category_id', formData.category_id || null);
            formDataToSend.append('stock', parseInt(formData.stock));

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            const response = await fetch('http://localhost:5000/api/admin/posters', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            const result = await response.json();

            if (response.ok) {
                setShowAddModal(false);
                setFormData({title: '', description: '', price: '', category_id: '', stock: '', image: null});
                fetchData();
                addNotification('Poster added successfully!', 'success');
            } else {
                addNotification('Error adding poster: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding poster:', error);
            addNotification('Error adding poster: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditPoster = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/posters/${editingPoster.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    category_id: formData.category_id || null,
                    stock: parseInt(formData.stock)
                })
            });

            const result = await response.json();

            if (response.ok) {
                setEditingPoster(null);
                setFormData({title: '', description: '', price: '', category_id: '', stock: '', image: null});
                fetchData();
                addNotification('Poster updated successfully!', 'success');
            } else {
                addNotification('Error updating poster: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error editing poster:', error);
            addNotification('Error editing poster: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePoster = async (posterId) => {

        showConfirmation(
            'Are you sure you want to permanently delete this poster? This action cannot be undone.',
            async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5000/api/admin/posters/${posterId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setPosters(prevPosters => prevPosters.filter(poster => poster.id !== posterId));
                        addNotification('Poster deleted successfully!', 'success');
                    } else {
                        addNotification('Error deleting poster: ' + result.message, 'error');

                        if (result.message.includes('referenced in existing orders')) {

                            showConfirmation(
                                'This poster is in existing orders. Would you like to hide it by setting stock to 0 instead?',
                                async () => {
                                    const updateResponse = await fetch(`http://localhost:5000/api/admin/posters/${posterId}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({stock: 0})
                                    });

                                    if (updateResponse.ok) {
                                        fetchData();
                                        addNotification('Poster hidden (stock set to 0)!', 'success');
                                    }
                                }
                            );
                        }
                    }
                } catch (error) {
                    console.error('Error deleting poster:', error);
                    addNotification('Error deleting poster: ' + error.message, 'error');
                }
            }
        );
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            addNotification('Please enter a category name', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/category', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: newCategory})
            });

            const result = await response.json();

            if (response.ok) {
                setNewCategory('');
                setShowCategoryModal(false);
                fetchCategories();
                addNotification('Category added successfully!', 'success');
            } else {
                addNotification('Error adding category: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error adding category:', error);
            addNotification('Error adding category: ' + error.message, 'error');
        }
    };

    const handleDeleteCategory = async (categoryId) => {

        showConfirmation(
            'Are you sure you want to delete this category?',
            async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`http://localhost:5000/api/admin/category/${categoryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        fetchCategories();
                        addNotification('Category deleted successfully!', 'success');
                    } else {
                        addNotification('Error deleting category: ' + result.message, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    addNotification('Error deleting category: ' + error.message, 'error');
                }
            }
        );
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({status: newStatus})
            });

            const result = await response.json();

            if (response.ok) {
                fetchData();
                addNotification('Order status updated successfully!', 'success');
            } else {
                addNotification('Error updating order: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            addNotification('Error updating order: ' + error.message, 'error');
        }
    };

    const openEditModal = (poster) => {
        setEditingPoster(poster);
        setFormData({
            title: poster.title,
            description: poster.description || '',
            price: poster.price,
            category_id: poster.category_id || '',
            stock: poster.stock || 0,
            image: null
        });
    };

    const resetForm = () => {
        setFormData({title: '', description: '', price: '', category_id: '', stock: '', image: null});
        setEditingPoster(null);
        setShowAddModal(false);
    };

    return (
        <div className="admin-dashboard">
            {/* Notification Container */}
            <div className="notifications-container">
                {notifications.map(notification => (
                    <Notification key={notification.id} notification={notification} />
                ))}
            </div>

            {/* Header */}
            <div className="admin-header">
                <div className="admin-header-content">
                    <h1>FLXR <span className="studios">studios</span> Admin</h1>
                    <div className="admin-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16}/>
                            Add Poster
                        </button>
                    </div>
                </div>
            </div>

            <div className="admin-container">
                {/* Sidebar */}
                <div className="admin-sidebar">
                    <nav className="admin-nav">
                        <button
                            className={`nav-item1 ${activeTab === 'posters' ? 'active' : ''}`}
                            onClick={() => setActiveTab('posters')}
                        >
                            <Package size={20}/>
                            Posters
                        </button>
                        <button
                            className={`nav-item1 ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingCart size={20}/>
                            Orders
                        </button>
                        <button
                            className={`nav-item1 ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            <Users size={20}/>
                            Categories
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="admin-main">
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <>
                            {/* Posters Management */}
                            {activeTab === 'posters' && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <h2>Posters Management</h2>
                                        <p>Manage your poster collection</p>
                                    </div>

                                    {posters.length === 0 ? (
                                        <div className="no-posters">
                                            <p>No posters found. Add your first poster!</p>
                                        </div>
                                    ) : (
                                        <div className="posters-grid">
                                            {posters.map(poster => (
                                                <div key={poster.id} className="poster-card">

                                                    <div
                                                        className="poster-clickable-area"
                                                        onClick={() => handlePosterClick(poster.id)}
                                                    >
                                                        <div className="poster-image1">
                                                            <img src={poster.image_url} alt={poster.title}/>
                                                            <div className="poster-view-overlay">
                                                                <ExternalLink size={24} />
                                                                <span>View Details</span>
                                                            </div>
                                                        </div>
                                                        <div className="poster-info">
                                                            <h3>{poster.title}</h3>
                                                            <p className="poster-category1">{poster.category_name || 'Uncategorized'}</p>
                                                            <p className="poster-price1">LE {poster.price}</p>
                                                            <p className="poster-stock">Stock: {poster.stock}</p>
                                                        </div>
                                                    </div>
                                                    <div className="poster-actions">
                                                        <button
                                                            className="btn-icon edit"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(poster);
                                                            }}
                                                            title="Edit Poster"
                                                        >
                                                            <Edit size={16}/>
                                                        </button>
                                                        <button
                                                            className="btn-icon delete"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeletePoster(poster.id);
                                                            }}
                                                            title="Delete Poster"
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Orders Management */}
                            {activeTab === 'orders' && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <h2>Orders Management</h2>
                                        <p>View and manage customer orders</p>
                                    </div>

                                    <div className="orders-table">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
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
                                                    <td>{order.username || 'Guest'}</td>
                                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                    <td>LE {order.total}</td>
                                                    <td>
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                            className={`status-select ${order.status}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="processing">Processing</option>
                                                            <option value="shipped">Shipped</option>
                                                            <option value="delivered">Delivered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-icon view"
                                                            onClick={() => handleViewOrder(order)}
                                                        >
                                                            <Eye size={16}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Categories Management */}
                            {activeTab === 'categories' && (
                                <div className="tab-content">
                                    <div className="section-header">
                                        <h2>Categories Management</h2>
                                        <button
                                            className="add-category"
                                            onClick={() => setShowCategoryModal(true)}
                                        >
                                            <Plus size={16}/>
                                            Add Category
                                        </button>
                                    </div>

                                    <div className="admin-categories-grid">
                                        {categories.map(category => (
                                            <div key={category.id} className="admin-category-card">
                                                <h3>{category.name}</h3>
                                                <div className="admin-category-stats">
                                                    <div className="admin-category-actions">
                                                        <button
                                                            className="btn-icon delete"
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                        >
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Poster Modal */}
            {(showAddModal || editingPoster) && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingPoster ? 'Edit Poster' : 'Add New Poster'}</h3>
                            <button className="close-btn" onClick={resetForm}>
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={editingPoster ? handleEditPoster : handleAddPoster}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (LE) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
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
                                    <label>Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                        required={!editingPoster}
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={resetForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (editingPoster ? 'Update Poster' : 'Add Poster')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Category</h3>
                            <button className="close-btn" onClick={() => setShowCategoryModal(false)}>
                                <X size={20}/>
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    required
                                    placeholder="Enter category name"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline"
                                        onClick={() => setShowCategoryModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ✅ ADDED: Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Confirm Action</h3>
                            <button className="close-btn" onClick={handleCancelConfirm}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <AlertCircle size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
                            <p style={{ fontSize: '16px', color: '#333', marginBottom: '24px', lineHeight: '1.5' }}>
                                {confirmMessage}
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={handleCancelConfirm}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleConfirm}
                                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Order Details - #{selectedOrder.id}</h3>
                            <button className="close-btn" onClick={() => setShowOrderModal(false)}>
                                <X size={20}/>
                            </button>
                        </div>

                        <div className="order-modal-content">
                            <div className="order-summary">
                                <div className="summary-item">
                                    <label>Customer:</label>
                                    <span>{selectedOrder.username || 'Guest'}</span>
                                </div>
                                <div className="summary-item">
                                    <label>Order Date:</label>
                                    <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="summary-item">
                                    <label>Total Amount:</label>
                                    <span className="total-amount">LE {selectedOrder.total}</span>
                                </div>
                                <div className="summary-item">
                                    <label>Status:</label>
                                    <span
                                        className="status-badge"
                                        style={{
                                            backgroundColor: getStatusColor(selectedOrder.status),
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {getStatusText(selectedOrder.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="order-items-section">
                                <h4>Order Items</h4>
                                {loadingOrderItems[selectedOrder.id] ? (
                                    <div className="loading-items">Loading items...</div>
                                ) : orderItems[selectedOrder.id] ? (
                                    <div className="order-items-list">
                                        {orderItems[selectedOrder.id].map(item => (
                                            <div key={item.id} className="order-item">
                                                <img
                                                    src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:5000${item.image_url}`}
                                                    alt={item.poster_title}
                                                    className="item-image"
                                                />
                                                <div className="item-info">
                                                    <h5>{item.poster_title || 'Unknown Poster'}</h5>
                                                    <div className="item-details">
                                                        <div className="item-detail-row">
                                                            <span>Quantity: {item.quantity}</span>
                                                            <span>Price: LE {Number(item.price).toFixed(2)}</span>
                                                        </div>
                                                        <div className="item-detail-row">
                                                            <span className="item-frame">Frame: {item.frame || 'Black Frame'}</span>
                                                            <span className="item-size">Size: {item.size || '30×40 cm'}</span>
                                                        </div>
                                                        <span className="item-total">
                                                            Total: LE {(item.quantity * item.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-items">No items found for this order.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;