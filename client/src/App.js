import React from "react";
import {Routes, BrowserRouter, Route} from "react-router-dom";
import Home from "./pages/Home"
import Cart from "./pages/Cart";
import PosterDetail from "./pages/PosterDetail";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import {CartProvider} from "./Context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import CategoryPage from "./components/CategoryPage";
import RequireAuth from "./components/RequireAuth";
import PosterDetails from "./components/PosterDetail";
import ShopPage from "./pages/Shop";

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/category/:categoryId" element={<CategoryPage/>}/>
                    <Route path="/poster/:id" element={<PosterDetail/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/checkout" element={<Checkout/>}/>
                    <Route path="/profie" element={<Profile/>}/>
                    <Route path="/admin" element={<AdminDashboard/>}/>
                    // Add this route to your existing routes
                    <Route path="/admin" element={
                        <RequireAuth>
                            <AdminDashboard/>
                        </RequireAuth>
                    }/>
                </Routes>
            </BrowserRouter>
        </CartProvider>
    )
}

export default App;