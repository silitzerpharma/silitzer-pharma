import React, { useState, useEffect, useCallback } from 'react';
import './orders.scss';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SORT_OPTIONS = [
  { label: 'Date Asc', value: 'date_asc' },
  { label: 'Date Desc', value: 'date_desc' },
  { label: 'Status Asc', value: 'status_asc' },
  { label: 'Status Desc', value: 'status_desc' },
];

const STATUS_OPTIONS = [
  'All',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('date_desc');

  // Debounce search input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(1); // reset page on search/filter change
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch orders with filters/sorting applied
  const fetchOrders = useCallback(async () => {
    try {
      // Build query params
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (debouncedQuery) params.append('search', debouncedQuery);
      if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedSort) params.append('sort', selectedSort);

      const url = `${BASE_URL}/distributor/getallorders?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      setTotalPages(1);
    }
  }, [currentPage, debouncedQuery, selectedStatus, selectedSort]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="modern-orders-container">
      <h2>Orders</h2>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Search Order Number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={selectedSort}
          onChange={(e) => {
            setSelectedSort(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="no-orders">No orders found.</p>
        ) : (
          orders.map((order, index) => {
            const isExpanded = index === expandedIndex;
            return (
              <div key={order._id || index} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="order-summary" onClick={() => toggleExpand(index)}>
                  <div>
                    <strong>Order #:</strong> {order.orderNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div>
                    <strong>Payment:</strong>{' '}
                    <span className={order.paymentStatus === 'Completed' ? 'paid' : 'pending'}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-details">
                    <div className="products">
                      <strong>Products:</strong>
                      <ul>
                        {order.productList.map((p) => (
                          <li key={p._id}>
                            {p.productId?.productName || 'Unknown'} - Qty: {p.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="status-history">
                      <strong>Status History:</strong>
                      <ul>
                        {order.statusHistory?.length ? (
                          order.statusHistory.map((entry, i) => (
                            <li key={i}>
                              {entry.status} - {new Date(entry.changedAt).toLocaleString()}
                            </li>
                          ))
                        ) : (
                          <li>No history available</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="pagination-controls">
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;
