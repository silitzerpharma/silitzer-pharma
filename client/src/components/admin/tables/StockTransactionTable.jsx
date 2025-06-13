import './StockTransactionTable.scss';
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination
} from '@mui/material';

const StockTransactionTable = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // yyyy-mm-dd

  const [searchDate, setSearchDate] = useState(formattedDate);
  const [searchProduct, setSearchProduct] = useState('');

  const [inStockData, setInStockData] = useState([]);
  const [inPage, setInPage] = useState(0);
  const [inRowsPerPage, setInRowsPerPage] = useState(10);
  const [inTotalCount, setInTotalCount] = useState(0);

  const [outStockData, setOutStockData] = useState([]);
  const [outPage, setOutPage] = useState(0);
  const [outRowsPerPage, setOutRowsPerPage] = useState(10);
  const [outTotalCount, setOutTotalCount] = useState(0);

  const handleChangeDate = (e) => setSearchDate(e.target.value);
  const handleChangeProduct = (e) => setSearchProduct(e.target.value);

  // When clicking Search button, reset pages and fetch both lists
  const handleSearch = () => {
    setInPage(0);
    setOutPage(0);
    fetchInStock(0, inRowsPerPage);
    fetchOutStock(0, outRowsPerPage);
  };

  // Pagination handlers for in-stock
  const handleInPageChange = (_, newPage) => {
    setInPage(newPage);
    fetchInStock(newPage, inRowsPerPage);
  };
  const handleInRowsPerPageChange = (e) => {
    const rows = parseInt(e.target.value, 10);
    setInRowsPerPage(rows);
    setInPage(0);
    fetchInStock(0, rows);
  };

  // Pagination handlers for out-stock
  const handleOutPageChange = (_, newPage) => {
    setOutPage(newPage);
    fetchOutStock(newPage, outRowsPerPage);
  };
  const handleOutRowsPerPageChange = (e) => {
    const rows = parseInt(e.target.value, 10);
    setOutRowsPerPage(rows);
    setOutPage(0);
    fetchOutStock(0, rows);
  };

  // Fetch functions for in-stock and out-stock
 const fetchInStock = async (page = inPage, limit = inRowsPerPage) => {
  try {
    const params = new URLSearchParams();
    if (searchDate) params.append('date', searchDate);
    if (searchProduct) params.append('query', searchProduct);
    params.append('page', page + 1); // backend expects 1-based page
    params.append('limit', limit);

    const res = await fetch(
      `http://localhost:3000/admin/stocktransaction/instock?${params.toString()}`,
      {
        credentials: 'include' // ✅ Include cookies (auth token/session)
      }
    );
    const result = await res.json();
    setInStockData(result.data || []);
    setInTotalCount(result.totalCount || 0);
  } catch (err) {
    console.error('In-stock fetch error:', err);
  }
};


const fetchOutStock = async (page = outPage, limit = outRowsPerPage) => {
  try {
    const params = new URLSearchParams();
    if (searchDate) params.append('date', searchDate);
    if (searchProduct) params.append('query', searchProduct);
    params.append('page', page + 1); // backend is 1-based
    params.append('limit', limit);

    const res = await fetch(
      `http://localhost:3000/admin/stocktransaction/outstock?${params.toString()}`,
      {
        credentials: 'include' // ✅ Required for session/cookie-based auth
      }
    );

    const result = await res.json();
    setOutStockData(result.data || []);
    setOutTotalCount(result.totalCount || 0);
  } catch (err) {
    console.error('Out-stock fetch error:', err);
  }
};


  // On mount, fetch initial data
  useEffect(() => {
    fetchInStock();
    fetchOutStock();
  }, []);

  return (
    <div className="StockTransactionTable">
      <div className="stock-table-search">
        <span>Search Stock-Transaction By-</span>
        <div>
          <strong>Date:</strong>
          <input type="date" value={searchDate} onChange={handleChangeDate} />
        </div>
        <div>
          <strong>Product:</strong>
          <input type="text" value={searchProduct} onChange={handleChangeProduct} placeholder="name, code" />
        </div>
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* In-Stock Table */}
      <div className="stock-div">
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <div className="date-header">
            <span><strong>Date:</strong> {searchDate || 'all'}</span>
            <span><strong>Product:</strong> {searchProduct || 'all'}</span>
          </div>
          <div className="stock-table-title">In-Stock</div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Quantity Change</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Order Number</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inStockData.map((stock) => (
                <TableRow key={stock._id}>
                  <TableCell>{stock.productName}</TableCell>
                  <TableCell>{stock.quantityChange}</TableCell>
                  <TableCell>{stock.reason}</TableCell>
                  <TableCell>{stock.orderNumber || 'N/A'}</TableCell>
                  <TableCell>{new Date(stock.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {inStockData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={inTotalCount}
            page={inPage}
            onPageChange={handleInPageChange}
            rowsPerPage={inRowsPerPage}
            onRowsPerPageChange={handleInRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </div>

      {/* Out-Stock Table */}
      <div className="stock-div">
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <div className="stock-table-title">Out-Stock</div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product Name</strong></TableCell>
                <TableCell><strong>Quantity Change</strong></TableCell>
                <TableCell><strong>Reason</strong></TableCell>
                <TableCell><strong>Order Number</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outStockData.map((stock) => (
                <TableRow key={stock._id}>
                  <TableCell>{stock.productName}</TableCell>
                  <TableCell>{stock.quantityChange}</TableCell>
                  <TableCell>{stock.reason}</TableCell>
                  <TableCell>{stock.orderNumber || 'N/A'}</TableCell>
                  <TableCell>{new Date(stock.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {outStockData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">No records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={outTotalCount}
            page={outPage}
            onPageChange={handleOutPageChange}
            rowsPerPage={outRowsPerPage}
            onRowsPerPageChange={handleOutRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </div>
    </div>
  );
};

export default StockTransactionTable;
