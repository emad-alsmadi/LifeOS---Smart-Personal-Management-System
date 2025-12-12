import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CalendarEventModal from '../calendar/CalendarEventModal';

interface Structure {
  id: string;
  name: string;
  levels: string[];
}
type Event = {
  _id: string;
  title: string;
  type: 'Task' | 'Event';
  startDate: string;
  endDate: string;
  allDay?: boolean;
};
type Task = { _id: string; name: string };

const startOfMonth = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const endOfMonth = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
const eachDayOfInterval = (start: Date, end: Date) => {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days;
};
const isSameMonth = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
const isSameDay = (d1: Date, d2: Date) => {
  const a = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d1.getDate()).padStart(2, '0')}`;
  const b = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d2.getDate()).padStart(2, '0')}`;
  return a === b;
};
const addMonths = (date: Date, months: number) => {
  const r = new Date(date);
  r.setMonth(r.getMonth() + months);
  return r;
};
const subMonths = (date: Date, months: number) => addMonths(date, -months);
const format = (date: Date, fmt: string) =>
  fmt === 'MMMM yyyy'
    ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : fmt === 'd'
    ? String(date.getUTCDate())
    : date.toLocaleDateString();

const StructureCalendarPage: React.FC = () => {
  const { structureId } = useParams();
  const [structure, setStructure] = useState<Structure | null>(null);
  const userId = useMemo(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      const u = raw ? JSON.parse(raw) : null;
      return u?._id || null;
    } catch {
      return null;
    }
  }, []);
  const structuresKey = useMemo(
    () => (userId ? `structures:${userId}` : null),
    [userId]
  );
  const scopedBase = useMemo(
    () =>
      userId && structureId ? `scoped:${userId}:${structureId}:calendar` : null,
    [userId, structureId]
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!structuresKey || !structureId) return;
    try {
      const raw = localStorage.getItem(structuresKey);
      const list: Structure[] = raw ? JSON.parse(raw) : [];
      const s = list.find((x) => x.id === structureId) || null;
      setStructure(s);
    } catch {}
  }, [structuresKey, structureId]);

  const loadData = () => {
    if (!scopedBase) return;
    const evRaw = localStorage.getItem(`${scopedBase}:events`);
    const tkRaw = localStorage.getItem(`${scopedBase}:tasks`);
    setEvents(evRaw ? JSON.parse(evRaw) : []);
    setTasks(tkRaw ? JSON.parse(tkRaw) : []);
  };
  useEffect(() => {
    loadData();
  }, [scopedBase]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setModalOpen(true);
  };
  const handleEventClick = (ev: Event) => {
    setEditingEvent(ev);
    setSelectedDate(new Date(ev.startDate));
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<Event, '_id'>) => {
    if (!scopedBase) return;
    const list: Event[] = events.slice();
    if (editingEvent) {
      const idx = list.findIndex((e) => e._id === editingEvent._id);
      if (idx >= 0) list[idx] = { ...list[idx], ...data } as Event;
    } else {
      list.push({ ...(data as any), _id: crypto.randomUUID() });
    }
    localStorage.setItem(`${scopedBase}:events`, JSON.stringify(list));
    setModalOpen(false);
    loadData();
    setCurrentDate((prev) => new Date(prev.getTime()));
  };

  const handleDelete = async (ev: Event) => {
    if (!scopedBase) return;
    if (!window.confirm('Delete this event?')) return;
    const next = events.filter((e) => e._id !== ev._id);
    localStorage.setItem(`${scopedBase}:events`, JSON.stringify(next));
    loadData();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval(monthStart, monthEnd);

  const getEventsForDate = (date: Date) =>
    events.filter((ev) => isSameDay(new Date(ev.startDate), date));
  const getEventTypeColor = (type: Event['type']) =>
    type === 'Task'
      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
  const navigateMonth = (dir: 'prev' | 'next') =>
    setCurrentDate((p) => (dir === 'prev' ? subMonths(p, 1) : addMonths(p, 1)));
  const stats = {
    totalEvents: events.length,
    taskEvents: events.filter((e) => e.type === 'Task').length,
    regularEvents: events.filter((e) => e.type !== 'Task').length,
    todayEvents: events.filter((e) =>
      isSameDay(new Date(e.startDate), new Date())
    ).length,
  };

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg'>
                  <CalendarIcon className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  {structure?.name} – Calendar
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Events and tasks scoped to this structure.
              </p>
            </div>
            <Button
              onClick={() => handleDateClick(new Date())}
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' /> Add Event
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className='overflow-hidden border-2 border-purple-100 shadow-xl'>
              <div className='grid grid-cols-7 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100'>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className='p-4 text-center text-sm font-bold text-purple-700'
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7'>
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isToday = isSameDay(day, new Date());
                  const inMonth = isSameMonth(day, currentDate);
                  return (
                    <motion.div
                      key={day.toISOString()}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] p-3 border-b border-r border-purple-100 cursor-pointer hover:bg-purple-50 transition-colors ${
                        !inMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                      } ${
                        isToday
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50'
                          : ''
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div
                        className={`text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full ${
                          isToday
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : inMonth
                            ? 'text-gray-900 hover:bg-purple-100'
                            : 'text-gray-400'
                        }`}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className='space-y-1'>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <motion.div
                            key={ev._id}
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(ev);
                            }}
                            className={`text-xs p-2 rounded-md cursor-pointer truncate font-medium ${getEventTypeColor(
                              ev.type
                            )}`}
                          >
                            {!ev.allDay && (
                              <span className='font-bold mr-1'>
                                {new Date(ev.startDate).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            {ev.title}
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
        </motion.div>
      </div>

      <CalendarEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave as any}
        onDelete={editingEvent ? () => handleDelete(editingEvent) : undefined}
        event={editingEvent as any}
        selectedDate={selectedDate}
        tasks={tasks as any}
      />
    </>
  );
};

export default StructureCalendarPage;
