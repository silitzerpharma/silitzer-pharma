import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import "./vieworder.scss";

const ViewOrder = ({ order, onBack }) => {


  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockUpdate, setStockUpdate] = useState(false);

  const handleCancelClick = () => {
    setDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/cancelorder", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: order.id,
          updateStock: stockUpdate,
        }),
      });
      if (!response.ok) {
        alert("Failed to cancel order");
      } else {
        alert("Order cancelled");
        onBack();
      }
    } catch (error) {
     
    }

    setDialogOpen(false);
    setStockUpdate(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setStockUpdate(false);
  };

  if (!order) return null;

  // List of statuses for which cancel should be disabled
  const disabledStatuses = ["cancel", "canceled", "Pending", "Delivered","Canceled","Cancel"];
  const isCancelDisabled = disabledStatuses.includes(order.order_status);

  return (
    <div className="view-order">
      <div className="top-order">
        <button onClick={onBack}>
          <CloseIcon sx={{ fontSize: 30 }} />
        </button>
      </div>

      <div className="title">Order Details</div>

      <div className="order-details">
        <div className="left">
          <div className="row">
            <span>Order ID:</span> {order.order_id}
          </div>
          <div className="row">
            <span>Order Date:</span>{" "}
            {new Date(order.order_date).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
          <div className="row">
            <span>Status:</span> {order.order_status}
          </div>
        </div>

        <div className="right">
          <div className="row">
            <span>Distributor:</span> {order.Distributor}
          </div>
          <div className="row">
            <span>Payment Status:</span> {order.payment_status}
          </div>
        </div>
      </div>

      <div className="order-product-list">
        <div className="product-list-title">Product List</div>
        <ul>
          {order.products_list.map((product) => (
            <li key={product.productId} className="product-item">
              <span className="product-name">{product.product_name}</span>
              <span className="product-qty">Quantity: {product.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="viewproduct-ftb-btn">
        <button
          onClick={handleCancelClick}
          disabled={isCancelDisabled}
          style={{
            opacity: isCancelDisabled ? 0.5 : 1,
            cursor: isCancelDisabled ? "not-allowed" : "pointer",
          }}
        >
          Cancel Order
        </button>
      </div>

      {/* Inline Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this order?</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={stockUpdate}
                onChange={(e) => setStockUpdate(e.target.checked)}
                color="primary"
              />
            }
            label="Do you want to restock the canceled items"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            No
          </Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewOrder;
