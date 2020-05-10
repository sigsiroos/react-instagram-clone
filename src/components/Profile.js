import { useQuery } from "@apollo/react-hooks";
import React from "react";
import { withRouter } from "react-router";
import { Container, Row, Col, Button } from "react-bootstrap";
import { gql } from "apollo-boost";
import { useAuth0 } from "../auth/react-auth0-wrapper";
import { Link } from "react-router-dom";
import Follow from "./Follow";

export const USER_INFO = gql`
  query($id: String!) {
    User(where: { id: { _eq: $id } }) {
      email
      avatar
      last_seen
      name
      Posts_aggregate {
        aggregate {
          count
        }
      }
    }
    Post(where: { user_id: { _eq: $id } }) {
      url
      caption
      id
    }
  }
`;

export const NUMBER_OF_FOLLOWING = gql`
  query($id: String!) {
    Follow_aggregate(where: { follower_id: { _eq: $id } }) {
      aggregate {
        count
      }
    }
  }
`;

export const NUMBER_OF_FOLLOWERS = gql`
  query($id: String!) {
    Follow_aggregate(where: { following_id: { _eq: $id } }) {
      aggregate {
        count
      }
    }
  }
`;

function Profile({ match }) {
  const { isAuthenticated, logout, user } = useAuth0();

  const isLoggedUser = () => {
    if (user.sub === match.params.id) {
      return true;
    } else {
      return false;
    }
  };

  const { loading: userLoading, data: userInfoData } = useQuery(USER_INFO, {
    variables: { id: match.params.id },
    onError: (e) => {
      return `Error! ${e.message}`;
    },
  });

  const { loading: followersDataLoading, data: followersData } = useQuery(
    NUMBER_OF_FOLLOWERS,
    {
      variables: { id: match.params.id },
      onError: (e) => {
        return `Error! ${e.message}`;
      },
    }
  );

  const { loading: followingDataLoading, data: followingData } = useQuery(
    NUMBER_OF_FOLLOWING,
    {
      variables: { id: match.params.id },
      onError: (e) => {
        return `Error! ${e.message}`;
      },
    }
  );

  if (userLoading || followingDataLoading || followersDataLoading)
    return "Loading...";

  return (
    <>
      <Container className="container">
        <Container className="profile-details">
          {userInfoData.User.map((user, index) => (
            <Row key={index}>
              <Col xs={4}>
                <img
                  className="profile-avatar"
                  alt={user.name}
                  src={user.avatar}
                />
              </Col>
              <Col>
                <Row>
                  <Col className="profile-username" xs="auto">
                    {user.name}
                  </Col>

                  <Col className="profile-logout" xs={4}>
                    {isAuthenticated && (
                      <>
                        {isLoggedUser() && (
                          <>
                            <Button
                              variant="outline-secondary"
                              className="profile-logout"
                              onClick={() => logout()}
                            >
                              Log Out
                            </Button>
                          </>
                        )}
                        {!isLoggedUser() && <Follow id={match.params.id} />}
                      </>
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col className="profile-stats" xs="auto">
                    <strong>{user.Posts_aggregate.aggregate.count}</strong>{" "}
                    posts
                  </Col>
                  <Col className="profile-stats" xs="auto">
                    <strong>
                      {followersData.Follow_aggregate.aggregate.count}
                    </strong>{" "}
                    followers
                  </Col>
                  <Col className="profile-stats" xs="auto">
                    <strong>
                      {followingData.Follow_aggregate.aggregate.count}
                    </strong>{" "}
                    following
                  </Col>
                </Row>
              </Col>
            </Row>
          ))}
        </Container>
        <hr />
        <Row>
          {userInfoData.Post.map((post, index) => (
            <Link to={"/post/" + post.id} key={index}>
              <Col xs={4} className="profile-grid">
                <div class="profile-post-image">
                  <img
                    className="profile-post-image"
                    alt={post.caption}
                    src={post.url}
                  />
                </div>
              </Col>
            </Link>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default withRouter(Profile);
