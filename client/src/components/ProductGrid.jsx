import React from "react";
import "./ProductGrid.css"

function ProductGrid({posters, addToCart}) {
    return (
        <section className="products">
        <h2>FEATURED POSTERS</h2>
        <div className="product-grid">
          {posters.map((poster) => (
            <div className="product" key={poster.id}>
              <img src={poster.image} alt={poster.title} />
              <div className="info">
                <div>
                  <h3>{poster.title}</h3>
                  <p><strong>{poster.price} EGP</strong></p>
                </div>
                <button onClick={() => addToCart(poster.id)}>ADD</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    )
}

export default ProductGrid;