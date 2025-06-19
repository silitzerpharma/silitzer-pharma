import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./EmployeeProductSlider.scss";
import ProductDetailCard from "../ProductDetailCard"; // Import the detail component

const EmployeeProductSlider = ({ title, productList = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleCardClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="employee-product-slider">
      <h3 className="slider-title">{title}</h3>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={12}
        slidesPerView={2}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={productList.length > 2}
        className="product-swiper"
      >
        {productList.map((product, index) => (
          <SwiperSlide key={index}>
            <div
              className="emp-product-card"
              onClick={() => handleCardClick(product)}
            >
              <div className="top">
                <img
                  src={product.imageUrl || "/images/default-product.jpg"}
                  alt={product.productName || "Product"}
                />
              </div>
              <div className="bottom">
                <p className="product-name">
                  {product.productName.length > 40
                    ? product.productName.slice(0, 60) + "..."
                    : product.productName}
                </p>
                <p className="product-info">Code: {product.productCode}</p>
                <p className="product-info">Stock: {product.stock}</p>
                <p className="product-info">Units/Box: {product.unitsPerBox}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {selectedProduct && (
        <div className="product-detail-overlay">
          <ProductDetailCard
            product={selectedProduct}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeProductSlider;
