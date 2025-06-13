import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Skeleton from '@mui/material/Skeleton';
import { motion } from "framer-motion";
import "./allproductlist.scss";
import { useNavigate } from 'react-router-dom';

const AllProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const defaultImg = "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-pic-design-profile-vector-png-image_40966566.jpg";

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/distributor/getallproducts", {
        method: "GET",
        credentials: "include", // ✅ Include cookies in request
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

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, image: product.imageUrl,offers:product.offers }));
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  // Animation variants for cards on scroll
  const cardVariants = {
    offscreen: { y: 40, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", bounce: 0.2, duration: 0.6 }
    }
  };

  // Button animation variants
  const buttonVariants = {
    rest: { scale: 1, backgroundColor: "#2e7d32" },
    hover: { scale: 1.05, backgroundColor: "#4caf50", transition: { duration: 0.3 } },
    tap: { scale: 0.95, backgroundColor: "#1b5e20", transition: { duration: 0.1 } }
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
                  flex: '0 0 calc(25% - 1.5rem)',
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '1rem',
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={140}
                  sx={{
                    borderRadius: 2,
                    bgcolor: 'rgba(46, 125, 50, 0.1)', // light green pastel bg
                    animationDuration: '1.5s'
                  }}
                />
                <Skeleton
                  variant="text"
                  height={30}
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(46, 125, 50, 0.15)',
                    animationDuration: '1.5s'
                  }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{
                    borderRadius: 1,
                    bgcolor: 'rgba(46, 125, 50, 0.15)',
                    animationDuration: '1.5s'
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  width="80%"
                  height={36}
                  sx={{
                    mt: 1,
                    borderRadius: 20,
                    bgcolor: 'rgba(46, 125, 50, 0.2)',
                    animationDuration: '1.5s'
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
                  flex: '0 0 calc(25% - 1.5rem)',
                  background: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div className="card-left" onClick={() => handleProductClick(product._id)}>
                  <img src={product.imageUrl || defaultImg} alt={product.productName} />
                </div>
                <div className="card-right">
                  <div className="product-name" onClick={() => handleProductClick(product._id)}>
                    {product.productName}
                  </div>
                  <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
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
              </motion.div>
            ))}
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          Product added to cart!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AllProductList;
