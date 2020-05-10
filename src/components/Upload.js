import React, { useState } from "react";
import "../styles/App.css";
import { gql } from "apollo-boost";
import { useMutation } from "@apollo/react-hooks";
import { Container, Modal, Button, Row } from "react-bootstrap";
import { useAuth0 } from "../auth/react-auth0-wrapper";
import { POST_LIST } from "./Feed.js";
import { USER_INFO } from "./Profile.js";

const SUBMIT_POST = gql`
  mutation($url: String!, $userId: String!, $caption: String!) {
    insert_Post(objects: { url: $url, caption: $caption, user_id: $userId }) {
      affected_rows
    }
  }
`;

function Upload() {
  const [modalShow, setModalShow] = useState(false);

  const { user } = useAuth0();

  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const [submitPost] = useMutation(SUBMIT_POST, {
    onCompleted: () => {
      setCaption("");
      setUrl("");
    },
    onError: (e) => {
      console.log(error);
      setError(error.toString());
    }
  });

  function openModal() {
    setModalShow(true);
  }

  function handleUrlChange(event) {
    const { value } = event.target;
    setUrl(value);
  }

  function handleCaptionChange(event) {
    const { value } = event.target;
    setCaption(value);
  }

  function closeModal() {
    setModalShow(false);
  }

  function handleSubmit(event, userId) {
    event.preventDefault();
    submitPost({
      variables: { caption, userId, url },
      refetchQueries: [
        { query: POST_LIST },
        { query: USER_INFO, variables: { id: userId } },
      ],
    });
  }

  return (
    <>
      <button
        className="button-nodec post-upload-button"
        onClick={openModal}
      />

      <Modal
        show={modalShow}
        onHide={closeModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <form
              onSubmit={(e) => {
                handleSubmit(e, user.sub);
              }}
            >
              <Row>
                <span>Image Url (file upload is not supported currently):</span>
              </Row>
              <Row>
                <input
                  value={url}
                  onChange={handleUrlChange}
                  type="text"
                />
              </Row>
              <Row>
                <span>Caption:</span>
              </Row>
              <Row>
                <input
                  value={caption}
                  onChange={handleCaptionChange}
                  type="text"
                />
              </Row>
              <Row>
                <Button
                  variant="outline-dark"
                  className="profile-logout top-padding"
                  type="submit"
                  value="Submit"
                  onClick={closeModal}
                >
                  Submit
                </Button>
              </Row>
              {error}
            </form>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Upload;
