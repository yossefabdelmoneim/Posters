import React from "react";
import "./Categories.css"

function Categories(){
    return (
        <section className="categories">
        <div className="category-grid">
          <div className="category orange">EXPLORE<br /><small>LOUD BORDERS COLLECTION</small></div>
          <div className="category">CUSTOM<br />DESIGNS?</div>
          <div className="category">BEST<br />SELLERS</div>
          <div className="category">NEW<br />DESIGNS</div>
          <div className="category orange">CITIES &amp;<br />LOCATIONS</div>
          <div className="category orange">RANDOM<br />PICKS</div>
        </div>
      </section>
    )
}

export default Categories;