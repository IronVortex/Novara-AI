import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";

function ProtectedRoute() {
  const { isAuthenticated, authReady } = useContext(MyContext);

  if (!authReady) {
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
