import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CalendarEventModal from '../../calendar/CalendarEventModal';
import CalendarView from '../../../components/features/calendar/CalendarView';

import {
  getStructureEvents,
  createStructureEvent,
  updateStructureEvent,
  deleteStructureEvent,
  getTasks,
  Event,
  Task,
} from '../../../lib/api/api';

// Simple date utility functions
const startOfMonth = (date: Date) => {
  // Use UTC methods to avoid timezone issues
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

const endOfMonth = (date: Date) => {
  // Use UTC methods to avoid timezone issues
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
};

const eachDayOfInterval = (start: Date, end: Date) => {
  const days = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
};

const isSameDay = (date1: Date, date2: Date) => {
  // Simple date comparison using local date components
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const date1String = getDateString(date1);
  const date2String = getDateString(date2);

  console.log('isSameDay comparison:', {
    date1: date1.toISOString(),
    date2: date2.toISOString(),
    date1String,
    date2String,
    isSame: date1String === date2String,
  });

  return date1String === date2String;
};

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const subMonths = (date: Date, months: number) => {
  return addMonths(date, -months);
};

const format = (date: Date, formatStr: string) => {
  if (formatStr === 'MMMM yyyy') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (formatStr === 'd') {
    // Use UTC date to avoid timezone issues
    return date.getUTCDate().toString();
  }
  return date.toLocaleDateString();
};

const StructureCalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { structureId } = useParams();

  useEffect(() => {
    loadData();
  }, [structureId]);

  // Debug effect to log events when they change
  useEffect(() => {
    console.log('Events state updated:', events);
  }, [events]);

  const loadData = async () => {
    try {
      console.log('Loading calendar data...');
      const tasksData = await getTasks();
      setTasks(tasksData);
      if (!structureId) {
        setEvents([]);
      } else {
        const eventsData = await getStructureEvents(structureId);
        console.log('Loaded events:', eventsData);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.startDate));
    setModalOpen(true);
  };

  const handleSave = async (
    eventData: Omit<Event, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      console.log('Saving event with data:', eventData);
      if (!structureId) return;
      if (editingEvent) {
        await updateStructureEvent(structureId, editingEvent._id, eventData);
      } else {
        const newEvent = await createStructureEvent(structureId, eventData);
        console.log('Created new event:', newEvent);
      }

      setModalOpen(false);
      console.log('Reloading data...');
      await loadData();

      // Force a re-render by updating currentDate slightly
      setCurrentDate((prev) => new Date(prev.getTime()));
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async (event: Event) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        if (!structureId) return;
        await deleteStructureEvent(structureId, event._id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval(monthStart, monthEnd);

  console.log('Calendar month range:', {
    currentDate: currentDate.toISOString(),
    monthStart: monthStart.toISOString(),
    monthEnd: monthEnd.toISOString(),
    calendarDaysCount: calendarDays.length,
  });

  const getEventsForDate = (date: Date) => {
    const eventsForDate = events.filter((event) => {
      const eventDate = new Date(event.startDate);
      const isSame = isSameDay(eventDate, date);

      // Debug logging only when there are events to compare
      if (events.length > 0) {
        console.log('Event date comparison:', {
          eventTitle: event.title,
          eventDate: event.startDate,
          eventDateObj: eventDate.toISOString(),
          calendarDate: date.toISOString(),
          isSame: isSame,
        });
      }

      return isSame;
    });

    return eventsForDate;
  };

  const getEventTypeColor = (type: Event['type']) => {
    return type === 'Task'
      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const getCalendarStats = () => {
    const totalEvents = events.length;
    const taskEvents = events.filter((e) => e.type === 'Task').length;
    const regularEvents = events.filter((e) => e.type !== 'Task').length;
    const todayEvents = events.filter((e) =>
      isSameDay(new Date(e.startDate), new Date())
    ).length;

    return { totalEvents, taskEvents, regularEvents, todayEvents };
  };

  const stats = getCalendarStats();

  return (
    <>
      <CalendarView
        displayMonth={format(currentDate, 'MMMM yyyy')}
        calendarDays={calendarDays}
        stats={stats}
        onPrevMonth={() => navigateMonth('prev')}
        onNextMonth={() => navigateMonth('next')}
        onAddEvent={() => handleDateClick(new Date())}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        eventsForDate={getEventsForDate}
        getEventTypeColor={getEventTypeColor}
        isSameDay={isSameDay}
      />

      {/* Event Modal */}
      <CalendarEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={editingEvent ? () => handleDelete(editingEvent) : undefined}
        event={editingEvent}
        selectedDate={selectedDate}
        tasks={tasks}
      />
    </>
  );
};

export default StructureCalendarPage;
