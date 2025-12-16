import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from 'lucide-react';
import CalendarEventModal from '../calendar/CalendarEventModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import {
  getEvents,
  getTasks,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
  Task,
} from '../../lib/api/api';

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

const isSameMonth = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
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

  useEffect(() => {
    loadData();
  }, []);

  // Debug effect to log events when they change
  useEffect(() => {
    console.log('Events state updated:', events);
  }, [events]);

  const loadData = async () => {
    try {
      console.log('Loading calendar data...');
      const [eventsData, tasksData] = await Promise.all([
        getEvents(),
        getTasks(),
      ]);
      console.log('Loaded events:', eventsData);
      setEvents(eventsData);
      setTasks(tasksData);
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

      if (editingEvent) {
        await updateEvent(editingEvent._id, eventData);
      } else {
        const newEvent = await createEvent(eventData);
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
        await deleteEvent(event._id);
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
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          {/* Header */}
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg'>
                  <CalendarIcon className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  Calendar
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                View and manage your tasks and events in a beautiful calendar
                format.
              </p>
            </div>
            <Button
              onClick={() => handleDateClick(new Date())}
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              Add Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg'>
                    <CalendarIcon className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-purple-700'>
                      {stats.totalEvents}
                    </p>
                    <p className='text-sm font-medium text-purple-600'>
                      Total Events
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg'>
                    <Clock className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-700'>
                      {stats.taskEvents}
                    </p>
                    <p className='text-sm font-medium text-blue-600'>
                      Task Events
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg'>
                    <Users className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-green-700'>
                      {stats.regularEvents}
                    </p>
                    <p className='text-sm font-medium text-green-600'>
                      Regular Events
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className='p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg'>
                    <CalendarIcon className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-orange-700'>
                      {stats.todayEvents}
                    </p>
                    <p className='text-sm font-medium text-orange-600'>
                      Today's Events
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Calendar Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border-2 border-purple-100'
          >
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigateMonth('prev')}
              className='border-purple-200 text-purple-600 hover:bg-purple-50'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <h2 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              {format(currentDate, 'MMMM yyyy')}
            </h2>

            <Button
              variant='outline'
              size='sm'
              onClick={() => navigateMonth('next')}
              className='border-purple-200 text-purple-600 hover:bg-purple-50'
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </motion.div>

          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className='overflow-hidden border-2 border-purple-100 shadow-xl'>
              {/* Days of week header */}
              <div className='grid grid-cols-7 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100'>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className='p-4 text-center text-sm font-bold text-purple-700'
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar days */}
              <div className='grid grid-cols-7'>
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`
                        min-h-[120px] p-3 border-b border-r border-purple-100 cursor-pointer hover:bg-purple-50 transition-colors
                        ${
                          !isCurrentMonth
                            ? 'bg-gray-50 text-gray-400'
                            : 'bg-white'
                        }
                        ${
                          isToday
                            ? 'bg-gradient-to-br from-purple-50 to-pink-50'
                            : ''
                        }
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      <div
                        className={`
                        text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full
                        ${
                          isToday
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : isCurrentMonth
                            ? 'text-gray-900 hover:bg-purple-100'
                            : 'text-gray-400'
                        }
                      `}
                      >
                        {format(day, 'd')}
                      </div>

                      <div className='space-y-1'>
                        {dayEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event._id}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            className={`
                              text-xs p-2 rounded-md cursor-pointer truncate font-medium
                              ${getEventTypeColor(event.type)}
                            `}
                          >
                            {!event.allDay && (
                              <span className='font-bold mr-1'>
                                {new Date(event.startDate).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            )}
                            {event.title}
                          </motion.div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className='text-xs text-purple-600 font-bold'>
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='flex items-center justify-center space-x-8 bg-white p-6 rounded-xl shadow-sm border-2 border-purple-100'
          >
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded border border-blue-200'></div>
              <span className='text-sm font-medium text-gray-700'>
                Task Events
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-4 h-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded border border-green-200'></div>
              <span className='text-sm font-medium text-gray-700'>
                Regular Events
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

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