import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './style/OfferProducts.scss';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;




const OfferProducts = () => {
  const { offerId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [offer, setOffer] = useState({});

   const navigate = useNavigate();

  const dispatch = useDispatch();

useEffect(() => {
  const fetchOfferProducts = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/distributor/offer/products?offerId=${offerId}`,
        {
          credentials: "include", // ✅ Include cookies with request
        }
      );
      if (!response.ok) throw new Error("Failed to fetch offer products");

      const data = await response.json();
      setProducts(data.products || []);
      setOffer(data.offer || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchOfferProducts();
}, [offerId]);

  const handleAddToCart = (product) => {
    if (!product.inStock) return;
    dispatch(addToCart({ ...product, quantity: 1, offers: product.offers, image: product.imageUrl }));
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

 const handleProductClick = (productId) => {
    navigate(`/distributor/product/${productId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isExpired = offer.validTill ? new Date(offer.validTill) < new Date() : false;

  return (
    <div className="offer-products-container">
      <h2 className="title">Products under Offer</h2>

      {offer.description && (
        <p className={`offer-description ${isExpired ? 'expired-offer' : ''}`}>
          {offer.description}
          <span className="valid-till"> (Valid Till: {formatDate(offer.validTill)})</span>
          {isExpired && <span className="expired-label">Expired</span>}
        </p>
      )}

      {loading ? (
        <p className="info-text">Loading products...</p>
      ) : error ? (
        <p className="error-text">Error: {error}</p>
      ) : products.length === 0 ? (
        <p className="info-text">No products found for this offer.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.imageUrl || null}
                alt={product.productName}
                className="product-image"
                 onClick={() => handleProductClick(product._id)}
                 />
              <h3 className="product-name" title={product.productName}
                onClick={() => handleProductClick(product._id)}
              >{product.productName}</h3>
              <p className="units-info">Units per Box: {product.unitsPerBox}</p>
              <div className={`stock ${product.inStock ? 'in' : 'out'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>
              <button
                className="add-to-cart-btn"
                disabled={!product.inStock}
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

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

export default OfferProducts;
