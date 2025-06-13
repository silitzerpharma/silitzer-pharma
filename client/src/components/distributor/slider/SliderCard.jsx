import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";
import './SliderCard.scss';
import { useNavigate } from 'react-router-dom';


const SliderCard = ({ product }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();




  const handleAddToCart = () => {
    if (!product.inStock) return;  // Disable adding if out of stock
    const productToAdd = {
      ...product,
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
      image: product.imageUrl,
      offers:product.offers
    };
    dispatch(addToCart(productToAdd));
  };

 const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };




  return (
    <div className="slidercard-container"  >
      <div className="slidercard-top" onClick={() => handleProductClick(product._id)}>
        <img src={product.imageUrl} alt={product.productName || "Product"} />
      </div>

      <div className="slidercard-bottom">
        <div className="name" onClick={() => handleProductClick(product._id)}>
          {product.productName || product.name || "Unnamed Product"}
        </div>

        <div
          className={`stock-status ${
            product.inStock ? 'in-stock' : 'out-of-stock'
          }`}
        >
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>

        <div className="add-cart">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty 1"
          />
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default SliderCard;
