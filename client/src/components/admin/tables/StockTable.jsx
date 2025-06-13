import './style/Table.scss'
import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TableSortLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Select, MenuItem, FormControl,
  InputLabel, Typography, TextField
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const StockTable = ({ refreshFlag, refreshProductList }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('productName');
  const [stockData, setStockData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inStock, setInStock] = useState(true);

  const [editStockId, setEditStockId] = useState(null);
  const [editedStockValue, setEditedStockValue] = useState('');

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const headCells = [
    { id: 'productName', label: 'Product Name' },
    { id: 'pendingOrderCount', label: 'Pending Orders' },
    { id: 'stock', label: 'Stock' },
    { id: 'stockNeeds', label: 'Stock Needs' },
    { id: 'inStock', label: 'For Distributors' },
    { id: 'manageStock', label: 'Manage Stock' },
  ];

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/getstockdata?page=${page}&limit=${rowsPerPage}&sortBy=${orderBy}&order=${order}&search=${searchTerm}`,
        {
          credentials: 'include' // ✅ Include cookies for session/auth
        }
      );
      const data = await res.json();
      setStockData(data.products);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Error fetching stock data:", err);
    }
  };

  fetchProducts();
}, [page, rowsPerPage, order, orderBy, refreshFlag, searchTerm]);

  const handleDistributorStockClick = (product) => {
    setSelectedProduct(product);
    setInStock(product.inStock);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    setInStock(true);
  };

  const handleInStockChange = (event) => setInStock(event.target.value);

 const handleSaveStockStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/admin/updatestockstatus`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Important for sending cookies
      body: JSON.stringify({ inStock, productId: selectedProduct._id }),
    });

    if (!res.ok) {
      alert('Failed to update stock status');
    } else {
      refreshProductList();
      alert('Stock status updated successfully');
    }
  } catch (error) {
    alert('Error updating stock status');
  }
  handleDialogClose();
};


  const handleEditStockClick = (product) => {
    setEditStockId(product._id);
    setEditedStockValue(product.stock.toString());
  };

  const handleStockInputChange = (event) => setEditedStockValue(event.target.value);

const handleSaveStockClick = async (productId) => {
  const newStock = parseInt(editedStockValue, 10);
  if (isNaN(newStock) || newStock < 0) {
    alert('Enter a valid non-negative stock value');
    return;
  }
  try {
    const res = await fetch(`${BASE_URL}/admin/updatestock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Ensures cookies (auth) are sent
      body: JSON.stringify({
        newStock,
        productId,
        reason: "Manual update"
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Failed: ${data.msg || 'Unknown error'}`);
    } else {
      refreshProductList();
      alert('Stock updated successfully');
    }
  } catch (error) {
    alert('Error updating stock');
  }
  setEditStockId(null);
  setEditedStockValue('');
};


  return (
    <div className="table">
      <div className="table-filter">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="center"
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {['productName', 'stock', 'inStock', 'pendingOrderCount', 'stockNeeds'].includes(headCell.id) ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {stockData.map((product) => (
              <TableRow key={product._id}>
                <TableCell align="center">{product.productName}</TableCell>
                <TableCell align="center">{product.pendingOrderCount}</TableCell>
                <TableCell align="center">
                  {editStockId === product._id ? (
                    <TextField
                      value={editedStockValue}
                      onChange={handleStockInputChange}
                      type="number"
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    product.stock
                  )}
                </TableCell>
                <TableCell align="center">{product.stockNeeds}</TableCell>
                <TableCell
                  align="center"
                  style={{ cursor: 'pointer', color: '#1976d2' }}
                  onClick={() => handleDistributorStockClick(product)}
                  title="Click to edit stock status for distributors"
                >
                  <Typography color={product.inStock ? "green" : "red"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {editStockId === product._id ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleSaveStockClick(product._id)}
                    >
                      Save Stock
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => handleEditStockClick(product)}
                    >
                      Update Stock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>For Distributors product stock</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="in-stock-label">Stock Status</InputLabel>
            <Select
              labelId="in-stock-label"
              value={inStock}
              label="Stock Status"
              onChange={handleInStockChange}
            >
              <MenuItem value={true}>In Stock</MenuItem>
              <MenuItem value={false}>Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveStockStatus} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StockTable;
