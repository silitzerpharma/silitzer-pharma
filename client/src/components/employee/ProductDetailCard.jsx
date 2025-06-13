import React, { useState } from "react";
import "./style/ProductDetailCard.scss";



const ProductDetailCard = ({ product, onClose }) => {
  return (
    <div className="product-detail-card">
      <button className="close-button" onClick={onClose || (() => alert("Close clicked"))}>×</button>

      {product.imageUrl && (
        <div className="product-image">
          <img src={product.imageUrl} alt={product.productName} />
        </div>
      )}

      <h2>{product.productName}</h2>
      <p className="code"><strong>Code:</strong> {product.productCode}</p>

      <div className="product-section">
        {product.productDescription && <p><strong>Description:</strong> {product.productDescription}</p>}
        {product.other && <p><strong>Other:</strong> {product.other}</p>}
        <p><strong>Item Rate:</strong> ₹{product.itemRate}</p>
        <p><strong>Batch Number:</strong> {product.batchNumber}</p>
        <p><strong>Expiry Date:</strong> {product.expiryDate}</p>
        <p><strong>Manufacture Date:</strong> {product.manufactureDate}</p>
        <p><strong>HSN Code:</strong> {product.hsnCode}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>Units/Box:</strong> {product.unitsPerBox}</p>
        <p><strong>Manufacturer:</strong> {product.manufacturer}</p>
        <p><strong>Country of Origin:</strong> {product.countryOfOrigin}</p>
      </div>

      <div className="product-section">
        {product.advantages?.length > 0 && (
          <>
            <h4>Advantages:</h4>
            <ul>{product.advantages.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </>
        )}
        {product.features?.length > 0 && (
          <>
            <h4>Features:</h4>
            <ul>{product.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </>
        )}
        {product.uses?.length > 0 && (
          <>
            <h4>Uses:</h4>
            <ul>{product.uses.map((u, i) => <li key={i}>{u}</li>)}</ul>
          </>
        )}
        {product.howToUse?.length > 0 && (
          <>
            <h4>How to Use:</h4>
            <ul>{product.howToUse.map((h, i) => <li key={i}>{h}</li>)}</ul>
          </>
        )}
        {product.specifications?.length > 0 && (
          <>
            <h4>Specifications:</h4>
            <ul>
              {product.specifications.map((s, i) => (
                <li key={i}><strong>{s.label}:</strong> {s.value}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetailCard;
