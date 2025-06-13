import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationDialog from '../../common/ConfirmationDialog';
import Loader from '../../common/Loader';
import './ApproveOrder.scss';

const ApproveOrder = ({ order, onBack, refreshProductList }) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({});
  const [totalPurchaseCost, setTotalPurchaseCost] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [totalTaxAmount, setTotalTaxAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

useEffect(() => {
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/getorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Include cookies/session
        body: JSON.stringify({ id: order.id }),
      });
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      console.error('Error fetching pending orders:', err);
    }
  };

  fetchPendingOrders();
}, [order.id]);

  useEffect(() => {
    if (orderData?.products_list?.length) {
      const itemRateTotal = orderData.products_list.reduce(
        (acc, p) => acc + ((p.itemRate || 0) * (p.quantity || 1)),
        0
      );
      const purchaseRateTotal = orderData.products_list.reduce(
        (acc, p) => acc + ((p.purchaseRate || 0) * (p.quantity || 1)),
        0
      );
      const taxTotal = orderData.products_list.reduce((taxSum, product) => {
        const quantity = product.quantity || 1;
        const itemRate = product.itemRate || 0;
        const productTotal = itemRate * quantity;
        const productTaxTotal = (product.taxes || []).reduce((sum, tax) => {
          const taxRate = tax.rate || 0;
          return sum + (productTotal * taxRate) / 100;
        }, 0);
        return taxSum + productTaxTotal;
      }, 0);

      setSubtotal(itemRateTotal);
      setTotalPurchaseCost(purchaseRateTotal);
      setTotalTaxAmount(taxTotal);
    } else {
      setSubtotal(0);
      setTotalPurchaseCost(0);
      setTotalTaxAmount(0);
    }
  }, [orderData.products_list]);

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...orderData.products_list];
    updatedProducts[index][field] = parseFloat(value) || 0;
    setOrderData({ ...orderData, products_list: updatedProducts });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...orderData.products_list];
    updatedProducts.splice(index, 1);
    setOrderData({ ...orderData, products_list: updatedProducts });
  };

  const proceedWithApprove = async () => {
    const newProductList = Array.isArray(orderData.products_list)
      ? orderData.products_list.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          itemRate: p.itemRate,
          purchaseRate: p.purchaseRate
        }))
      : [];

    const approveOrderData = {
      orderId: orderData.id,
      productList: newProductList,
      subtotal,
      totalPurchaseCost,
      netAmount: Number(netAmount),
      receivedAmount,
    };

    setLoading(true);
    try {
      await fetch('http://localhost:3000/admin/approveorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(approveOrderData),
      });
      setLoading(false);
      onBack();
    } catch (err) {
      console.error('Error approving order:', err);
      setLoading(false);
    }
  };

  const handleApprove = () => {
    document.activeElement?.blur();
    if (!netAmount) {
      setConfirmOpen(true);
    } else {
      proceedWithApprove();
    }
  };

  const handleCancelClick = () => {
    setCancelConfirmOpen(true);
  };

  const handleCancelConfirm = async () => {
    setCancelConfirmOpen(false);
    try {
      await fetch('http://localhost:3000/admin/updateorderstatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId: orderData.id, status: "Cancelled" }),
      });
      alert("Order cancelled");
      onBack();
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  if (loading) return <Loader message={"Please wait, approving order..."} />;

  return (
    <div className="approve-order">
      <div className="top">
        <button onClick={onBack}>
          <CloseIcon sx={{ fontSize: 30 }} />
        </button>
      </div>

      <div className="title">Approve Order</div>

      <div className="approve-order-details">
        <div className="det-1">
          <div><span>Order Number:</span> {orderData.orderNumber}</div>
          <div><span>Distributor:</span> {orderData.distributorName}</div>
          <div><span>Order Date:</span> {new Date(orderData.orderDate).toLocaleString()}</div>
        </div>

        <div className="product-list">
          <h3>Product List</h3>
          <table className="product-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Item Rate (₹)</th>
                <th>Purchase Rate (₹)</th>
                <th>Stock</th>
                <th>Taxes</th>
                {isEditing && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {orderData.products_list?.map((product, index) => (
                <tr key={product.productId}>
                  <td>{product.productName}</td>
                  <td>
                    <input
                      className="input-field"
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      min="0"
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      className="input-field"
                      type="number"
                      value={product.itemRate}
                      onChange={(e) => handleProductChange(index, 'itemRate', e.target.value)}
                      min="0"
                      disabled={!isEditing}
                    />
                  </td>
                  <td>
                    <input
                      className="input-field"
                      type="number"
                      value={product.purchaseRate}
                      onChange={(e) => handleProductChange(index, 'purchaseRate', e.target.value)}
                      min="0"
                      disabled={!isEditing}
                    />
                  </td>
                  <td>{product.stock ?? 0}</td>
                  <td>
                    {product.taxes?.length > 0 ? (
                      <ul>
                        {product.taxes.map((tax) => (
                          <li key={tax._id}>{tax.name} - {tax.rate}%</li>
                        ))}
                      </ul>
                    ) : 'No Taxes'}
                  </td>
                  {isEditing && (
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>₹{subtotal.toFixed(2)}</strong></td>
                <td><strong>₹{totalPurchaseCost.toFixed(2)}</strong></td>
                <td></td>
                <td><strong>₹{totalTaxAmount.toFixed(2)}</strong></td>
                {isEditing && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="Amount">
          <span>
            <strong>Subtotal:</strong>
            <input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </span>
          <span>
            <strong>Total Purchase Cost:</strong>
            <input
              type="number"
              value={totalPurchaseCost}
              onChange={(e) => setTotalPurchaseCost(parseFloat(e.target.value) || 0)}
              disabled={!isEditing}
            />
          </span>
          <span>
            <strong>Net Amount:</strong>
            <input
              type="number"
              value={netAmount}
              onChange={(e) => setNetAmount(e.target.value)}
            />
          </span>
          <span>
            <strong>Received Amount:</strong>
            <input
              type="number"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
            />
          </span>
        </div>
      </div>

      <div className="approve-order-fun-btn">
        {!isEditing ? (
          <>
            <button className="approve" onClick={handleApprove}>Approve</button>
            <button className="edit" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="cancel" onClick={handleCancelClick}>Cancel Order</button>
          </>
        ) : (
          <button className="save" onClick={() => setIsEditing(false)}>Save</button>
        )}
      </div>

      {orderData.orderInstructions && (
  <div className="orderInstructions">
    <div>Order Instructions</div>
    <p>{orderData.orderInstructions }</p>
  </div>
)}

      <ConfirmationDialog
        open={confirmOpen}
        title="Net Amount Missing"
        content="Net Amount is empty. Are you sure you want to continue?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          proceedWithApprove();
        }}
        cancelText="Cancel"
        confirmText="Yes, Proceed"
      />

      <ConfirmationDialog
        open={cancelConfirmOpen}
        title="Cancel Order"
        content="Are you sure you want to cancel the Order?"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={handleCancelConfirm}
        cancelText="No"
        confirmText="Yes, Cancel"
      />
    </div>
  );
};

export default ApproveOrder;
