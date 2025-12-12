import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { StickyNote, Calendar as CalendarIcon, Repeat } from 'lucide-react';

interface Structure {
  id: string;
  name: string;
  levels: string[];
}

const StructureHomePage: React.FC = () => {
  const { structureId } = useParams();
  const [structure, setStructure] = useState<Structure | null>(null);
  const storageKey = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('auth:user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      return user?._id ? `structures:${user._id}` : null;
    } catch {
      return null;
    }
  }, []);

  // Scoped local keys for per-structure data (notes/events/habits)
  const userId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('auth:user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      return user?._id || null;
    } catch {
      return null;
    }
  }, []);
  const notesKey = useMemo(
    () =>
      userId && structureId ? `scoped:${userId}:${structureId}:notes` : null,
    [userId, structureId]
  );
  const eventsKey = useMemo(
    () =>
      userId && structureId
        ? `scoped:${userId}:${structureId}:calendar:events`
        : null,
    [userId, structureId]
  );
  const habitsKey = useMemo(
    () =>
      userId && structureId ? `scoped:${userId}:${structureId}:habits` : null,
    [userId, structureId]
  );
  const [counts, setCounts] = useState({ notes: 0, events: 0, habits: 0 });

  useEffect(() => {
    if (!storageKey || !structureId) return;
    try {
      const raw = localStorage.getItem(storageKey);
      const list: Structure[] = raw ? JSON.parse(raw) : [];
      const s = list.find((x) => x.id === structureId) || null;
      setStructure(s);
    } catch {}
  }, [storageKey, structureId]);

  useEffect(() => {
    try {
      const n = notesKey
        ? (JSON.parse(localStorage.getItem(notesKey) || '[]') as any[]).length
        : 0;
      const e = eventsKey
        ? (JSON.parse(localStorage.getItem(eventsKey) || '[]') as any[]).length
        : 0;
      const h = habitsKey
        ? (JSON.parse(localStorage.getItem(habitsKey) || '[]') as any[]).length
        : 0;
      setCounts({ notes: n, events: e, habits: h });
    } catch {
      setCounts({ notes: 0, events: 0, habits: 0 });
    }
  }, [notesKey, eventsKey, habitsKey]);

  if (!structure) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-600'>
        Structure not found.
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='space-y-8'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {structure.name}
            </h1>
            <p className='text-gray-600'>
              Welcome to the Action Zone for this structure.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='secondary'>Quick action</Button>
            <Button>Create item</Button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <Card className='p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg'>
                <StickyNote className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold text-amber-700'>
                  {counts.notes}
                </p>
                <p className='text-sm font-medium text-amber-600'>Notes</p>
              </div>
            </div>
            <div className='mt-4'>
              <Link
                to={`/s/${structure.id}/notes`}
                className='text-sm text-amber-700 hover:underline'
              >
                Open Notes
              </Link>
            </div>
          </Card>

          <Card className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg'>
                <CalendarIcon className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold text-purple-700'>
                  {counts.events}
                </p>
                <p className='text-sm font-medium text-purple-600'>Events</p>
              </div>
            </div>
            <div className='mt-4'>
              <Link
                to={`/s/${structure.id}/calendar`}
                className='text-sm text-purple-700 hover:underline'
              >
                Open Calendar
              </Link>
            </div>
          </Card>

          <Card className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100'>
            <div className='flex items-center space-x-3'>
              <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg'>
                <Repeat className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold text-green-700'>
                  {counts.habits}
                </p>
                <p className='text-sm font-medium text-green-600'>Habits</p>
              </div>
            </div>
            <div className='mt-4'>
              <Link
                to={`/s/${structure.id}/habits`}
                className='text-sm text-green-700 hover:underline'
              >
                Open Habits
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default StructureHomePage;
