import './style/Table.scss'
import React, { useState, useEffect } from 'react';
import ViewDistributors from '../View/ViewDistributors';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel
} from "@mui/material";

const DistributorsTable = () => {
  const [selectedDistributorId, setSelectedDistributorId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('distributorId');
  const [searchTerm, setSearchTerm] = useState('');
  const [distributorsList, setDistributorsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [refreshFlag, setRefreshFlag] = useState(false);


  const refreshDistributorsList = () => setRefreshFlag((prev) => !prev);

useEffect(() => {
  const fetchDistributors = async () => {
    try {
      const url = new URL('http://localhost:3000/admin/getalldistributors');
      url.searchParams.append('page', page + 1);
      url.searchParams.append('limit', rowsPerPage);
      url.searchParams.append('sortField', orderBy);
      url.searchParams.append('sortOrder', order);
      if (searchTerm.trim() !== '') {
        url.searchParams.append('search', searchTerm.trim());
      }

      const response = await fetch(url.toString(), {
        credentials: 'include', // ✅ Include cookies for session auth
      });

      const result = await response.json();
      setDistributorsList(result.data);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error("Error fetching distributors:", err);
    }
  };

  fetchDistributors();
}, [refreshFlag, page, rowsPerPage, orderBy, order, searchTerm]);

  const handleRowClick = (id) => {
    setSelectedDistributorId(id);
  };

  const handleCloseDetails = () => {
    setSelectedDistributorId(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    let aValue, bValue;

    if (orderBy === 'distributorId') {
      aValue = a.refId?.distributorId || '';
      bValue = b.refId?.distributorId || '';
    } else if (orderBy === 'addDate') {
      aValue = new Date(a.refId?.date_registered || 0);
      bValue = new Date(b.refId?.date_registered || 0);
    } else {
      aValue = a[orderBy];
      bValue = b[orderBy];
    }

    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortedDistributors = [...distributorsList].sort(getComparator(order, orderBy));

  const headCells = [
    { id: 'distributorId', label: 'Distributor ID' },
    { id: 'username', label: 'Name' },
    { id: 'addDate', label: 'Add Date' },
    { id: 'totalOrders', label: 'Total Orders' },
    { id: 'pendingOrders', label: 'Pending Orders' },
    { id: 'paymentStatus', label: 'Payment Status' }
  ];

  const selectedDistributor = distributorsList.find(dist => dist._id === selectedDistributorId);

  return (
    <div className="table">
      

      {selectedDistributorId ? (
        <ViewDistributors
          distributor={selectedDistributor}
          onClose={handleCloseDetails}
          refreshDistributorsList={refreshDistributorsList}
        />
      ) : (
        <>
        <div className="table-filter" >
        <input
          type="text"
          placeholder="Search by Id, name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '300px', fontSize: '1rem' }}
        />
  
      </div>
          <TableContainer component={Paper} className="table-container">
            <Table aria-label="distributors table">
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
                {sortedDistributors.map((dist) => (
                  <TableRow key={dist._id} hover onClick={() => handleRowClick(dist._id)}>
                    <TableCell align="center">{dist.refId?.distributorId || 'N/A'}</TableCell>
                    <TableCell align="center">{dist.username}</TableCell>
                    <TableCell align="center">
                      {dist.refId?.date_registered
                        ? new Date(dist.refId.date_registered).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell align="center">{dist.totalOrders}</TableCell>
                    <TableCell align="center">{dist.pendingOrders}</TableCell>
                    <TableCell align="center">
                      <span className={`payment ${dist.paymentStatus}`}>
                        {dist.paymentStatus}
                      </span>
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
        </>
      )}
    </div>
  );
};

export default DistributorsTable;
