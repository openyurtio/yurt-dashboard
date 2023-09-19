import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useUserProfile } from "./hooks";

// Routing page accessible only by administrators
const AdminRoute = ({ key, path, render }) => {
  const [userProfile] = useUserProfile();
  return userProfile && userProfile.metadata.name === "admin" ? (
    <Route key={key} path={path} render={render} />
  ) : (
    <Redirect to="/clusterInfo" />
  );
};

export default AdminRoute;
