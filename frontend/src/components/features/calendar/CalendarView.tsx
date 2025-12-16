import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import type { Event } from '../../../lib/api/api';

type Stats = {
  totalEvents: number;
  taskEvents: number;
  regularEvents: number;
  todayEvents: number;
};

interface Props {
  displayMonth: string;
  calendarDays: Date[];
  stats: Stats;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddEvent: () => void;
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  eventsForDate: (date: Date) => Event[];
  getEventTypeColor: (type: Event['type']) => string;
  isSameDay: (a: Date, b: Date) => boolean;
}

const CalendarView: React.FC<Props> = ({
  displayMonth,
  calendarDays,
  stats,
  onPrevMonth,
  onNextMonth,
  onAddEvent,
  onDateClick,
  onEventClick,
  eventsForDate,
  getEventTypeColor,
  isSameDay,
}) => {
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
              onClick={onAddEvent}
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
              onClick={onPrevMonth}
              className='border-purple-200 text-purple-600 hover:bg-purple-50'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <h2 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              {displayMonth}
            </h2>
            <Button
              variant='outline'
              size='sm'
              onClick={onNextMonth}
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
                  const dayEvents = eventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth =
                    day.getFullYear() === calendarDays[0].getFullYear() &&
                    day.getMonth() === calendarDays[0].getMonth();

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
                      onClick={() => onDateClick(day)}
                    >
                      <div
                        className={`
                        text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full
                        ${
                          isToday
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'text-gray-900 hover:bg-purple-100'
                        }
                      `}
                      >
                        {day.getUTCDate().toString()}
                      </div>

                      <div className='space-y-1'>
                        {dayEvents.slice(0, 3).map((event) => (
                          <motion.div
                            key={event._id}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick(event);
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
    </>
  );
};

export default CalendarView;
