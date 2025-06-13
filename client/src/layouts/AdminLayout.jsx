import './adminlayout.css'
import { Outlet } from "react-router-dom";

import AdminNavbar from '../components/admin/navbar/AdminNavbar';
import LeftNavbar from '../components/admin/navbar/LeftNavbar';

const AdminLayout = () => {
  return (
    <div className="admin-main-screen">
  
    <AdminNavbar />
   
    <main className="admin-cantain">
      <div className='left-navbar-cantain' >
         <LeftNavbar/>
      </div>
     

      <div className="admin-main-cantain">
       <Outlet/>
      </div>
    </main>
  
  </div>
  )
}

export default AdminLayout