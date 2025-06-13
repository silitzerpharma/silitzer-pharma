import React, { useState, useEffect } from 'react';
import './style/Pages.scss';

import StockTable from '../../components/admin/tables/StockTable';

const Stock = () => {
  const [refreshFlag, setRefreshFlag] = useState(false);


 

  const refreshProductList = () => setRefreshFlag((prev) => !prev);



  return (
    <div className='page'>
        <div className="page-title">Stock</div>



      <StockTable refreshFlag={refreshFlag}  refreshProductList={refreshProductList} />
    </div>
  );
};

export default Stock;
