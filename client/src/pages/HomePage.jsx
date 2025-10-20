import React, {useState} from "react";
import NavBar from "../components/NavBar";
import HeroContent from "../components/HeroContent";
import Categories from "../components/Categories";
import ProductGrid from "../components/ProductGrid";
import Cart from "../components/Cart";
import Marquee from "../components/Marquee";

function HomePage() {
    const posters = [
        {
            id: 1,
            title: "URBAN LEGENDS",
            price: 299,
            image: "https://images.unsplash.com/photo-1544306094-e2dcf9479da3?w=600&h=800&fit=crop"
        },
        {
            id: 2,
            title: "DESERT VIBES",
            price: 349,
            image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=800&fit=crop"
        },
        {
            id: 3,
            title: "NEON NIGHTS",
            price: 399,
            image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&h=800&fit=crop"
        },
        {
            id: 4,
            title: "CAIRO STREETS",
            price: 329,
            image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&h=800&fit=crop"
        },
    ];

    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (id) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === id);
            if (existing) {
                return prev.map((item) =>
                    item.id === id ? {...item, quantity: item.quantity + 1} : item
                );
            }
            const poster = posters.find((p) => p.id === id);
            return [...prev, {...poster, quantity: 1}];
        });
    };

    const changeQty = (id, change) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id ? {...item, quantity: item.quantity + change} : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <>
            <Marquee/>

            <div className="hero-header">
                <NavBar/>
                <HeroContent/>
            </div>

            <Categories/>

            <h2>FEATURED POSTERS</h2>
            <ProductGrid posters={posters} addToCart={addToCart}/>


            {/* Cart Sidebar */}
            <Cart
                cart={cart}
                totalPrice={totalPrice}
                changeQty={changeQty}
                removeItem={removeItem}
                toggleCart={toggleCart}
                isCartOpen={isCartOpen}
            />
        </>
    );
}

export default HomePage;