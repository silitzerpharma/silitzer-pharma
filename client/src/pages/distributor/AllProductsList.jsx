import './style/AllProductsList.scss';
import React, { useState, useEffect } from 'react';
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
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom'; // ✅ New import

const AllProductsList = () => {
  const [productsList, setProductsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('productName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Navigation hook

  // ✅ Navigate to product details
  const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  // ✅ Fetch products from API
const fetchProducts = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      `http://localhost:3000/distributor/get-all-product-list?page=${page}&limit=${rowsPerPage}&orderBy=${orderBy}&order=${order}`,
      {
        method: "GET",
        credentials: "include", // ✅ Send cookies (like auth token)
      }
    );

    const data = await response.json();
    setProductsList(data.items || []);
    setTotalCount(data.total || 0);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    setProductsList([]);
    setTotalCount(0);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, order, orderBy]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product,offers:product.offers ,image: product.imageUrl }));
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const headCells = [
    { id: 'productName', label: 'Product Name' },
    { id: 'stock', label: 'Stock' },
    { id: 'actions', label: 'Actions' },
  ];

  return (
    <div className="allproductslist-con">
      <div className="title">All Products List</div>

      <div className="products-table">
        <TableContainer component={Paper} className="table-container">
          <Table aria-label="products table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align="center"
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.id !== 'actions' ? (
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : productsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                productsList.map((product, index) => (
                  <TableRow key={`${product.productName}-${index}`}>
                    {/* ✅ Make product name clickable */}
                    <TableCell
                      align="center"
                      style={{ cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
                      onClick={() => handleProductClick(product._id)}
                    >
                      {product.productName}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: product.inStock ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        Add to Cart
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
            showFirstButton
            showLastButton
          />
        </TableContainer>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Product added to cart!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AllProductsList;
