import OrdersTable from '../../components/admin/tables/OrdersTable';
import './style/Pages.scss'


const AdminOrders = () => {


  return (
    <div className="page">
        <div className="page-title">
          Orders
          </div>
      


      <div className="orders-table">
        <OrdersTable/>
      </div>
    </div>
  );
};

export default AdminOrders;
