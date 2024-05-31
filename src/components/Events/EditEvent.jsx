import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", { id: id }],
    queryFn: ({ signal }) => fetchEvent({ id: id, signal }),
  });

  const {
    mutate,
    isError: mutateIsError,
    error: mutateError,
  } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", { id: id }] });
      const previousEvent = queryClient.getQueryData(["events", { id: id }]);
      queryClient.setQueryData(["events", { id: id }], newEvent);

      return { previousEvent };
    },

    onError: (error, data, context) => {
      queryClient.setQueryData(["events", { id: id }], context.previousEvent);
      // نمایش ارور به کاربر
    },
    onSettled: () => {
      queryClient.invalidateQueries(["events", { id: id }]);
    },
  });

  function handleSubmit(formData) {
    mutate({
      id,
      event: formData,
    });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isLoading) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="failed to load event"
          message={error.into?.message || "failed to fetch data"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
