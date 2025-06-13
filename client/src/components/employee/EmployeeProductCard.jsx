import React from "react";
import "./style/EmployeeProductCard.scss";

const EmployeeProductCard = ({
  productName,
  productCode,
  inStock,
  stock,
  unitsPerBox,
  imageUrl,
}) => {
  return (
    <div className="product-card">
      <img
        src={imageUrl || "https://images.apollo247.in/pub/media/catalog/product/s/y/syr0007_1.jpg?tr=q-80,f-webp,w-400,dpr-3,c-at_max%201200w"}
        alt={productName}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{productName}</h3>
        <p className="product-code">Code: {productCode}</p>
        <p className={`in-stock ${inStock ? "stock-yes" : "stock-no"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>
        <p className="stock">Stock: {stock}</p>
        <p className="units-per-box">Units per Box: {unitsPerBox}</p>
      </div>
    </div>
  );
};

export default EmployeeProductCard;
