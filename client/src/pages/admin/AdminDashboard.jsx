import Widgets from '../../components/admin/charts/Widgets'
import './style/admindashboard.scss'
import Featured from '../../components/admin/charts/Featured'
import Chart from '../../components/admin/charts/Chart'
import StockWidget from '../../components/admin/charts/StockWidget'
import socket from '../../store/socket';
import React, { useState, useEffect } from "react";

import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PostAddIcon from '@mui/icons-material/PostAdd';



const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import Loader from "../../components/common/Loader";



const AdminDashboard = () => {

const [adminData , setAdminData] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchAdminDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/admin/getadmindashboarddata`, {
        method: "GET",
        credentials: "include", // <- This includes cookies in the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setAdminData(data);
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
    }
    finally{
      setLoading(false);
    }
  };

  fetchAdminDashboardData();
}, [refreshTrigger]);


  useEffect(() => {
    socket.on("orderUpdated", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return () => {
      socket.off("orderUpdated");
    };
  }, []);



if (loading) return(
 <div className='AdminDashboard'>

<Loader message="Loading AdminDashboard Data..." />;
 </div>

) 
  
  return (
    <div className='AdminDashboard'>

      {/* <CheckCookies/> */}

     
     <div className="widgets">
      
      <Widgets title={"New Orders"} link={"todayorders"} linktext={"see today orders"} 
      count={adminData.newOrders} icon={ <PostAddIcon className='icon' />} newPercentageChange={adminData.newPercentageChange} />

      <Widgets title={"Pending Orders"} link={"pendingorders"} 
      linktext={"see all pending orders"} count={adminData.Pending_Orders_Count} 
      icon={ <PendingActionsIcon className='icon' />} newPercentageChange={adminData.pendingOrderPercentageChange} />
    


      <StockWidget stockData={adminData.stockData} />
      
      <Widgets/>
     </div>
     <div className='charts' >
        <Featured OrderStatusData={adminData.OrderStatusSummary} />
        <Chart OrderData={adminData.orderChartData}/>
     </div>
  
    </div>
  )
}

export default AdminDashboard