import React from "react";
import "./Cart.css"

function Cart({ cart, totalPrice, changeQty, removeItem, toggleCart, isCartOpen }) {
  return (
    <div id="cart" className={isCartOpen ? "open" : ""}>
      <header>
        <h2>YOUR CART</h2>
        <button onClick={toggleCart}>✖</button>
      </header>

      <div className="content">
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={item.image} alt={item.title} />
              <div style={{ flex: 1 }}>
                <h4>{item.title}</h4>
                <p>{item.price} EGP</p>
                <div>
                  <button onClick={() => changeQty(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQty(item.id, 1)}>+</button>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: "red", marginLeft: "10px" }}
                  >
                    ✖
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="footer">
        <p><strong>TOTAL:</strong> {totalPrice.toFixed(2)} EGP</p>
        <button className="checkout">CHECKOUT</button>
      </div>
    </div>
  );
}

export default Cart;
