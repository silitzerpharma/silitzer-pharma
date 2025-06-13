import React, { useEffect, useState } from 'react';
import './style/DistributorOrderTable.scss';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  Chip, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText,
  TablePagination, TableSortLabel
} from '@mui/material';

const headCells = [
  { id: 'order_id', label: 'Order ID', width: 100 },
  { id: 'order_date', label: 'Order Date', width: 120 },
  { id: 'order_status', label: 'Order Status', width: 120 },
  { id: 'payment_status', label: 'Payment Status', width: 130 },
  { id: 'products', label: 'Products', width: 150 }
];

const DistributorOrderTable = ({ distributorId }) => {
  const [orderData, setOrderData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [sortField, setSortField] = useState('order_date');  // default sorting field
  const [sortOrder, setSortOrder] = useState('desc');        // 'asc' or 'desc'

  const handleViewProducts = (products) => {
    setSelectedProducts(products);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProducts([]);
  };

const fetchDistributorData = async (page, limit, sortField, sortOrder) => {
  try {
    const res = await fetch(
      `http://localhost:3000/admin/distributor?id=${distributorId}&page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}`,
      {
        method: "GET",
        credentials: "include", // ✅ Send cookies for authentication
      }
    );

    const data = await res.json();
    setOrderData(data.orders);
    setTotalCount(data.totalCount);
  } catch (err) {
    console.error("Order fetch error:", err);
  }
};


  useEffect(() => {
    fetchDistributorData(page, limit, sortField, sortOrder);
  }, [page, limit, sortField, sortOrder]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = sortField === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(property);
    setPage(0);
  };

  return (
    <div className='DistributorOrderTable'>
      <TableContainer component={Paper}>
        <Typography variant="h5" sx={{ m: 2 }} className='title'>Orders</Typography>
        <Table>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={{ width: headCell.width }}
                  sortDirection={sortField === headCell.id ? sortOrder : false}
                >
                  {headCell.id !== 'products' ? (
                    <TableSortLabel
                      active={sortField === headCell.id}
                      direction={sortField === headCell.id ? sortOrder : 'asc'}
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
            {orderData.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{order.order_status}</TableCell>
                <TableCell>{order.payment_status}</TableCell>
                <TableCell>
                  <Chip
                    label="View Products"
                    color="primary"
                    clickable
                    onClick={() => handleViewProducts(order.products_list)}
                  />
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
          rowsPerPage={limit}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Products</DialogTitle>
        <DialogContent>
          <List>
            {selectedProducts.map((product, idx) => (
              <ListItem key={idx}>
                <ListItemText
                  primary={product.product_name}
                  secondary={`Quantity: ${product.quantity}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DistributorOrderTable;
