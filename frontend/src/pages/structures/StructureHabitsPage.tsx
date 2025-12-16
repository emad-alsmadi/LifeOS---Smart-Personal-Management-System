import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Repeat, TrendingUp, CheckCircle, Flame } from 'lucide-react';
import HabitModal from '../habits/HabitModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Badge } from '../../components/ui/badge';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  Habit,
  completeHabit,
  uncompleteHabit,
} from '../../lib/api/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

const StructureHabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await getHabits();
      setHabits(data);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleDeleteClick = (habit: Habit) => {
    setHabitToDelete(habit);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabit(habitToDelete._id);
      setDeleteDialogOpen(false);
      setHabitToDelete(null);
      await loadHabits();
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  };

  const handleSave = async (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit._id, habitData);
      } else {
        await createHabit(habitData);
      }
      setModalOpen(false);
      await loadHabits();
    } catch (error) {
      console.error('Failed to save habit:', error);
    }
  };

  const toggleHabitCompletion = async (habit: Habit, date: string) => {
    const completedDates = habit.completedDates || [];
    const isCompleted = completedDates.includes(date);

    try {
      if (isCompleted) {
        await uncompleteHabit(habit._id, date);
      } else {
        await completeHabit(habit._id, date);
      }
      await loadHabits();
    } catch (error) {
      console.error('Failed to update habit completion:', error);
    }
  };

  const getStreakCount = (habit: Habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;

    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      if (habit.completedDates.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getCompletionRate = (habit: Habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    const startDate = new Date(habit.createdAt);
    const today = new Date();
    const daysDiff =
      Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Only count unique dates between startDate and today
    const validDates = new Set(
      habit.completedDates.filter((dateStr) => {
        const date = new Date(dateStr);
        return date >= startDate && date <= today;
      })
    );

    return Math.min(
      100,
      Math.round((validDates.size / Math.max(daysDiff, 1)) * 100)
    );
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getHabitStats = () => {
    const totalHabits = habits.length;
    const activeHabits = habits.filter(
      (h) => h.completedDates && h.completedDates.length > 0
    ).length;
    const avgCompletion =
      habits.reduce((acc, habit) => acc + getCompletionRate(habit), 0) /
      Math.max(totalHabits, 1);
    const totalStreaks = habits.reduce(
      (acc, habit) => acc + getStreakCount(habit),
      0
    );

    return {
      totalHabits,
      activeHabits,
      avgCompletion: Math.round(avgCompletion),
      totalStreaks,
    };
  };

  const last7Days = getLast7Days();
  const today = new Date().toISOString().split('T')[0];
  const stats = getHabitStats();

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
                  Habits
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Build lasting habits and track your daily progress with streaks
                and completion rates.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              Create Habit
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className='p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg'>
                    <TrendingUp className='w-6 h-6 text-white' />
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className='p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg'>
                    <Flame className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-orange-700'>
                      {stats.totalStreaks}
                    </p>
                    <p className='text-sm font-medium text-orange-600'>
                      Total Streaks
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Habits Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {habits.map((habit, index) => {
              const streak = getStreakCount(habit);
              const completionRate = getCompletionRate(habit);
              const isCompletedToday =
                habit.completedDates?.includes(today) || false;

              return (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className='p-6 rounded-xl shadow-md bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300'
                    hover
                  >
                    {/* Header */}
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='p-2 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg'>
                          <Repeat className='w-5 h-5 text-white' />
                        </div>
                        <div>
                          <h3 className='text-lg font-bold text-gray-900 mb-1'>
                            {habit.name}
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            <Badge
                              variant='outline'
                              className='text-xs border-green-200 text-green-700'
                            >
                              {habit.frequency}
                            </Badge>
                            <Badge
                              variant='outline'
                              className='text-xs border-emerald-200 text-emerald-700'
                            >
                              {habit.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {habit.description && (
                      <p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed'>
                        {habit.description}
                      </p>
                    )}

                    {/* Stats */}
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

                    {/* Last 7 Days */}
                    <div className='mb-4'>
                      <div className='text-sm font-semibold text-gray-700 mb-1'>
                        Last 7 Days
                      </div>
                      <div className='flex space-x-1'>
                        {last7Days.map((date) => {
                          const dateString = date.toISOString().split('T')[0];
                          const isCompleted =
                            habit.completedDates?.includes(dateString) || false;
                          const isToday = dateString === today;
                          return (
                            <motion.button
                              key={dateString}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                toggleHabitCompletion(habit, dateString)
                              }
                              className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200
                                ${
                                  isCompleted
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }
                                ${
                                  isToday
                                    ? 'ring-2 ring-blue-500 ring-offset-2'
                                    : ''
                                }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className='w-4 h-4 mx-auto' />
                              ) : (
                                date.getDate()
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Today's Action */}
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
                        {isCompletedToday ? (
                          <>
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Completed Today
                          </>
                        ) : (
                          <>
                            <CheckCircle className='w-4 h-4 mr-2' />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Footer */}
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
                          onClick={() => handleDeleteClick(habit)}
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

            {/* Empty State */}
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
                    Start building positive habits to improve your daily routine
                    and achieve your goals.
                  </p>
                  <Button
                    onClick={handleCreate}
                    className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Create Your First Habit
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <HabitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave as any}
        habit={editingHabit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <div className='flex flex-col items-center justify-center text-center'>
              <svg
                className='w-12 h-12 text-red-500 mb-2'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
              <DialogTitle className='text-xl font-bold text-gray-900 mb-1'>
                Delete Habit?
              </DialogTitle>
              <p className='text-gray-600 mb-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold text-red-600'>
                  {habitToDelete?.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='ghost'
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              className='bg-red-500 hover:bg-red-600'
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StructureHabitsPage;
