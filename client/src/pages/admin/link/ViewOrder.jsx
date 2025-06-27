import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Alert,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PersonIcon from "@mui/icons-material/Person";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import CloseIcon from '@mui/icons-material/Close';
import "./style/ViewOrder.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewOrder = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockUpdate, setStockUpdate] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/order?id=${params.id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch order details");
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleApproveClick = () => {
    navigate(`/admin/order/approve/${params.id}`);
  };

  const handleCancelClick = () => {
    setDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/cancelorder`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: order._id,
          updateStock: stockUpdate,
        }),
      });
      if (!response.ok) {
        alert("Failed to cancel order");
      } else {
        alert("Order cancelled");
        navigate(-1);
      }
    } catch (error) {
      alert("Error cancelling order");
    } finally {
      setDialogOpen(false);
      setStockUpdate(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setStockUpdate(false);
  };

  const isCancelDisabled = ["cancel", "canceled", "Delivered", "Canceled", "Cancel"].includes(
    order?.status
  );

  if (loading) {
    return (
      <div className="view-order loading">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-order error">
        <Alert severity="error">Error: {error}</Alert>
      </div>
    );
  }

  if (!order) {
    return <div className="view-order">No order found.</div>;
  }

  return (
    <div className="view-order">
      <Typography variant="h4" gutterBottom color="primary">
        <ReceiptIcon sx={{ verticalAlign: "middle", marginRight: "0.5rem" }} />
        Order Details
        {order?.status === "Pending" && (
          <button onClick={handleApproveClick} className="approve-order-btn">
            Approve Order
          </button>
        )}
        <button onClick={handleBack} className="black-btn">
          <CloseIcon sx={{ fontSize: 30 }} />
        </button>
      </Typography>

      <section className="section grid-two">
        <div><AccessTimeIcon /> <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</div>
        <div><LocalMallIcon /> <strong>Status:</strong> {order.status}</div>
        <div><PaymentsIcon /> <strong>Payment:</strong> {order.paymentStatus}</div>
        <div><PersonIcon /> <strong>Distributor:</strong> {order.distributor?.username || "N/A"}</div>
        <div><strong>Subtotal:</strong> ₹{order.subtotal}</div>
        <div><strong>Net Amount:</strong> ₹{order.netAmount}</div>
        <div><strong>Received Amount:</strong> ₹{order.receivedAmount}</div>
        <div><strong>Total Purchase Cost:</strong> ₹{order.totalPurchaseCost}</div>
      </section>

      <section className="section">
        <Typography variant="h6">Instructions</Typography>
        <p>{order.orderInstructions || "None"}</p>
      </section>

      <section className="section">
        <Typography variant="h6">Product List</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.productList?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productId?.productName || "Unnamed Product"}</TableCell>
                <TableCell>{item.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="section">
        <Typography variant="h6">Status History</Typography>
        <ul>
          {order.statusHistory?.map((entry, index) => (
            <li key={index}>
              <strong>{entry.status}</strong> at {new Date(entry.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      {/* Cancel Order Button */}
{order?.status !== "Pending" && order?.status !== "Cancelled" && (
  <div className="viewproduct-ftb-btn">
    <button
      className="cancel-order-btn"
      onClick={handleCancelClick}
      disabled={isCancelDisabled}
    >
      Cancel Order
    </button>
  </div>
)}


      {/* Cancel Order Dialog */}
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
            label="Do you want to restock the canceled items?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">No</Button>
          <Button onClick={handleConfirmCancel} color="primary" autoFocus>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewOrder;
