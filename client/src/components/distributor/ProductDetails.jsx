import { useParams } from "react-router-dom";
import "./style/productdetails.scss";
import "swiper/css";
import "swiper/css/navigation";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductDetails = () => {
  const [count, setCount] = useState(1);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Specifications");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [offers, setOffers] = useState([]);

  const dispatch = useDispatch();

  const tabs = [
    "Specifications",
    "Description",
    "Advantages",
    "Features",
    "How to Use",
    "Uses",
    "Other",
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/distributor/product/${productId}`,
        {
          credentials: "include", // ✅ Ensures cookies (e.g., auth token) are sent
        }
      );
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  fetchProduct();
}, [productId]);

  const handleAddToCart = () => {
    if (count > 0 && product) {
      dispatch(addToCart({ ...product, quantity: count, offers,image: product.imageUrl }));
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  if (!product) {
    return <div className="loading-message">Loading product...</div>;
  }

  return (
    <div className="product-detalis-Container">
      <div className="product-header">
        <div className="right">
          <img src={product.imageUrl} alt={product.productName} />
        </div>
        <div className="left">
          <div className="product-name">{product.productName}</div>

          {/* ✅ Offers Section */}
          {offers.length > 0 && (
            <div className="product-offers">
              <strong>Available Offers:</strong>
              <ul className="offer-list">
                {offers.map((offer, i) => (
                  <li key={i}>
                    {offer.description}
                    {offer.validTill && (
                      <span className="valid-till">
                        {" "}
                        (Valid till: {formatDate(offer.validTill)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="date-info">
            <div>
              <strong>Expiry Date:</strong> {formatDate(product.expiryDate)}
            </div>
            <div>
              <strong>Manufacture Date:</strong>{" "}
              {formatDate(product.manufactureDate)}
            </div>
          </div>
          <div className="batch-hsn">
            <div>
              <strong>BatchNumber:</strong> {product.batchNumber}
            </div>
            <div>
              <strong>HsnCode:</strong> {product.hsnCode}
            </div>
          </div>
          <div className="unitsPerBox">
            <strong>unitsPerBox:</strong> {product.unitsPerBox}
          </div>
          <div
            className={`stock-status ${
              product.inStock ? "in-stock" : "out-of-stock"
            }`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </div>
          <div className="add-to-cart">
            <input
              type="number"
              id="productCount"
              name="productCount"
              value={count}
              min={1}
              placeholder="Qty"
              onChange={(e) => setCount(Number(e.target.value))}
            />
            <button
              className="add-cart"
              disabled={!product.inStock || count < 1}
              onClick={handleAddToCart}
            >
              Add TO Cart
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="product-details">
        <div className="product-details-nav flex space-x-4 cursor-pointer">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1 rounded ${
                selectedTab === tab
                  ? "bg-blue-500 text-white active-product-nav"
                  : "bg-gray-200"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="product-details-more mt-4 space-y-2">
          {selectedTab === "Description" && product.productDescription && (
            <p className="text-sm text-gray-700">
              {product.productDescription}
            </p>
          )}
          {selectedTab === "Advantages" &&
            product.advantages?.map((adv, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {adv}
              </p>
            ))}
          {selectedTab === "Features" &&
            product.features?.map((f, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {f}
              </p>
            ))}
          {selectedTab === "How to Use" &&
            product.howToUse?.map((h, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {h}
              </p>
            ))}
          {selectedTab === "Uses" &&
            product.uses?.map((u, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {u}
              </p>
            ))}
          {selectedTab === "Specifications" &&
            product.specifications?.map(({ key, value }, i) => (
              <p key={i} className="text-sm text-gray-700">
                • {key}: {value}
              </p>
            ))}
          {selectedTab === "Other" && <p>{product.other}</p>}
        </div>
      </div>

      {/* Snackbar for Add to Cart */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Product added to cart!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductDetails;
