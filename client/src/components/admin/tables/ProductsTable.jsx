import React, { useEffect, useState } from 'react';
import ViewProduct from '../View/ViewProduct';

import "./style/Table.scss"

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
  CircularProgress,
} from '@mui/material';

const ProductsTable = ({ refreshFlag, refreshProductList }) => {
  const [productsList, setProductsList] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('productName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `${BASE_URL}/admin/products?page=${page + 1}&limit=${rowsPerPage}&sortField=${orderBy}&sortOrder=${order}&search=${encodeURIComponent(searchTerm)}`,
      {
        credentials: 'include', // ✅ Include cookies for authentication
      }
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const res = await response.json();
    setProductsList(res.data || []);
    setTotalProducts(res.total || 0);
  } catch (err) {
    console.error('Failed to fetch products:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, order, orderBy, searchTerm, refreshFlag]);

  const headCells = [
    { id: 'productCode', label: 'Code' },
    { id: 'productName', label: 'Name' },
    { id: 'batchNumber', label: 'Batch No.' },
    { id: 'expiryDate', label: 'Expiry' },
    { id: 'purchaseRate', label: 'Purchase Rate' },
    { id: 'itemRate', label: 'Price' },
    { id: 'totalOrders', label: 'Total Orders' },
  ];

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (product) => {
    setSelectedProductId(product._id);
    setSelectedProduct(product);
  };

  const handleCloseDetails = () => {
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  return (
    <div className="table">

      {selectedProductId && (
        <ViewProduct
          onClose={handleCloseDetails}
          selectedProduct={selectedProduct}
          refreshProductList={refreshProductList}
        />
      )}

      {!selectedProductId && (<>
           <div className="table-filter">
        <input
          type="text"
          placeholder="Search by Name, Batch, or Code"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0); // reset page on search
          }}
        />
      </div>
       <TableContainer component={Paper} className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <CircularProgress />
            </div>
          ) : (
            <>
              <Table aria-label="products table">
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
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {productsList.length > 0 ? (
                    productsList.map((product, index) => (
                      <TableRow
                        key={`${product._id}-${index}`}
                        onClick={() => handleRowClick(product)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell align="center">{product.productCode ?? '-'}</TableCell>
                        <TableCell align="center">{product.productName}</TableCell>
                        <TableCell align="center">{product.batchNumber || '-'}</TableCell>
                        <TableCell align="center">
                          {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell align="center">
                          ₹{product.purchaseRate !== null ? parseFloat(product.purchaseRate).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell align="center">
                          ₹{product.itemRate !== null ? parseFloat(product.itemRate).toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell align="center">{product.totalOrders ?? 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={totalProducts}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </TableContainer>
      </>)}
    </div>
  );
};

export default ProductsTable;
