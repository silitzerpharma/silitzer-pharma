import "./style/Pages.scss";

import { useState} from "react";

import ProductsTable from "../../components/admin/tables/ProductsTable";
import AddProduct from "../../components/admin/form/AddProduct";

const Products = () => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
 

     const [refreshFlag, setRefreshFlag] = useState(false);

  const toggleAddProduct = () => {
    setIsAddingProduct(!isAddingProduct);
  };


   const refreshProductList = () => setRefreshFlag((prev) => !prev);


 


  return (
    <div className="page">
     
        <div className="page-title">Products</div>
      

      <div className="page-nav">
        <button className="add-products-btn" onClick={toggleAddProduct}>
          {isAddingProduct ? "View Products" : "Add New"}
        </button>
        <div>
          Total Products: 234
        </div>

      </div>
  

      {isAddingProduct ? (
        <AddProduct refreshProductList={refreshProductList} />
      ) : (
        <ProductsTable refreshFlag={refreshFlag} refreshProductList={refreshProductList}  />
      )}
    </div>
  );
};

export default Products;
