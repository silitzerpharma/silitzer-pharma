import './editproduct.scss';
import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProduct = ({ product, setIsEditing, refreshProductDetails }) => {
  const [editedProduct, setEditedProduct] = useState({ ...product });

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value, subfield = null) => {
    const updated = [...editedProduct[field]];
    if (subfield) {
      updated[index][subfield] = value;
    } else {
      updated[index] = value;
    }
    handleChange(field, updated);
  };

  const handleAddItem = (field, newItem) => {
    handleChange(field, [...editedProduct[field], newItem]);
  };

  const handleRemoveItem = (field, index) => {
    const updated = editedProduct[field].filter((_, i) => i !== index);
    handleChange(field, updated);
  };

  const renderEditableList = (field, label) => (
    <div>
      <label>{label}:</label>
      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {editedProduct[field].map((item, index) => (
          <li key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: 4 }}>
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              style={{ flexGrow: 1 }}
            />
            <button type="button" onClick={() => handleRemoveItem(field, index)}>❌</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => handleAddItem(field, "")}>➕ Add {label}</button>
    </div>
  );

  const renderTaxes = () => (
    <div>
      <label>Taxes:</label>
      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {editedProduct.taxes.map((tax, index) => (
          <li key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: 4 }}>
            <input
              type="text"
              placeholder="Name"
              value={tax.name}
              onChange={(e) => handleArrayChange("taxes", index, e.target.value, "name")}
              style={{ flexGrow: 1 }}
            />
            <input
              type="number"
              placeholder="Rate"
              value={tax.rate}
              onChange={(e) => handleArrayChange("taxes", index, e.target.value, "rate")}
              style={{ width: 80 }}
            />
            <button type="button" onClick={() => handleRemoveItem("taxes", index)}>❌</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => handleAddItem("taxes", { name: "", rate: "" })}>➕ Add Tax</button>
    </div>
  );

  const renderSpecifications = () => (
    <div>
      <label>Specifications:</label>
      <ul style={{ paddingLeft: 0, listStyle: "none" }}>
        {editedProduct.specifications.map((spec, index) => (
          <li key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: 4 }}>
            <input
              type="text"
              placeholder="Key"
              value={spec.key}
              onChange={(e) => handleArrayChange("specifications", index, e.target.value, "key")}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="Value"
              value={spec.value}
              onChange={(e) => handleArrayChange("specifications", index, e.target.value, "value")}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => handleRemoveItem("specifications", index)}>❌</button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => handleAddItem("specifications", { key: "", value: "" })}
      >
        ➕ Add Specification
      </button>
    </div>
  );

  const renderInput = (field, label, type = "text", placeholder = "") => (
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor={field} style={{ display: "block", fontWeight: "bold", marginBottom: 4 }}>
        {label}:
      </label>
      <input
        id={field}
        type={type}
        value={editedProduct[field] || ""}
        placeholder={placeholder}
        onChange={(e) => handleChange(field, e.target.value)}
        style={{ width: "100%", padding: 6 }}
      />
    </div>
  );

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { stock, ...productData } = editedProduct;

      const response = await fetch(`${BASE_URL}/admin/editproduct`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const data = await response.json();
      alert(data.message);
      refreshProductDetails();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSave}
      style={{ maxWidth: 600, margin: "auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}
    >
      <h2>Edit Product</h2>

      {renderInput("productName", "Product Name")}
      {renderInput("batchNumber", "Batch Number")}
      {renderInput("purchaseRate", "Purchase Rate", "number")}
      {renderInput("hsnCode", "HSN Code")}
      {renderInput("expiryDate", "Expiry Date", "date")}
      {renderInput("itemRate", "Item Rate", "number")}

      {renderInput("imageUrl", "Image URL")}
      {renderInput("unitsPerBox", "Units Per Box", "number")}
      {renderInput("countryOfOrigin", "Country of Origin")}

      {renderInput("manufacturer", "Manufacturer")}
      {renderInput("manufactureDate", "Manufacture Date", "date")}

      {renderSpecifications()}
      {renderEditableList("howToUse", "How to Use")}
      {renderEditableList("advantages", "Advantages")}
      {renderEditableList("uses", "Uses")}
      {renderEditableList("features", "Features")}
      {renderTaxes()}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="productDescription" style={{ fontWeight: "bold" }}>
          Product Description:
        </label>
        <textarea
          id="productDescription"
          value={editedProduct.productDescription || ""}
          onChange={(e) => handleChange("productDescription", e.target.value)}
          style={{ width: "100%", height: 80, padding: 6 }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="other" style={{ fontWeight: "bold" }}>
          Other:
        </label>
        <textarea
          id="other"
          value={editedProduct.other || ""}
          onChange={(e) => handleChange("other", e.target.value)}
          style={{ width: "100%", height: 60, padding: 6 }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" style={{ flex: 1 }}>Save</button>
        <button type="button" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Cancel</button>
      </div>
    </form>
  );
};

export default EditProduct;
