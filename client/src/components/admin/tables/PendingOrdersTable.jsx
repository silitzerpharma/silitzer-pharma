import React, { useState, useEffect } from "react";
import "./PendingOrdersTable.scss";
import "./style/Table.scss";
import socket from "../../../store/socket";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
} from "@mui/material";
import ApproveOrder from "../View/ApproveOrder";

const PendingOrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewOrder, setShowViewOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch orders from backend
const fetchPendingOrders = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page,
      limit: rowsPerPage,
      ...(filterDate && { startDate: filterDate }),
      ...(searchQuery && { searchQuery }),
    });

    const response = await fetch(
      `${BASE_URL}/admin/getallpendingorders?${params.toString()}`,
      {
        credentials: 'include', // ✅ Ensures cookies are sent for authentication
      }
    );

    const data = await response.json();
    setOrders(data.orders || []);
    setTotalCount(data.totalCount || 0);
  } catch (err) {
    console.error("Error fetching pending orders:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPendingOrders();
  }, [page, rowsPerPage, filterDate, searchQuery]);

  useEffect(() => {
    socket.on("orderUpdated", () => {
      fetchPendingOrders();
    });
    return () => {
      socket.off("orderUpdated");
    };
  }, []);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOrderIdClick = (order) => {
    setSelectedOrder(order);
    setShowViewOrder(true);
  };

  const handleCloseDetails = () => {
    setShowViewOrder(false);
    setSelectedOrder(null);
  };

  const headCells = [
    { id: "order_id", label: "Order ID" },
    { id: "Distributor", label: "Distributor" },
    { id: "order_date", label: "Order Date" },
    { id: "", label: "Update Order" },
  ];

  return (
    <div className="table">
      <div className="table-filter">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search By Id or Distributor"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {!showViewOrder ? (
        <>
          {loading ? (
            <div className="loading-spinner">
              <CircularProgress />
            </div>
          ) : (
            <TableContainer component={Paper} className="table-container">
              <Table aria-label="orders table">
                <TableHead>
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell key={headCell.id} align="center">
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell align="center" className="id-cell">
                        {order.order_id}
                      </TableCell>
                      <TableCell align="center">{order.Distributor}</TableCell>
                      <TableCell align="center">
                        {new Date(order.order_date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={() => handleOrderIdClick(order)}
                      >
                        <span className="approve-order-cell">
                          approve order
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>
          )}
        </>
      ) : (
        <ApproveOrder order={selectedOrder} onBack={handleCloseDetails} />
      )}
    </div>
  );
};

export default PendingOrdersTable;
