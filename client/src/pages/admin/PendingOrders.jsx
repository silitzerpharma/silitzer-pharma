import "./style/Pages.scss";
import PendingOrdersTable from "../../components/admin/tables/PendingOrdersTable";

const PendingOrders = () => {
 
  return (
    <div className="page">
      <div className="page-title">
         Pending Orders
      </div>

      <PendingOrdersTable />
    </div>
  );
};

export default PendingOrders;
