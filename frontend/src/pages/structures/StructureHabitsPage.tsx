import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Structure {
  id: string;
  name: string;
  levels: string[];
}

import { motion } from 'framer-motion';
import { Plus, Repeat, CheckCircle, Flame } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import HabitModal from '../habits/HabitModal';

type Habit = {
  _id: string;
  name: string;
  description?: string;
  frequency: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  completedDates: string[];
};

const StructureHabitsPage: React.FC = () => {
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
  const scopedKey = useMemo(
    () =>
      userId && structureId ? `scoped:${userId}:${structureId}:habits` : null,
    [userId, structureId]
  );

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (!structuresKey || !structureId) return;
    try {
      const raw = localStorage.getItem(structuresKey);
      const list: Structure[] = raw ? JSON.parse(raw) : [];
      setStructure(list.find((x) => x.id === structureId) || null);
    } catch {}
  }, [structuresKey, structureId]);

  const loadHabits = () => {
    try {
      setLoading(true);
      const raw = scopedKey ? localStorage.getItem(scopedKey) : null;
      setHabits(raw ? JSON.parse(raw) : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadHabits();
  }, [scopedKey]);

  const persist = (list: Habit[]) => {
    if (!scopedKey) return;
    localStorage.setItem(scopedKey, JSON.stringify(list));
    setHabits(list);
  };

  const handleCreate = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };
  const handleEdit = (h: Habit) => {
    setEditingHabit(h);
    setModalOpen(true);
  };
  const handleDelete = (h: Habit) => {
    if (!window.confirm('Delete this habit?')) return;
    persist(habits.filter((x) => x._id !== h._id));
  };
  const handleSave = (
    data: Omit<Habit, '_id' | 'createdAt' | 'updatedAt' | 'completedDates'> & {
      completedDates?: string[];
    }
  ) => {
    const now = new Date().toISOString();
    if (editingHabit) {
      persist(
        habits.map((h) =>
          h._id === editingHabit._id
            ? {
                ...editingHabit,
                ...data,
                completedDates:
                  data.completedDates ?? editingHabit.completedDates,
                updatedAt: now,
              }
            : h
        )
      );
    } else {
      const newHabit: Habit = {
        _id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        category: data.category,
        createdAt: now,
        updatedAt: now,
        completedDates: [],
      };
      persist([...habits, newHabit]);
    }
    setModalOpen(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const toggleHabitCompletion = (h: Habit, dateStr: string) => {
    const isCompleted = (h.completedDates || []).includes(dateStr);
    const next = habits.map((x) =>
      x._id === h._id
        ? {
            ...x,
            completedDates: isCompleted
              ? x.completedDates.filter((d) => d !== dateStr)
              : [...(x.completedDates || []), dateStr],
            updatedAt: new Date().toISOString(),
          }
        : x
    );
    persist(next);
  };

  const getStreakCount = (h: Habit) => {
    if (!h.completedDates || h.completedDates.length === 0) return 0;
    const todayDate = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const s = d.toISOString().split('T')[0];
      if (h.completedDates.includes(s)) streak++;
      else break;
    }
    return streak;
  };

  const getCompletionRate = (h: Habit) => {
    if (!h.completedDates || h.completedDates.length === 0) return 0;
    const startDate = new Date(h.createdAt);
    const todayDate = new Date();
    const days =
      Math.ceil(
        (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const valid = new Set(
      h.completedDates.filter((s) => {
        const d = new Date(s);
        return d >= startDate && d <= todayDate;
      })
    );
    return Math.min(100, Math.round((valid.size / Math.max(days, 1)) * 100));
  };

  const stats = useMemo(() => {
    const totalHabits = habits.length;
    const activeHabits = habits.filter(
      (h) => (h.completedDates || []).length > 0
    ).length;
    const avgCompletion = Math.round(
      habits.reduce((acc, h) => acc + getCompletionRate(h), 0) /
        Math.max(totalHabits, 1)
    );
    const totalStreaks = habits.reduce((acc, h) => acc + getStreakCount(h), 0);
    return { totalHabits, activeHabits, avgCompletion, totalStreaks };
  }, [habits]);

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className='h-32 bg-gray-200 rounded-lg animate-pulse'
            />
          ))}
        </div>
      </div>
    );
  }

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
                <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg'>
                  <Repeat className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                  {structure?.name} – Habits
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Build lasting habits scoped to this structure.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' /> Create Habit
            </Button>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg'>
                  <Repeat className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-green-700'>
                    {stats.totalHabits}
                  </p>
                  <p className='text-sm font-medium text-green-600'>
                    Total Habits
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 hover:shadow-lg transition-shadow'>
              <div className='flex items-center space-x-3'>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg'>
                  <Flame className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-700'>
                    {stats.activeHabits}
                  </p>
                  <p className='text-sm font-medium text-blue-600'>
                    Active Habits
                  </p>
                </div>
              </div>
            </Card>
            <Card className='p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 hover:shadow-lg transition-shadow'>
              <div className='text-center p-2'>
                <div className='text-sm font-semibold text-orange-700'>
                  Avg Completion
                </div>
                <div className='text-2xl font-bold text-orange-700'>
                  {stats.avgCompletion}%
                </div>
              </div>
            </Card>
            <Card className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 hover:shadow-lg transition-shadow'>
              <div className='text-center p-2'>
                <div className='text-sm font-semibold text-purple-700'>
                  Total Streaks
                </div>
                <div className='text-2xl font-bold text-purple-700'>
                  {stats.totalStreaks}
                </div>
              </div>
            </Card>
          </div>

          {/* Habits Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {habits.map((habit, index) => {
              const streak = getStreakCount(habit);
              const isCompletedToday = (habit.completedDates || []).includes(
                today
              );
              return (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='p-6 rounded-xl shadow-md bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300'>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='p-2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg'>
                          <Repeat className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='text-lg font-bold text-gray-900 mb-1'>
                            {habit.name}
                          </h3>
                          <div className='flex flex-wrap gap-2 text-xs text-gray-600'>
                            <span className='border border-green-200 text-green-700 rounded px-2 py-0.5'>
                              {habit.frequency}
                            </span>
                            <span className='border border-emerald-200 text-emerald-700 rounded px-2 py-0.5'>
                              {habit.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {habit.description && (
                      <p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed'>
                        {habit.description}
                      </p>
                    )}
                    {habit.completedDates &&
                      habit.completedDates.length > 0 && (
                        <div className='mb-4'>
                          <div className='text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100'>
                            <div className='text-2xl font-bold text-orange-600'>
                              {streak}
                            </div>
                            <div className='text-xs font-medium text-orange-600'>
                              Day Streak
                            </div>
                          </div>
                        </div>
                      )}
                    <div className='mt-4 pt-4 border-t border-green-100'>
                      <Button
                        variant={isCompletedToday ? 'outline' : 'primary'}
                        size='sm'
                        className={`w-full ${
                          isCompletedToday
                            ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        }`}
                        onClick={() => toggleHabitCompletion(habit, today)}
                      >
                        <CheckCircle className='w-4 h-4 mr-2' />{' '}
                        {isCompletedToday ? 'Completed Today' : 'Mark Complete'}
                      </Button>
                    </div>
                    <div className='flex items-center justify-between pt-4 border-t border-amber-100 mt-4'>
                      <span className='text-xs text-gray-500'>
                        {new Date(habit.updatedAt).toLocaleDateString()}
                      </span>
                      <div className='flex space-x-2'>
                        <Button
                          variant='outline'
                          onClick={() => handleEdit(habit)}
                          className='border-gray-200 text-gray-600 hover:bg-gray-50'
                        >
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDelete(habit)}
                          className='border-red-200 text-red-500 hover:bg-red-50'
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {habits.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='col-span-full'
              >
                <Card className='p-12 text-center bg-gradient-to-br from-white to-green-50 border-2 border-green-100'>
                  <div className='p-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
                    <Repeat className='w-8 h-8 text-green-600' />
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    No habits yet
                  </h3>
                  <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                    Start building positive habits for this structure.
                  </p>
                  <Button
                    onClick={handleCreate}
                    className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  >
                    <Plus className='w-4 h-4 mr-2' /> Create Your First Habit
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <HabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data: any) => handleSave(data)}
        habit={editingHabit as any}
      />
    </>
  );
};

export default StructureHabitsPage;
