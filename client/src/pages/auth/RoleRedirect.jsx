import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRedirect = () => {
  const user = useSelector((state) => state.user.user);

  if (!user) return <Navigate to="/login" replace />;

  const role = user.role?.toLowerCase();

  if (!role) return <Navigate to="/login" replace />;

  const validRoles = ['admin', 'distributor', 'employee'];
  if (!validRoles.includes(role)) return <Navigate to="/login" replace />;

  return <Navigate to={`/${role}`} replace />;
};

export default RoleRedirect;
