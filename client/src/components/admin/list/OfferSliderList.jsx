import { useState, useEffect } from "react";
import "./OfferSliderList.scss";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const OfferSliderList = () => {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [newOffer, setNewOffer] = useState({
    img: "",
    description: "",
    validTill: "",
    productType: "all",
  });
  const [offerList, setOfferList] = useState([]);
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedOfferProducts, setSelectedOfferProducts] = useState([]);
  const [isApplyToAll, setIsApplyToAll] = useState(false);

  useEffect(() => {
    fetchOfferList();
  }, []);

const fetchOfferList = async () => {
  try {
    const response = await fetch("http://localhost:3000/admin/get-offer-List", {
      method: "GET",
      credentials: "include", // ✅ Send cookies (auth/session token)
    });

    const data = await response.json();
    setOfferList(data);
  } catch (err) {
    console.error("Error fetching offers:", err);
  }
};


  const resetForm = () => {
    setNewOffer({ img: "", description: "", validTill: "", productType: "all" });
    setEditOfferId(null);
    setProducts([]);
    setProductInput("");
    setShowOfferForm(false);
    setError("");
  };

  const handleInputChange = (e) => {
    setNewOffer({ ...newOffer, [e.target.name]: e.target.value });
  };

const handleAddProduct = async () => {
  if (!productInput.trim()) return;
  try {
    const res = await fetch(
      `http://localhost:3000/admin/products/check?name=${encodeURIComponent(productInput)}`,
      {
        method: "GET",
        credentials: "include", // ✅ Include cookies (auth/session)
      }
    );

    const data = await res.json();

    if (data.available && data.product) {
      const alreadyExists = products.some((p) => p._id === data.product._id);
      if (!alreadyExists) {
        setProducts([...products, data.product]);
        setProductInput("");
        setError("");
      } else {
        setError("Product already added");
      }
    } else {
      setError("Product not available");
    }
  } catch (err) {
    setError("Server error while checking product");
  }
};


 const handleAddOrEditOfferSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      img: newOffer.img,
      description: newOffer.description,
      validTill: newOffer.validTill,
      products: newOffer.productType === "all" ? [] : products.map((p) => p._id),
      applyToAll: newOffer.productType === "all",
    };

    const url = editOfferId
      ? `http://localhost:3000/admin/edit-offer-slider/${editOfferId}`
      : "http://localhost:3000/admin/save-offer-slider";

    const method = editOfferId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ Send cookies (auth/session)
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Failed to save offer");

    await response.json();
    fetchOfferList();
    resetForm();
  } catch (error) {
    console.error("Error saving offer:", error.message);
  }
};


  const handleEdit = (offer) => {
    setNewOffer({
      img: offer.image || "",
      description: offer.description || "",
      validTill: offer.validTill ? offer.validTill.split("T")[0] : "",
      productType: offer.applyToAll ? "all" : "custom",
    });
    setProducts(offer.products || []);
    setEditOfferId(offer._id);
    setShowOfferForm(true);
  };

 const handleRemove = async (id) => {
  if (!window.confirm("Are you sure you want to delete this offer?")) return;
  try {
    const response = await fetch(`http://localhost:3000/admin/remove-offer-slider/${id}`, {
      method: "DELETE",
      credentials: "include", // ✅ Include cookies (for auth/session)
    });

    if (!response.ok) throw new Error("Failed to delete offer");

    fetchOfferList();
  } catch (err) {
    console.error("Error deleting offer:", err.message);
  }
};


  const handleViewProducts = (offer) => {
    setSelectedOfferProducts(offer.products || []);
    setIsApplyToAll(offer.applyToAll);
    setShowProductDialog(true);
  };

  return (
    <div className="offer-div">
      <div className="Add-offer">
        <button
          onClick={() => {
            resetForm();
            setShowOfferForm(true);
          }}
        >
          {editOfferId ? "Edit Offer" : "Add Offer"}
        </button>
      </div>

      {showOfferForm && (
        <form className="offer-form" onSubmit={handleAddOrEditOfferSubmit}>
          <input
            type="text"
            name="img"
            placeholder="Image URL"
            value={newOffer.img}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Offer Description"
            value={newOffer.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="date"
            name="validTill"
            value={newOffer.validTill}
            onChange={handleInputChange}
          />

          <div className="product-option">
            <label>
              <input
                type="radio"
                name="productType"
                value="all"
                checked={newOffer.productType === "all"}
                onChange={handleInputChange}
              />{" "}
              All Products
            </label>
            <label>
              <input
                type="radio"
                name="productType"
                value="custom"
                checked={newOffer.productType === "custom"}
                onChange={handleInputChange}
              />{" "}
              Custom Products
            </label>
          </div>

          {newOffer.productType === "custom" && (
            <>
              <input
                type="text"
                placeholder="Search Product"
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
              />
              <button type="button" onClick={handleAddProduct}>
                Add Product
              </button>
              {error && <p className="error">{error}</p>}
              <ul className="product-lists">
                {products.map((prod) => (
                  <li key={prod._id}>
                    {prod.productName}
                    <button
                      type="button"
                      onClick={() => setProducts(products.filter((p) => p._id !== prod._id))}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="form-actions">
            <button type="submit">{editOfferId ? "Update Offer" : "Save Offer"}</button>
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="offer-list">
        <div className="title">Offer Slider List</div>
        {offerList.map((offer) => (
          <div className="offer" key={offer._id}>
            <div className="offer-img">
              <img src={offer.image} alt="Offer" />
            </div>
            <div className="offer-info">
              <p className="offer-des">
                <strong>Description:</strong> {offer.description}
              </p>
              <span className="offer-validTill">
                <strong>Valid Till:</strong>{" "}
                {(() => {
                  const d = new Date(offer.validTill);
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  return `${day}/${month}/${year}`;
                })()}
              </span>

              {/* Below valid till, conditionally show button or text */}
              <div style={{ marginTop: "8px" }}>
                {offer.applyToAll ? (
                  <span style={{ fontWeight: "bold", color: "#2a7a2a" }}>
                    Apply to all products
                  </span>
                ) : (
                  <button onClick={() => handleViewProducts(offer)}>Products</button>
                )}
              </div>
            </div>

            <div className="action-btn">
              <button onClick={() => handleEdit(offer)}>Edit</button>
              <button onClick={() => handleRemove(offer._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Offer Products
          <IconButton
            aria-label="close"
            onClick={() => setShowProductDialog(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers style={{ maxHeight: "400px", overflowY: "auto" }}>
          {isApplyToAll ? (
            <p>
              <strong>This offer is applied to all products.</strong>
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {selectedOfferProducts.map((prod, index) => (
                <div
                  key={prod._id || index}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                    background: "#f9f9f9",
                  }}
                >
                  <p>
                    <strong>{prod.productName || "Unnamed"}</strong>
                  </p>
                  <p style={{ fontSize: "0.9em", color: "#555" }}>
                    {prod.productCode || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferSliderList;
