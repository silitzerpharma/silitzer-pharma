import React, { useState, useEffect } from "react";
import ProductDetailCard from "../../components/employee/ProductDetailCard";
import './style/EmployeeStock.scss';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LIMIT = 10;

const EmployeeStock = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await fetch(
      `${BASE_URL}/employee/products?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        credentials: "include", // ✅ Send cookies like session/auth token
      }
    );
    const data = await response.json();
    setProducts(data.products);
    setTotalPages(data.totalPages);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    setLoading(false);
  }
};

 
  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // reset to first page on new search
  };

  return (
    <div className="EmployeeStock" style={{ maxWidth: 800, margin: "4rem auto", padding: 10 }}>
      {!selectedProduct && (
        <>
          <input
            type="search"
            placeholder="Search by Product Code or Name"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "6px",
              border: "1.8px solid #ccc",
              marginBottom: "20px",
              boxSizing: "border-box",
            }}
          />

          {loading ? (
            <p>Loading products...</p>
          ) : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ backgroundColor: "#007bff", color: "white" }}>
                  <tr>
                    <th style={{ padding: "12px", textAlign: "left" }}>Product Code</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Product Name</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Item Rate</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.productCode}
                        onClick={() => setSelectedProduct(product)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: "transparent",
                        }}
                      >
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{product.productCode}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{product.productName}</td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                          ${product.itemRate?.toFixed(2) ?? "0.00"}
                        </td>
                        <td style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
                          {product.stock ?? 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </button>
                <span style={{ margin: "0 15px" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductDetailCard
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default EmployeeStock;
