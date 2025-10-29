import React from "react";
import {Routes, BrowserRouter, Route} from "react-router-dom";
import Home from "./pages/Home"
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import {CartProvider} from "./Context/CartContext";
import "bootstrap/dist/css/bootstrap.min.css";
import CategoryPage from "./pages/CategoryPage";
import RequireAuth from "./components/RequireAuth";
import PosterDetails from "./components/PosterDetail";
import ShopPage from "./pages/Shop";

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>

                    <Route path="/" element={<Home/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/checkout" element={<Checkout/>}/>
                    <Route path="/profile" element={<Profile/>}/>
                    <Route path="/orders" element={<Orders/>}/>
                    <Route path="/poster/:id" element={<PosterDetails/>}/>
                    <Route path="/category/:categoryId" element={<CategoryPage/>}/>
                    <Route path="/shop" element={<ShopPage />} />
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