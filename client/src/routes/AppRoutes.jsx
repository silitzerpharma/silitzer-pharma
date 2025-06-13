// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";

// Private Route
import PrivateRoute from "./PrivateRoute";

// Layouts
import DistributorLayout from "../layouts/DistributorLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import AdminLayout from "../layouts/AdminLayout";

// Fallback loader
const Loader = () => <div>Loading...</div>;

// Lazy-loaded pages
const DistributorDashboard = lazy(() => import("../pages/distributor/DistributorDashboard"));
const Orders = lazy(() => import("../pages/distributor/Orders"));
const DistributorProfile = lazy(() => import("../pages/distributor/DistributorProfile"));
const Cart = lazy(() => import("../components/distributor/Cart"));
const ProductDetails = lazy(() => import("../components/distributor/ProductDetails"));
const AllProductsList = lazy(() => import("../pages/distributor/AllProductsList"));
const OfferProducts = lazy(() => import("../components/distributor/OfferProducts"));
const SearchResultsPage = lazy(() => import("../components/distributor/SearchResultsPage"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const Distributors = lazy(() => import("../pages/admin/Distributors"));
const Employees = lazy(() => import("../pages/admin/Employees"));
const Products = lazy(() => import("../pages/admin/Products"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders"));
const Stock = lazy(() => import("../pages/admin/Stock"));
const PendingOrders = lazy(() => import("../pages/admin/PendingOrders"));
const StockTransaction = lazy(() => import("../pages/admin/StockTransaction"));
const DistributorDashboardSettings = lazy(() => import("../pages/admin/DistributorDashboardsettings"));
const OrderRecords = lazy(() => import("../pages/admin/OrderRecords"));
const AdminProfile = lazy(() => import("../pages/admin/AdminProfile"));
const TodayOrders = lazy(() => import("../pages/admin/TodayOrders"));
const ViewOrder = lazy(() => import("../pages/admin/link/ViewOrder"));

const EmployeeDashboard = lazy(() => import("../pages/employee/EmployeeDashboard"));
const Tasks = lazy(() => import("../pages/employee/Tasks"));
const EmployeeProfile = lazy(() => import("../pages/employee/EmployeeProfile"));
const EmployeeStock = lazy(() => import("../pages/employee/EmployeeStock"));
const EmployeeDistributors = lazy(() => import("../pages/employee/EmployeeDistributors"));
const EmployeeOrders = lazy(() => import("../pages/employee/EmployeeOrders"));
const EmployeeRequests = lazy(() => import("../pages/employee/EmployeeRequests"));
const EmployeeWork = lazy(() => import("../pages/employee/EmployeeWork"));
const EmployeeTodayLogin = lazy(() => import("../pages/employee/EmployeeTodayLogin"));

// Auth pages (typically small, but can still be lazy)
const Login = lazy(() => import("../pages/auth/Login"));
const RoleRedirect = lazy(() => import("../pages/auth/RoleRedirect"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* base Route */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Distributor Routes */}
        <Route element={<PrivateRoute allowedRoles={["distributor"]} />}>
          <Route path="/distributor" element={<DistributorLayout />}>
            <Route index element={<DistributorDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<DistributorProfile />} />
            <Route path="cart" element={<Cart />} />
            <Route path="allproductslist" element={<AllProductsList />} />
            <Route path="product/:productId" element={<ProductDetails />} />
            <Route path="offerproducts/:offerId" element={<OfferProducts />} />
            <Route path="search" element={<SearchResultsPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="employees" element={<Employees />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="stock" element={<Stock />} />
            <Route path="pendingorders" element={<PendingOrders />} />
            <Route path="stocktransaction" element={<StockTransaction />} />
            <Route path="DistributorDashboardSettings" element={<DistributorDashboardSettings />} />
            <Route path="Orderrecords" element={<OrderRecords />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="todayorders" element={<TodayOrders />} />
            <Route path="order/:id" element={<ViewOrder />} />
          </Route>
        </Route>

        {/* Employee Routes */}
        <Route element={<PrivateRoute allowedRoles={["employee"]} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="stock" element={<EmployeeStock />} />
            <Route path="distributors" element={<EmployeeDistributors />} />
            <Route path="orders" element={<EmployeeOrders />} />
            <Route path="requests" element={<EmployeeRequests />} />
            <Route path="work" element={<EmployeeWork />} />
            <Route path="todaylogin" element={<EmployeeTodayLogin />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
