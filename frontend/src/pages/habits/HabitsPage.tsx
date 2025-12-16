import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HabitModal from './HabitModal';
import HabitsView from '../../components/features/habits/HabitsView';
import Button from '../../components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  Habit,
  completeHabit,
  uncompleteHabit,
} from '../../lib/api/api';

const HabitsPage: React.FC = () => {
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
      <HabitsView
        loading={loading}
        habits={habits}
        stats={{
          totalHabits: stats.totalHabits,
          activeHabits: stats.activeHabits,
          totalStreaks: stats.totalStreaks,
        }}
        last7Days={last7Days}
        today={today}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
        onToggleCompletion={toggleHabitCompletion}
        getStreakCount={getStreakCount}
      />

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

export default HabitsPage;
