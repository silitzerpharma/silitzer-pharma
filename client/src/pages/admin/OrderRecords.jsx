import './style/OrderRecords.scss';
import { useState, useEffect } from 'react';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const OrderRecords = () => {
  const [orders, setOrders] = useState([]);
  const [productsSearch, setProductsSearch] = useState("");
  const [distributorsSearch, setDistributorsSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("All");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndtDate] = useState("");
  const [search, setSearch] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const handleSearch = () => {
    setPage(1); // reset to first page on new search
    setSearch(prev => !prev);
  };
useEffect(() => {
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/order/records?page=${page}&limit=10&startdate=${startdate}&enddate=${enddate}&status=${statusSearch}&distributor=${distributorsSearch}&product=${productsSearch}`, {
        method: "GET",
        credentials: "include", // ✅ include cookies
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error("Failed to load orders:", data.message);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  fetchOrders();
}, [search, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };


const handleDownload = () => {
  const params = new URLSearchParams({
    startdate,
    enddate,
    status: statusSearch,
    distributor: distributorsSearch,
    product: productsSearch
  });

  const downloadUrl = `${BASE_URL}/admin/order/download-records?${params.toString()}`;
  window.open(downloadUrl, "_blank");
};




  return (
    <div className='OrderRecords'>
      <div className='OrderRecords-title'>Order Records</div>

      <div className='OrderRecords-filter'>
        <div className='filter-date'>
          <span>Date:</span>
          <input type="date" value={startdate} onChange={(e) => setStartDate(e.target.value)} />
          <span>To</span>
          <input type="date" value={enddate} onChange={(e) => setEndtDate(e.target.value)} />
        </div>

        <div className='filter-Status'>
          <span>Status:</span>
          <select value={statusSearch} onChange={(e) => setStatusSearch(e.target.value)}>
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

        <div className='filter-products'>
          <span>Products:</span>
          <input
            type="text"
            value={productsSearch}
            onChange={(e) => setProductsSearch(e.target.value)}
            placeholder="Search by product name/code"
          />
        </div>

        <div className='filter-distributors'>
          <span>Distributors:</span>
          <input
            type="text"
            value={distributorsSearch}
            onChange={(e) => setDistributorsSearch(e.target.value)}
            placeholder="Search by username"
          />
        </div>

        <div className='filter-search'>
          <button onClick={handleSearch}>Search</button>
          <div className='filter-download' onClick={handleDownload}>
          <DownloadForOfflineIcon/>
        </div>
        </div>
        
      </div>

      <div className='OrderRecords-table'>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom className='table-title'>
            <span>
              <strong>Date:</strong> {startdate ? formatDateDisplay(startdate + "T00:00:00Z") : "start"} to {enddate ? formatDateDisplay(enddate + "T00:00:00Z") : "end"}
            </span>&nbsp;&nbsp;
            <span><strong>Status:</strong> {statusSearch || "All"}</span>&nbsp;&nbsp;
            <span><strong>Products:</strong> {productsSearch || "All"}</span>&nbsp;&nbsp;
            <span><strong>Distributors:</strong> {distributorsSearch || "All"}</span>
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order Id</strong></TableCell>
                  <TableCell><strong>Distributor</strong></TableCell>
                  <TableCell><strong>Order Date</strong></TableCell>
                  <TableCell><strong>Order Status</strong></TableCell>
                  <TableCell><strong>Payment Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No orders found</TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.distributor?.username || "N/A"}</TableCell>
                      <TableCell>{formatDateDisplay(order.orderDate)}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.paymentStatus}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default OrderRecords;
