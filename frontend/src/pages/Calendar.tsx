import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <>
      <PageMeta
        title="React.js Calendar Dashboard"
        description="Simple Calendar without events"
      />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="custom-calendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            selectable={false} // tidak bisa select
            editable={false}  // tidak bisa drag/drop
          />
        </div>
      </div>
    </>
  );
};

export default Calendar;
