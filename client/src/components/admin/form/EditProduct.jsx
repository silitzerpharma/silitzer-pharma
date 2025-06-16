import "./style/editproduct.scss";
import React, { useState } from "react";
import Loader from "../../common/Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditProduct = ({ product, setIsEditing, refreshProductDetails, setMsgData }) => {
  const [editedProduct, setEditedProduct] = useState({ ...product, imageDeleteFlag: false });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(product.imageUrl || "");

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(file);
      setEditedProduct((prev) => ({ ...prev, imageDeleteFlag: false }));
    }
  };

  const handleArrayChange = (field, index, value, subfield = null) => {
    const updated = [...editedProduct[field]];
    subfield ? (updated[index][subfield] = value) : (updated[index] = value);
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
              value={tax.rate ?? ""}
              onChange={(e) => handleArrayChange("taxes", index, e.target.value, "rate")}
              style={{ width: 80 }}
            />
            <button type="button" onClick={() => handleRemoveItem("taxes", index)}>❌</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => handleAddItem("taxes", { name: "", rate: "" })}>
        ➕ Add Tax
      </button>
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
      <button type="button" onClick={() => handleAddItem("specifications", { key: "", value: "" })}>
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

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = { ...editedProduct };

      if (imageFile) {
        const base64 = await toBase64(imageFile);
        productData.imageBase64 = base64;
        productData.imageName = imageFile.name;
      }

      const response = await fetch(`${BASE_URL}/admin/product/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsgData({
          show: true,
          status: 400,
          message: data.msg || "Failed to update product",
          warnings: Array.isArray(data.warnings) ? data.warnings : [],
        });
        return;
      }

      setMsgData({
        show: true,
        status: 200,
        message: data.msg || "Product updated successfully",
        warnings: Array.isArray(data.warnings) ? data.warnings : [],
      });

      refreshProductDetails();
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      setMsgData({
        show: true,
        status: 400,
        message: "Network error. Please try again.",
        warnings: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="updating product details..." />;

  return (
    <div className="edit-product">
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
        {renderInput("unitsPerBox", "Units Per Box", "number")}
        {renderInput("countryOfOrigin", "Country of Origin")}
        {renderInput("manufacturer", "Manufacturer")}
        {renderInput("manufactureDate", "Manufacture Date", "date")}

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {imagePreviewUrl && !editedProduct.imageDeleteFlag && (
            <div style={{ marginTop: 10 }}>
              <img
                src={imagePreviewUrl}
                alt="preview"
                style={{ width: 100, borderRadius: 4, display: "block", marginBottom: 6 }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreviewUrl("");
                  setImageFile(null);
                  setEditedProduct((prev) => ({ ...prev, imageDeleteFlag: true }));
                }}
              >
                ❌ Remove Image
              </button>
            </div>
          )}
        </div>

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
    </div>
  );
};

export default EditProduct;
