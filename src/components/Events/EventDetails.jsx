import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    isLoading,
    isError: queryIsError,
    error: queryError,
  } = useQuery({
    queryKey: ["events", { id: id }],
    queryFn: ({ signal, queryKey }) =>
      fetchEvent({ id: queryKey[1].id, signal }),
    enabled: !!id, // null check
  });

  const {
    mutate,
    isPending: mutatePending,
    isError: mutateIsError,
    error: mutateError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none", // برای اینکه همان لحظه دیتا را فچ نکند و فقط هنگامی که همچین کلیدی نیاز بود داده های آن را بگیرد
      });

      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }
  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: id });
  }

  let content = <h3>Event</h3>;

  if (isLoading) {
    content = (
      <div>
        <LoadingIndicator />
      </div>
    );
  }

  if (queryIsError) {
    content = (
      <ErrorBlock
        title="errorrrrrr"
        message={queryError.info?.message || "failed"}
      />
    );
  }

  if (data) {
    console.log(data);
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        {mutateIsError && (
          <ErrorBlock
            title="mutateError"
            message={mutateError.info?.message || "failed"}
          />
        )}
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            <button onClick={handleStopDelete} className="button-text">
              Cancel
            </button>
            <button
              disabled={mutatePending}
              onClick={handleDelete}
              className="button"
            >
              {mutatePending ? "pending..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
