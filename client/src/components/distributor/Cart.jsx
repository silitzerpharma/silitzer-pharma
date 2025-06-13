import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} from "../../store/slices/cartSlice";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import DeleteIcon from "@mui/icons-material/Delete";
import BackspaceIcon from "@mui/icons-material/Backspace";
import "./style/cart.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const distributor = useSelector((state) => state.user.user.id);
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [orderInstructions, setOrderInstructions] = useState("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setMessage({
        type: "error",
        text: "Cart is empty. Add some products first.",
      });
      return;
    }

    setLoading(true);

    const productList = cart.map(({ _id, productName, quantity }) => ({
      productId: _id,
      productName,
      quantity,
    }));

    const payload = {
      distributor,
      productList,
      instructions: orderInstructions,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/distributor/placeorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ payload }),
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

      const data = await response.json();

      dispatch(clearCart());
      setOrderInstructions("");
      setMessage(null);
      setOpenSuccessDialog(true);
      setSnackbarOpen(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Failed to place order: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

 const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  return (
    <div className="cart-container">
      {cart.length === 0 ? (
        <div className="empty-cart-div">
          <p>Your cart is empty</p>
          <button onClick={() => navigate("/")} className="go-shop-btn">
            Go to Shop
          </button>
        </div>
      ) : (
        <>
          <div className="cart-container-left">
            <div className="cart-header">
              <span>
                {totalItems} item{totalItems !== 1 ? "s" : ""} in your Cart
              </span>
            </div>

            {message && (
              <div
                className={`message ${message.type}`}
                style={{ margin: "10px 0" }}
              >
                {message.text}
              </div>
            )}

            {cart.map((product, index) => (
              <motion.div
                key={product._id}
                className="cart-product"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
              <div className="left" onClick={() => handleProductClick(product._id)}>
  {product.image ? (
    <img src={product.image} alt={product.productName} />
  ) : (
    <div className="no-image-placeholder">No Image</div>
  )}
</div>

                <div className="right">
                  <div className="cart-product-name"
                  onClick={() => handleProductClick(product._id)}
                  >{product.productName}</div>

                  {product.offers && product.offers.length > 0 && (
                    <div className="product-offers">
                      <strong>Offers:</strong>
                      <ul>
                        {product.offers.map((offer, i) => (
                          <li key={i}>
                            {offer.description}
                            {offer.validTill && (
                              <span
                                style={{ fontSize: "0.85em", color: "#777" }}
                              >
                                {" "}
                                (Valid till: {formatDate(offer.validTill)})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="inde">
                    <div className="qty-input">
                      <button
                        className="btn-decrease"
                        onClick={() => dispatch(decreaseQuantity(product._id))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val) || val < 1) return;
                          const diff = val - product.quantity;
                          if (diff > 0) {
                            for (let i = 0; i < diff; i++)
                              dispatch(increaseQuantity(product._id));
                          } else {
                            for (let i = 0; i < -diff; i++)
                              dispatch(decreaseQuantity(product._id));
                          }
                        }}
                      />
                      <button
                        className="btn-increase"
                        onClick={() => dispatch(increaseQuantity(product._id))}
                      >
                        +
                      </button>
                    </div>

                    <DeleteIcon
                      className="remove-icon"
                      style={{ cursor: "pointer" }}
                      onClick={() => dispatch(removeFromCart(product._id))}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="cart-container-right">
            <textarea
              className="order-instructions"
              placeholder="Add order instructions..."
              rows={4}
              value={orderInstructions}
              onChange={(e) => setOrderInstructions(e.target.value)}
            />
            <div className="order-summary">
              <h3>Order Summary</h3>
              <p>
                <strong>Total Products:</strong> {cart.length}
              </p>
              <p>
                <strong>Total Quantity:</strong> {totalItems}
              </p>
            </div>
            <div className="place-order-btn">
              <button onClick={handlePlaceOrder} disabled={loading}>
                {loading ? (
                  <CircularProgress size={22} style={{ color: "white" }} />
                ) : (
                  <>
                    Place Order <ArrowCircleRightIcon />
                  </>
                )}
              </button>
            </div>

            <button className="clear-btn" onClick={() => dispatch(clearCart())}>
              <BackspaceIcon /> Clear Cart
            </button>
          </div>
        </>
      )}

      {/* ✅ Success Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
      >
        <DialogTitle>
          <Typography
            variant="h6"
            component="div"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <CheckCircleOutlineIcon color="success" />
            Your order was placed successfully!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Thank you for your order. You can continue shopping or check your
            orders.
          </Typography>
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <button
              onClick={() => setOpenSuccessDialog(false)}
              className="go-shop-btn"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Snackbar Toast */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Order placed successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Cart;
