import { useQuery } from "@tanstack/react-query";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../utils/http.js";

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,

    // staleTime: catching control
    // gc: catching control
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="errrorrrr"
        message={error.info?.message || "failed to fetch"}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}

// // HTTP REQUEST
// export async function fetchEvents({ searchTerm, signal }) {
//   console.log("fetchEvents", searchTerm);
//   let url = "http://localhost:3000/events";

//   if (searchTerm) {
//     url += "?search=" + searchTerm;
//   }

//   console.log("url", url);

//   const response = await fetch(url, { signal: signal });

//   if (!response.ok) {
//     const error = new Error("An error occurred while fetching the events");
//     error.code = response.status;
//     error.info = await response.json();
//     throw error;
//   }

//   const { events } = await response.json();

//   return events;
// }
