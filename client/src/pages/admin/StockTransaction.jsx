import React, { useState, useEffect } from 'react';
import './style/StockTransaction.scss';
import StockTransactionTable from '../../components/admin/tables/StockTransactionTable';



const StockTransaction = () => {





  return (
    <div className='StockTransaction'>
      <div className="StockTransaction-nav">
        <span className="title">Stock Transaction</span>
      </div>

        <StockTransactionTable />

    </div>
  );
};

export default StockTransaction;
