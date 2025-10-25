import React from "react";
import {useNavigate} from "react-router-dom";
import "./Hero.css";

const Hero = () => {
    const navigate = useNavigate();
  return (
    <section className="hero-header">
      <div className="hero-content">
        <div>
          <p>Discover Unique Art Prints</p>
          <h2>Bring Your Walls to Life</h2>
          <button onClick={event => {
              event.preventDefault();
              navigate("/shop");
          }}>Shop Now</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;