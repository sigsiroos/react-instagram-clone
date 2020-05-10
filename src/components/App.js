import React, { useState } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, HttpLink, InMemoryCache } from "apollo-boost";
import { setContext } from "apollo-link-context";
import { Switch, Route } from "react-router-dom";
import "../styles/App.css";
import Header from "./Header";
import Feed from "./Feed";
import Post from "./Post";
import Profile from "./Profile";
import SecuredRoute from "./SecuredRoute";
import Upload from "./Upload";
import { useAuth0 } from "../auth/react-auth0-wrapper";


function App() {
  const { isAuthenticated, user } = useAuth0();

  // used state to get accessToken through getTokenSilently(), the component re-renders when state changes, thus we have
  // our accessToken in apollo client instance.
  const [accessToken, setAccessToken] = useState("");

  const { getTokenSilently, loading } = useAuth0();
  if (loading) {
    return "Loading...";
  }

  // get access token
  const getAccessToken = async () => {
    // getTokenSilently() returns a promise
    try {
      const token = await getTokenSilently();
      setAccessToken(token);
      console.log(token);
    } catch (e) {
      console.log(e);
    }
  };
  getAccessToken();

  // for apollo client
  const httpLink = new HttpLink({
    uri: "https://instagram-clone-postgres.herokuapp.com/v1/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    const token = accessToken;
    if (token) {
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      };
    } else {
      return {
        headers: {
          ...headers,
        },
      };
    }
  });

  const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <ApolloProvider client={client}>
      <Header />
      {isAuthenticated && <Upload />}
      <Switch>
        <Route exact path="/" component={Feed} />
        <Route path={"/post/:id"} component={Post} />
        <SecuredRoute path={"/user/:id"} component={Profile} />
      </Switch>
    </ApolloProvider>
 );
}

export default App;
