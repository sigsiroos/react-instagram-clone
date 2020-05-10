import React, { useState, useRef } from "react";
import "../styles/App.css";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useAuth0 } from "../auth/react-auth0-wrapper";
import { Button } from "react-bootstrap";
import { NUMBER_OF_FOLLOWERS, NUMBER_OF_FOLLOWING } from "./Profile";

const FETCH_FOLLWERS = gql`
  query($followingId: String!, $userId: String!) {
    Follow(
      where: {
        follower_id: { _eq: $userId }
        following_id: { _eq: $followingId }
      }
    ) {
      id
    }
  }
`;

const FOLLOW_USER = gql`
  mutation($followingId: String!, $userId: String!) {
    insert_Follow(
      objects: [{ follower_id: $userId, following_id: $followingId }]
    ) {
      affected_rows
    }
  }
`;

const UNFOLLOW_USER = gql`
  mutation($followingId: String!, $userId: String!) {
    delete_Follow(
      where: {
        follower_id: { _eq: $userId }
        following_id: { _eq: $followingId }
      }
    ) {
      affected_rows
    }
  }
`;

function Follow({ id }) {
  const { isAuthenticated, user } = useAuth0();

  // stores if the currently logged in user has followed the user
  const [followed, setFollowed] = useState(false);
  // using a ref instead of useEffect onMount due to that we want to keep state throughout the session
  const firstRender = useRef(true);
  const userId = useRef(null);

  if (isAuthenticated) {
    userId.current = user.sub;
  } else {
    userId.current = "none";
  }

  const [followUser] = useMutation(FOLLOW_USER, {
    variables: { followingId: id, userId: userId.current },
    refetchQueries: [
      {
        query: FETCH_FOLLWERS,
        variables: { followingId: id, userId: userId.current },
      },
      {
        query: NUMBER_OF_FOLLOWERS,
        variables: { id: id },
      },
      {
        query: NUMBER_OF_FOLLOWING,
        variables: { id: userId.current },
      },
    ],
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    variables: { followingId: id, userId: userId.current },
    refetchQueries: [
      {
        query: FETCH_FOLLWERS,
        variables: { followingId: id, userId: userId.current },
      },
      {
        query: NUMBER_OF_FOLLOWERS,
        variables: { id: id },
      },
      {
        query: NUMBER_OF_FOLLOWING,
        variables: { id: userId.current },
      },
    ],
  });

  const { loading: fetchFollowersLoading, data } = useQuery(FETCH_FOLLWERS, {
    variables: { followingId: id, userId: userId.current },
    onError: (e) => {
      throw new Error (`Error! ${e.message}`)
    },
  });

  if (fetchFollowersLoading) return "Loading...";

  if (firstRender.current) {
    // if current user already follows, set followed to true
    if (data.Follow.length > 0) {
      setFollowed(true);
    }

    firstRender.current = false;
  }

  function handleUnFollowUser() {
    unfollowUser();
    setFollowed(false);
  }

  function handleFollowUser() {
    followUser();
    setFollowed(true);
  }

  return (
    <div className="post-like-container">
      {!followed && (
        <Button
          variant="outline-secondary"
          className="profile-logout"
          onClick={handleFollowUser}
        >
          Follow
        </Button>
      )}
      {followed && (
        <Button
          variant="outline-success"
          className="profile-logout"
          onClick={handleUnFollowUser}
        >
          Following
        </Button>
      )}
    </div>
  );
}

export default Follow;
