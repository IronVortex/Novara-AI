import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { MyContext } from "../../context/MyContext.jsx";
import Loader from "./Loader.jsx";

/** Auth pages only — redirect signed-in users into the workspace. */
function GuestRoute() {
  const { isAuthenticated, authReady } = useContext(MyContext);

  if (!authReady) {
    return (
      <div className="auth-loading">
        <Loader loading label="Checking session..." />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/app" replace /> : <Outlet />;
}

export default GuestRoute;
