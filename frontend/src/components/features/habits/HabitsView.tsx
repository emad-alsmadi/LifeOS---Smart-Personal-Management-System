import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Repeat, CheckCircle, Flame, TrendingUp } from 'lucide-react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { Badge } from '../../ui/badge';
import type { Habit } from '../../../lib/api/api';

type HabitStats = {
  totalHabits: number;
  activeHabits: number;
  totalStreaks: number;
};

interface Props {
  loading?: boolean;
  habits: Habit[];
  stats: HabitStats;
  last7Days: Date[];
  today: string;
  onCreate: () => void;
  onEdit: (habit: Habit) => void;
  onDeleteClick: (habit: Habit) => void;
  onToggleCompletion: (habit: Habit, date: string) => void;
  getStreakCount: (habit: Habit) => number;
}

const HabitsView: React.FC<Props> = ({
  loading,
  habits,
  stats,
  last7Days,
  today,
  onCreate,
  onEdit,
  onDeleteClick,
  onToggleCompletion,
  getStreakCount,
}) => {
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
            onClick={onCreate}
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
            const isCompletedToday =
              habit.completedDates?.includes(today) || false;
            return (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='p-6 rounded-xl shadow-md bg-gradient-to-br from-white to-green-50 border-2 border-green-100 hover:border-green-300 hover:shadow-2xl transition-all duration-300'>
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
                  {habit.completedDates && habit.completedDates.length > 0 && (
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
                        const dayCompleted =
                          habit.completedDates?.includes(dateString) || false;
                        const isToday = dateString === today;
                        return (
                          <motion.button
                            key={dateString}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onToggleCompletion(habit, dateString)
                            }
                            className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                              dayCompleted
                                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            } ${
                              isToday
                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                : ''
                            }`}
                          >
                            {dayCompleted ? (
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
                      onClick={() => onToggleCompletion(habit, today)}
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
                        onClick={() => onEdit(habit)}
                        className='border-gray-200 text-gray-600 hover:bg-gray-50'
                      >
                        Edit
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onDeleteClick(habit)}
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
                  onClick={onCreate}
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
  );
};

export default HabitsView;
