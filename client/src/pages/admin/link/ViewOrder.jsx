import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./style/ViewOrder.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ViewOrder = () => {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/order?id=${params.id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch order details");
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) return <div className="view-order">Loading...</div>;
  if (error) return <div className="view-order error">Error: {error}</div>;
  if (!order) return <div className="view-order">No order found.</div>;

  return (
    <div className="view-order">
      <h2>Order Details</h2>

      <section className="section grid-two">
        <div><strong>Order Number:</strong> {order.orderNumber}</div>
        <div><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</div>
        <div><strong>Status:</strong> {order.status}</div>
        <div><strong>Payment Status:</strong> {order.paymentStatus}</div>
        <div><strong>Distributor:</strong> {order.distributor?.username || "N/A"}</div>
        <div><strong>Subtotal:</strong> ₹{order.subtotal}</div>
        <div><strong>Net Amount:</strong> ₹{order.netAmount}</div>
        <div><strong>Received Amount:</strong> ₹{order.receivedAmount}</div>
        <div><strong>Total Purchase Cost:</strong> ₹{order.totalPurchaseCost}</div>
      </section>

      <section className="section">
        <h3>Instructions</h3>
        <p>{order.orderInstructions || "None"}</p>
      </section>

      <section className="section">
        <h3>Product List</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {order.productList?.map((item, index) => (
              <tr key={index}>
                <td>{item.productId?.productName || "Unnamed Product"}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section">
        <h3>Status History</h3>
        <ul>
          {order.statusHistory?.map((entry, index) => (
            <li key={index}>
              <strong>{entry.status}</strong> at {new Date(entry.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ViewOrder;
