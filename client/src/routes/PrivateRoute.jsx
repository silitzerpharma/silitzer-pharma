import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
  const user = useSelector((state) => state.user.user);

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();

  if (!role || !allowedRoles.includes(role)) {
    // Optionally redirect to login or a safe page
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
