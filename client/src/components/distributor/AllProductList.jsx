import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { motion } from "framer-motion";
import "./style/allproductlist.scss";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AllProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/distributor/getallproducts`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: value,
      }));
    }
  };

  const handleAddToCart = (product) => {
    const qty = parseInt(quantities[product._id], 10) || 1;
    if (!product.inStock || qty < 1) return;

    dispatch(
      addToCart({
        ...product,
        image: product.imageUrl,
        offers: product.offers,
        quantity: qty,
      })
    );

    setOpenSnackbar(true);
    setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  const cardVariants = {
    offscreen: { y: 40, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", bounce: 0.2, duration: 0.6 },
    },
  };

  const buttonVariants = {
    rest: { scale: 1, backgroundColor: "#2e7d32" },
    hover: {
      scale: 1.05,
      backgroundColor: "#4caf50",
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
      backgroundColor: "#1b5e20",
      transition: { duration: 0.1 },
    },
  };

  return (
    <div className="AllProductList-container">
      <div className="title">Product-List</div>
      <div className="product-list">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                className="card"
                key={i}
                style={{
                  flex: "0 0 calc(25% - 1.5rem)",
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "1rem",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{
                    borderRadius: 2,
                    bgcolor: "rgba(46, 125, 50, 0.1)",
                    animationDuration: "1.5s",
                  }}
                />
                <Skeleton
                  variant="text"
                  height={30}
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    bgcolor: "rgba(46, 125, 50, 0.15)",
                    animationDuration: "1.5s",
                  }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{
                    borderRadius: 1,
                    bgcolor: "rgba(46, 125, 50, 0.15)",
                    animationDuration: "1.5s",
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  width="80%"
                  height={36}
                  sx={{
                    mt: 1,
                    borderRadius: 20,
                    bgcolor: "rgba(46, 125, 50, 0.2)",
                    animationDuration: "1.5s",
                  }}
                />
              </div>
            ))
          : products.map((product) => (
              <motion.div
                className="card"
                key={product._id}
                variants={cardVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                style={{
                  flex: "0 0 calc(25% - 1.5rem)",
                  background: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  className="card-left"
                  onClick={() => handleProductClick(product._id)}
                >
                  <img
                    src={product.imageUrl || "/images/default-product.jpg"}
                    alt={product.productName}
                    onError={(e) => {
                      e.target.src = "/default-product.png";
                    }}
                  />
                </div>
                <div className="card-right">
                  <div
                    className="product-name"
                    onClick={() => handleProductClick(product._id)}
                  >
                    {product.productName}
                  </div>

                  {product.unitsPerBox > 0 && (
                    <p className="units-info">
                      Units per Box: {product.unitsPerBox}
                    </p>
                  )}

                  <span
                    className={
                      product.inStock ? "text-green-600" : "text-red-600"
                    }
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>

                  <div className="quantity-cart-group">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="quantity-input"
                      value={quantities[product._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product._id, e.target.value)
                      }
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) {
                          setQuantities((prev) => ({
                            ...prev,
                            [product._id]: 1,
                          }));
                        }
                      }}
                    />
                    <motion.button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className="add-to-cart-button"
                      variants={buttonVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Add To Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

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

export default AllProductList;
