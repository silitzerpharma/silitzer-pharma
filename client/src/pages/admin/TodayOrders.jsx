import React, { useEffect, useState } from "react";
import "./style/TodayOrders.scss";

const TodayOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/admin/order/today?page=${page}&limit=5`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (err) {
      console.error("Error fetching today orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  return (
    <div className="today-orders-container">
      <h2>📦 Today's Orders</h2>
      {loading ? (
        <div className="loader">Loading...</div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order, index) => (
              <div className="order-card" key={index}>
                <div className="order-header">
                  <div>
                    <strong>Order #{order.orderNumber}</strong>
                    <div className="sub-info">Distributor: {order.distributor}</div>
                  </div>
                  <div className={`status ${order.status.toLowerCase()}`}>{order.status}</div>
                  <button onClick={() => toggleExpand(index)}>
                    {expandedIndex === index ? "Hide Products" : "View Products"}
                  </button>
                </div>
                {expandedIndex === index && (
                  <div className="product-details">
                    {order.productList.map((item, i) => (
                      <div key={i} className="product-item">
                        <span>{item.productName}</span>
                        <span className="quantity">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={handlePrev} disabled={page === 1}>
              ◀ Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={handleNext} disabled={page === totalPages}>
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodayOrders;
