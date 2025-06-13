import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import "./style/SearchResultsPage.scss";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SearchResultsPage = () => {
  const dispatch = useDispatch();
  const [searchProducts, setSearchProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search).get("query");

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await fetch(`${BASE_URL}/distributor/searchProducts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ query }),
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          setSearchProducts(data);
        } else {
          setSearchProducts([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (query && query.trim() !== "") {
      fetchSearchResults();
    } else {
      setLoading(false);
      setSearchProducts([]);
    }
  }, [query]);

  const handleAddToCart = (product) => {
    if (!product.inStock) return;
    const productToAdd = { ...product, quantity: 1, image: product.imageUrl };
    dispatch(addToCart(productToAdd));
  };

  const handleProductClick = (productId) => {
  navigate(`/distributor/product/${productId}`);
  };

  return (
    <div className="search-results-page">
      {loading ? (
        <p>Loading...</p>
      ) : searchProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="search-div">
          <h2>Search Results</h2>
          <ul className="search-product-card-list">
            {searchProducts.map((product) => (
              <li key={product._id} className="search-product-card">
                <div className="img" onClick={() => handleProductClick(product._id)}>
                  <img src={product.imageUrl || "/placeholder.png"} alt={product.productName} />
                </div>

                <div className="details">
                  <div className="title" onClick={() => handleProductClick(product._id)}>
                    {product.productName}
                  </div>
                  <div className="units-per-box">
                    Units per box: <strong>{product.unitsPerBox || "N/A"}</strong>
                  </div>
                  <div
                    className={`stock-status ${product.inStock ? "in-stock" : "out-of-stock"}`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </div>
                </div>

                <div className="card-btn">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
