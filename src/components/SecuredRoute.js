import React from "react";
import { Route } from "react-router-dom";
import { useAuth0 } from "../auth/react-auth0-wrapper";

function SecuredRoute({ component: Component, path }) {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  return (
    <Route
      path={path}
      render={() => {
        if (!isAuthenticated) {
          loginWithRedirect({});
          return <div></div>;
        }
        return <Component />;
      }}
    />
  );
}

export default SecuredRoute;
