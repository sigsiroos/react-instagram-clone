import React from "react";
import "../styles/App.css";
import { gql } from "apollo-boost";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import Like from "./Like";
import { timeDifferenceForDate } from "../utils/TimeDifference";
import { Container } from "react-bootstrap";

export const POST_INFO = gql`
  query($id: Int!) {
    Post(where: { id: { _eq: $id } }) {
      id
      caption
      created_at
      url
      user_id
      User {
        avatar
        id
        name
      }
    }
  }
`;

function generatePost(post, index, postId) {
  return (
    <article className="Post" key={index}>
      <header>
        <div className="Post-user">
          <div className="Post-user-avatar">
            <Link to={"/user/" + post.User.id}>
              <img alt={post.User.name} src={post.User.avatar} />
            </Link>
          </div>
          <div className="Post-user-nickname">
            <Link className="anchor-nodec" to={"/user/" + post.User.id}>
              <span>{post.User.name}</span>
            </Link>
          </div>
        </div>
      </header>
      <div className="Post-image">
        <div className="Post-image-bg">
          <img alt={post.caption} src={post.url} />
        </div>
      </div>
      <Like postId={postId} />
      <div className="Post-caption">
        <Link className="anchor-nodec" to={"/user/" + post.User.id}>
          <strong>{post.User.name}</strong>
        </Link>
        &nbsp;{post.caption}
      </div>
      <div className="Post-time">{timeDifferenceForDate(post.created_at)}</div>
    </article>
  );
}

function Post({ id = "", match }) {
  console.log("id, match", id, match);
  const postId = id ? id : match.params.id;

  const { loading, data } = useQuery(POST_INFO, {
    variables: { id: postId },
    onError: (e) => {
      throw new Error (`Error! ${e.message}`);
    },
  });

  if (loading) return "";

  const { Post } = data;

  return (
    <>
      <Container>
        {Post.map((post, index) => generatePost(post, index, postId))}
      </Container>
    </>
  );
}

export default Post;
