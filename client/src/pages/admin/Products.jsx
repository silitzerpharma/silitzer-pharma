import "./style/Pages.scss";
import { useState, useEffect } from "react";
import ProductsTable from "../../components/admin/tables/ProductsTable";
import AddProduct from "../../components/admin/form/AddProduct";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Products = () => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);

  const toggleAddProduct = () => {
    setIsAddingProduct(!isAddingProduct);
  };

  const refreshProductList = () => setRefreshFlag((prev) => !prev);

  // 🔁 Fetch product count on mount and refresh
  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/products/data`, {
          method: "GET",
          credentials: "include", // Required to include cookies/session
        });
        const data = await res.json();
        setTotalProducts(data.totalCount || 0); // Adjust key if needed
      } catch (err) {
        console.error("Failed to fetch product count:", err);
      }
    };

    fetchProductCount();
  }, [refreshFlag]); // refetch on refresh

  return (
    <div className="page">
      <div className="page-title">Products</div>

      <div className="page-nav">
        <button className="add-products-btn" onClick={toggleAddProduct}>
          {isAddingProduct ? "View Products" : "Add New"}
        </button>
        <div>
          Total Products: {totalProducts}
        </div>
      </div>

      {isAddingProduct ? (
        <AddProduct refreshProductList={refreshProductList} />
      ) : (
        <ProductsTable refreshFlag={refreshFlag} refreshProductList={refreshProductList} />
      )}
    </div>
  );
};

export default Products;
