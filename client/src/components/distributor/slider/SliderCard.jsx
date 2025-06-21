import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";
import "./SliderCard.scss";
import { useNavigate } from "react-router-dom";

const SliderCard = ({ product }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const qty = Number(quantity);
    if (!product.inStock || isNaN(qty) || qty < 1) return;

    const productToAdd = {
      ...product,
      quantity: qty,
      image: product.imageUrl,
      offers: product.offers,
    };

    dispatch(addToCart(productToAdd));
    setQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    // Allow empty for temporary input, validate on blur
    if (val === "" || /^[0-9\b]+$/.test(val)) {
      setQuantity(val);
    }
  };

  const handleQuantityBlur = () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      setQuantity(1); // fallback to 1
    } else {
      setQuantity(qty);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  return (
    <div className="slidercard-container">
      <div
        className="slidercard-top"
        onClick={() => handleProductClick(product._id)}
      >
        <img
          src={product.imageUrl || "/images/default-product.jpg"}
          alt={product.productName || "Product"}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/default-product.png";
          }}
        />
      </div>

      <div className="slidercard-bottom">
        <div className="name" onClick={() => handleProductClick(product._id)}>
          {product.productName || product.name || "Unnamed Product"}
        </div>

        {product.unitsPerBox > 0 && (
          <p className="units-info">Units per Box: {product.unitsPerBox}</p>
        )}

        <div
          className={`stock-status ${product.inStock ? "in-stock" : "out-of-stock"}`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </div>

        <div className="add-cart">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            placeholder="Qty 1"
          />
          <button onClick={handleAddToCart} disabled={!product.inStock}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliderCard;
