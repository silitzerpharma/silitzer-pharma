import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditProduct from "../form/EditProduct";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import "./style/viewproduct.scss";

import ShowMessage from "../../common/ShowMessage";
import Loader from "../../common/Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewProduct = ({ onClose, selectedProduct, refreshProductList ,setMsgDatap }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [product, setProduct] = useState({});
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [error, setError] = useState(null); // Add missing error state

  const [msgData, setMsgData] = useState({
    show: false,
    status: null,
    message: "",
    warnings: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProduct) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/admin/product/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ productId: selectedProduct._id }),
        });

        const data = await response.json();
        if (!response.ok) {
          setMsgData({
            show: true,
            status: 400,
            message: data.msg || "Network error or server not responding.",
            warnings: data.warnings || [],
          });
        }
        setProduct(data);
      } catch (err) {
        setError(err.message);
        console.error("Fetch product error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [refreshFlag, selectedProduct]);

  const refreshProductDetails = () => {
    setRefreshFlag((prev) => !prev);
    refreshProductList();
  };

  const handleRemove = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/product/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId: selectedProduct._id }),
      });

      if (response.ok) {
        setMsgDatap({
          show: true,
          status: 200,
          message: "Product removed successfully",
          warnings: [],
        });

        setOpenConfirm(false);
        refreshProductList();
        onClose(); // Close view after deletion
      } else {
        setMsgData({
          show: true,
          status: 400,
          message: "Failed to remove product",
          warnings:  [],
        });
      }
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  if (loading) return <Loader message="Geting product details..." />;

  return (
    <div className="viewproduct-container">
      {isEditing ? (
        <EditProduct
          setIsEditing={setIsEditing}
          product={product}
          refreshProductDetails={refreshProductDetails}
          setMsgData={setMsgData}
        />
      ) : (
        <>
          <div className="top-close">
            <button onClick={onClose} aria-label="Close product view">
              <CloseIcon />
            </button>
          </div>

          <div className="title">Product Details</div>

          <div className="product-details-div">
            <div className="row-img">
              <img
                src={product.imageUrl || "/images/default-product.jpg"}
                alt="product img"
              />
            </div>

            <div className="row-x2">
              <div>
                <strong>Product Name:</strong> {product.productName}
              </div>
              <div>
                <strong>product Code:</strong> {product.productCode}
              </div>
            </div>
            <div className="row-x2">
              <div>
                <strong>Batch No:</strong> {product.batchNumber}
              </div>
              <div>
                <strong>HSN Code:</strong> {product.hsnCode}
              </div>
            </div>
            <div className="row-x2">
              <div>
                <strong>Purchase Rate:</strong> ₹{product.purchaseRate}
              </div>
              <div>
                <strong>Item Rate:</strong> ₹{product.itemRate}
              </div>
            </div>
            <div className="row-x2">
              <div>
                <strong>Expiry Date:</strong>{" "}
                {product.expiryDate
                  ? new Date(product.expiryDate).toLocaleDateString()
                  : "-"}
              </div>
              <div>
                <strong>Manufacture Date:</strong>{" "}
                {product.manufactureDate
                  ? new Date(product.expiryDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
            <div className="row-x2">
              <div>
                <strong>Manufacturer:</strong> {product.manufacturer}{" "}
              </div>
              <div>
                {" "}
                <strong>Country Of Origin </strong>
                {product.countryOfOrigin}{" "}
              </div>
            </div>
            <div className="row-x2">
              <div>
                <strong>UnitsPerBox:</strong> {product.unitsPerBox}{" "}
              </div>
              <div>
                <strong>Stock:</strong> {product.stock}
              </div>
            </div>
            <div className="row-x2">
              {product.advantages?.length > 0 && (
                <div>
                  <strong>Advantages</strong>
                  <ul className="ul-list">
                    {product.advantages.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.features?.length > 0 && (
                <div>
                  <strong>Features</strong>
                  <ul className="ul-list">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="row-x2">
              {product.uses?.length > 0 && (
                <div>
                  <strong>Uses</strong>
                  <ul className="ul-list">
                    {product.uses.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.howToUse?.length > 0 && (
                <div>
                  <strong>How to Use</strong>
                  <ul className="ul-list">
                    {product.howToUse.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="row-x2">
              {product.specifications?.length > 0 && (
                <div>
                  <strong>Specifications</strong>
                  <ul className="ul-list">
                    {product.specifications.map((spec, i) => (
                      <li key={i}>
                        <strong>{spec.key}:</strong> {spec.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {product.taxes?.length > 0 && (
                <div>
                  <strong>Taxes</strong>
                  <ul className="ul-list">
                    {product.taxes.map((tax, i) => (
                      <li key={i}>
                        <strong>{tax.name}:</strong> {tax.rate}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="row-x2">
              <div>
                <strong>Description:</strong> {product.productDescription}
              </div>
              <div>
                <strong>Other:</strong> {product.other}
              </div>
            </div>
          </div>

          <div className="fun-btn">
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={() => setOpenConfirm(true)}>Remove</button>
          </div>
        </>
      )}

      {msgData.show && (
        <ShowMessage
          status={msgData.status}
          message={msgData.message}
          warnings={msgData.warnings}
          onClose={() => setMsgData({ ...msgData, show: false })}
        />
      )}

      {/* Confirm Deletion Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to remove product{" "}
            <strong>{product.productName}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="error" variant="contained">
            Yes, Remove
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewProduct;
