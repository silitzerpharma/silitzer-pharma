import React, { useState, useEffect } from "react";
import "./style/Table.scss"
import ViewOrder from "../View/ViewOrder";
import socket from "../../../store/socket";
import { Checkbox, FormControlLabel } from "@mui/material";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

const OrdersTable = ({ refreshFlag }) => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [order, setOrder] = useState(null);
  const [orderBy, setOrderBy] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewOrder, setShowViewOrder] = useState(false);
  const [productListDialog, setProductListDialog] = useState(false);
  const [orderStatusDialog, setOrderStatusDialog] = useState(false);
  const [paymentStatusDialog, setPaymentStatusDialog] = useState(false);
  const [updatedOrderStatus, setUpdatedOrderStatus] = useState("");
  const [updatedPaymentStatus, setUpdatedPaymentStatus] = useState("");
  const [selectedView, setSelectedView] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    message: "",
  });
  const [filterDate, setFilterDate] = useState("");
  const [showPending, setShowPending] = useState(false);

  const handleChangeViewBy = (e) => {
    setSelectedView(e.target.value);
    setPage(0);
  };

useEffect(() => {
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/getallorders?page=${page}&limit=${rowsPerPage}&view=${selectedView}&search=${encodeURIComponent(
          searchTerm
        )}&filterDate=${filterDate}&showPending=${showPending}`,
        {
          credentials: 'include', // ✅ Important for sending cookies
        }
      );

      const data = await response.json();
      setOrders(data.orders);
      setTotalOrders(data.totalCount);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  fetchOrders();
}, [refreshTrigger, selectedView, page, rowsPerPage, searchTerm, filterDate, showPending]);

  useEffect(() => {
    socket.on("orderUpdated", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return () => {
      socket.off("orderUpdated");
    };
  }, []);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    return [...array]
      .map((el, index) => ({ el, index }))
      .sort((a, b) => {
        const cmp = comparator(a.el, b.el);
        return cmp !== 0 ? cmp : a.index - b.index;
      })
      .map(({ el }) => el);
  };

  const sortedOrders =
    order && orderBy
      ? stableSort(orders, getComparator(order, orderBy))
      : orders;

  const headCells = [
    { id: "order_id", label: "Order ID" },
    { id: "Distributor", label: "Distributor" },
    { id: "order_date", label: "Order Date" },
    { id: "order_status", label: "Order Status" },
    { id: "payment_status", label: "Payment Status" },
    { id: "products_list", label: "Products" },
  ];

  const handleOrderIdClick = (order) => {
    setSelectedOrder(order);
    setShowViewOrder(true);
  };

  const handleCloseDetails = () => {
    setShowViewOrder(false);
    setSelectedOrder(null);
  };

  const handleProductListClick = (order) => {
    setSelectedOrder(order);
    setProductListDialog(true);
  };

  const handleOrderStatusClick = (order) => {
    setSelectedOrder(order);
    setUpdatedOrderStatus(order.order_status);
    setOrderStatusDialog(true);
  };

  const handlePaymentStatusClick = (order) => {
    setSelectedOrder(order);
    setUpdatedPaymentStatus(order.payment_status);
    setPaymentStatusDialog(true);
  };

  const handleOrderStatusUpdate = async () => {
    const updatedOrder = {
      orderId: selectedOrder.id,
      status: updatedOrderStatus,
    };
    try {
      const response = await fetch(
        `${BASE_URL}/admin/updateorderstatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOrder),
        }
      );
      if (!response.ok) {
        setMessageDialog({
          open: true,
          message: "Failed to update order status",
        });
      } else {
        setMessageDialog({ open: true, message: "Order status updated" });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        message: "Failed to update order. Try again.",
      });
    }
    setOrderStatusDialog(false);
  };

  const handlePaymentStatusUpdate = async () => {
    const updatedOrder = {
      orderId: selectedOrder.id,
      paymentStatus: updatedPaymentStatus,
    };
    try {
      const response = await fetch(
        `${BASE_URL}/admin/updateorderpaymentstatus`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedOrder),
        }
      );
      if (!response.ok) {
        setMessageDialog({
          open: true,
          message: "Failed to update payment status",
        });
      } else {
        setMessageDialog({ open: true, message: "Payment status updated" });
      }
    } catch (error) {
      setMessageDialog({
        open: true,
        message: "Failed to update payment. Try again.",
      });
    }
    setPaymentStatusDialog(false);
  };

  return (
    <div className="table">
      <div className="table-filter">
        <div className="filter-orders">
          <label>View Orders: </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setPage(0);
            }}
          />

          <select value={selectedView} onChange={handleChangeViewBy}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Hold">Hold</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by Distributor, Order ID, Product..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
<FormControlLabel
  control={
    <Checkbox
      checked={showPending}
      onChange={(e) => {
        setShowPending(e.target.checked);
        setPage(0); // Reset pagination
      }}
      color="primary"
    />
  }
  label="Pending Orders"
/>


   
      </div>

      {!showViewOrder ? (
        <>
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="orders table">
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      align="center"
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.map((order) => {
                  const status = order.order_status?.toLowerCase();
                  const isStatusEditable = ![
                    "pending",
                    "cancel",
                    "cancelled",
                    "canceled",
                  ].includes(status);
                  return (
                    <TableRow key={order.order_id}>
                      <TableCell
                        align="center"
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleOrderIdClick(order)}
                      >
                        {order.order_id}
                      </TableCell>
                      <TableCell align="center">{order.Distributor}</TableCell>
                      <TableCell align="center">
                        {new Date(order.order_date).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell
                        align="center"
                        className={`order-status ${order.order_status}`}
                        onClick={() => {
                          if (isStatusEditable) handleOrderStatusClick(order);
                        }}
                        style={{
                          cursor: isStatusEditable ? "pointer" : "default",
                          color: isStatusEditable ? "inherit" : "gray",
                        }}
                      >
                        {order.order_status}
                      </TableCell>
                      <TableCell
                        align="center"
                        className={`payment-status ${order.payment_status}`}
                        onClick={() => handlePaymentStatusClick(order)}
                      >
                        {order.payment_status}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleProductListClick(order)}
                        style={{ cursor: "pointer", color: "#0077cc" }}
                      >
                        Products
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalOrders}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>

          <Dialog
            open={productListDialog}
            onClose={() => setProductListDialog(false)}
          >
            <DialogTitle>Product List</DialogTitle>
            <DialogContent>
              {(selectedOrder?.products_list || []).map((product, index) => (
                <div key={index}>
                  <strong>{product.product_name}</strong> - Quantity:{" "}
                  {product.quantity}
                </div>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setProductListDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={orderStatusDialog}
            onClose={() => setOrderStatusDialog(false)}
          >
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel>Order Status</InputLabel>
                <Select
                  value={updatedOrderStatus}
                  onChange={(e) => setUpdatedOrderStatus(e.target.value)}
                >
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="hold">Hold</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleOrderStatusUpdate}
                disabled={!updatedOrderStatus}
              >
                Update
              </Button>
              <Button onClick={() => setOrderStatusDialog(false)}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={paymentStatusDialog}
            onClose={() => setPaymentStatusDialog(false)}
          >
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={updatedPaymentStatus}
                  onChange={(e) => setUpdatedPaymentStatus(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePaymentStatusUpdate}>Update</Button>
              <Button onClick={() => setPaymentStatusDialog(false)}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={messageDialog.open}
            onClose={() => setMessageDialog({ open: false, message: "" })}
          >
            <DialogTitle>Notification</DialogTitle>
            <DialogContent>{messageDialog.message}</DialogContent>
            <DialogActions>
              <Button
                onClick={() => setMessageDialog({ open: false, message: "" })}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <ViewOrder order={selectedOrder} onBack={handleCloseDetails} />
      )}
    </div>
  );
};

export default OrdersTable;
