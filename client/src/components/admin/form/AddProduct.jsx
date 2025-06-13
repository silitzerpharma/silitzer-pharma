import "./addproduct.scss";
import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddProduct = ({ refreshProductList }) => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [other, setOther] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [stock, setStock] = useState("");
  const [unitsPerBox, setUnitsPerBox] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [advantages, setAdvantages] = useState([""]);
  const [features, setFeatures] = useState([""]);
  const [uses, setUses] = useState([""]);
  const [howToUse, setHowToUse] = useState([""]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [taxes, setTaxes] = useState([{ name: "", rate: "" }]);



  const handleChange = (setter, index, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  const handleTaxChange = (index, field, value) => {
    setTaxes((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddTaxField = () => {
    setTaxes((prev) => [...prev, { name: "", rate: "" }]);
  };

  const handleSpecificationChange = (index, field, value) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddSpecification = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl("");
    }
  };

  const resetForm = () => {
    setProductName("");
    setProductDescription("");
    setOther("");
    setItemRate("");
    setBatchNumber("");
    setExpiryDate("");
    setManufactureDate("");
    setHsnCode("");
    setPurchaseRate("");
    setStock("");
    setUnitsPerBox("");
    setImageFile(null);
    setImagePreviewUrl("");
    setManufacturer("");
    setCountryOfOrigin("");
    setAdvantages([""]);
    setFeatures([""]);
    setUses([""]);
    setHowToUse([""]);
    setSpecifications([{ key: "", value: "" }]);
    setTaxes([{ name: "", rate: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let base64Image = "";
    let imageName = imageFile?.name || "";

    if (imageFile) {
      try {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
        });
      } catch (err) {
        console.error("Failed to read image file:", err);
        alert("Image conversion failed");
        return;
      }
    }

    const productDetails = {
      productName,
      productDescription,
      other,
      itemRate,
      batchNumber,
      expiryDate,
      manufactureDate,
      hsnCode,
      purchaseRate,
      stock,
      unitsPerBox,
      imageUrl: "", // will be updated by backend
      manufacturer,
      countryOfOrigin,
      specifications,
      uses,
      advantages,
      howToUse,
      features,
      taxes,
    };

    try {
      const response = await fetch(`${BASE_URL}/admin/addproduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productDetails,
          imageBase64: base64Image,
          imageName: imageName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        refreshProductList();
        alert("Product added successfully!");
        resetForm();
      } else {
        alert(data.msg || "Failed to add product");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("Network error or server not responding.");
    }
  };

  return (
    <div className="addproduct-container">
      <span className="title">
        Add Product <hr />
      </span>

      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-container">
          <div className="left">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Item Rate</label>
              <input type="text" value={itemRate} onChange={(e) => setItemRate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Units Per Box</label>
              <input type="number" min="0" value={unitsPerBox} onChange={(e) => setUnitsPerBox(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreviewUrl && <img src={imagePreviewUrl} alt="preview" style={{ width: 100, marginTop: 10 }} />}
            </div>

            <div className="form-group">
              <label>Manufacturer</label>
              <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Country of Origin</label>
              <input type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Batch Number</label>
              <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" placeholder="YYYY-MM-DD" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Manufacture Date</label>
              <input type="text" placeholder="YYYY-MM-DD" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Specifications</label>
              {specifications.map((spec, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <input type="text" placeholder="Spec Key" value={spec.key} onChange={(e) => handleSpecificationChange(i, "key", e.target.value)} />
                  <input type="text" placeholder="Spec Value" value={spec.value} onChange={(e) => handleSpecificationChange(i, "value", e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={handleAddSpecification}>Add More Specification</button>
            </div>

            <div className="form-group">
              <label>Uses</label>
              {uses.map((val, i) => (
                <input key={i} type="text" value={val} onChange={(e) => handleChange(setUses, i, e.target.value)} />
              ))}
              <button type="button" onClick={() => handleAddField(setUses)}>Add More</button>
            </div>
          </div>

          <div className="right">
            <div className="form-group">
              <label>HSN Code</label>
              <input type="text" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Purchase Rate</label>
              <input type="text" value={purchaseRate} onChange={(e) => setPurchaseRate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>How to Use</label>
              {howToUse.map((val, i) => (
                <input key={i} type="text" value={val} onChange={(e) => handleChange(setHowToUse, i, e.target.value)} />
              ))}
              <button type="button" onClick={() => handleAddField(setHowToUse)}>Add More</button>
            </div>

            <div className="form-group">
              <label>Features</label>
              {features.map((val, i) => (
                <input key={i} type="text" value={val} onChange={(e) => handleChange(setFeatures, i, e.target.value)} />
              ))}
              <button type="button" onClick={() => handleAddField(setFeatures)}>Add More</button>
            </div>

            <div className="form-group">
              <label>Advantages</label>
              {advantages.map((val, i) => (
                <input key={i} type="text" value={val} onChange={(e) => handleChange(setAdvantages, i, e.target.value)} />
              ))}
              <button type="button" onClick={() => handleAddField(setAdvantages)}>Add More</button>
            </div>
          </div>
        </div>

        <div className="form-group tax">
          <label>Taxes</label>
          {taxes.map((tax, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <input type="text" placeholder="Tax Name" value={tax.name} onChange={(e) => handleTaxChange(i, "name", e.target.value)} />
              <input type="text" placeholder="Tax Rate (%)" value={tax.rate} onChange={(e) => handleTaxChange(i, "rate", e.target.value)} />
            </div>
          ))}
          <button type="button" onClick={handleAddTaxField}>Add More Tax</button>
        </div>

        <div className="form-group">
          <label>Product Description</label>
          <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Other</label>
          <textarea value={other} onChange={(e) => setOther(e.target.value)} />
        </div>

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
