/**
 * Route guards: Buyer vs Seller portal sessions after login.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RequireSellerPortal = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, portal: "seller" }} />;
  }
  if (user.portal !== "seller") {
    return <Navigate to="/demo/home" replace />;
  }
  return <>{children}</>;
};

/** Blocks verified sellers from buyer-only flows (e.g. checkout). Guests allowed. */
export const RequireBuyerPortal = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user?.portal === "seller") {
    return <Navigate to="/demo/dashboard" replace />;
  }
  return <>{children}</>;
};
