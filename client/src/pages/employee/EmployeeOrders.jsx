import React, { useEffect, useState, useRef, useCallback } from "react";
import "./style/EmployeeOrders.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmployeeOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const observer = useRef();

  const lastOrderRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, currentPage, totalPages]
  );

 const fetchOrders = useCallback(async () => {
  setLoading(true);

  const params = new URLSearchParams();
  if (searchText.trim()) params.append("search", searchText.trim());
  if (filterStatus !== "All") params.append("status", filterStatus);
  if (selectedDate) params.append("date", selectedDate);
  params.append("page", currentPage);
  params.append("limit", 5);

  try {
    const res = await fetch(
      `${BASE_URL}/employee/orders?${params.toString()}`,
      {
        method: "GET",
        credentials: "include", // ✅ Include cookies (auth/session)
      }
    );

    const data = await res.json();

    if (currentPage === 1) {
      setOrders(data.data);
    } else {
      setOrders((prev) => [...prev, ...data.data]);
    }

    setTotalPages(data.totalPages);
  } catch (err) {
    console.error("Error fetching orders:", err);
  }

  setLoading(false);
}, [searchText, filterStatus, selectedDate, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus, selectedDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleProductList = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="employee-orders">
      <div className="employee-orders-top">
        <div className="employee-orders-title">Order List</div>

        <div className="employee-order-table-search">
          <div className="filter-orders">
            <label>View Orders: </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Hold">Hold</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <input
            className="employee-order-search"
            type="text"
            placeholder="Search by Distributor, Order ID, Product..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {orders.length === 0 && !loading ? (
        <div className="no-orders">No orders found.</div>
      ) : (
        orders.map((order, index) => {
          const isLast = index === orders.length - 1;
          return (
            <div
              ref={isLast ? lastOrderRef : null}
              key={index}
              className="order-card"
            >
              <div className="order-info">
                <div>
                  <strong>Order ID:</strong> {order.orderNumber}
                </div>
                <div>
                  <strong>Distributor:</strong> {order.distributor}
                </div>
                <div>
                  <strong>Order Date:</strong>{" "}
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Status:</strong> {order.status}
                </div>
                <button onClick={() => toggleProductList(index)}>
                  {expandedOrderId === index ? "Hide Products" : "View Products"}
                </button>
              </div>

              {expandedOrderId === index && (
                <div className="product-list">
                  <h4>Products:</h4>
                  <ul>
                    {order.productList.map((product, i) => (
                      <li key={i}>
                        <span>
                          <strong>Name:</strong> {product.productName}
                        </span>
                        <span>
                          <strong>Quantity:</strong> {product.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })
      )}

      {loading && <div className="loading">Loading...</div>}
    </div>
  );
};

export default EmployeeOrders;
