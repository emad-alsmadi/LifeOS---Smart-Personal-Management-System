import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle } from 'lucide-react';
import type { Task } from '../../lib/api/api';

interface Props {
  tasks: Task[];
  onOpenTaskModal: () => void;
  onTaskComplete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
}

const ActiveTasksSection: React.FC<Props> = ({
  tasks,
  onOpenTaskModal,
  onTaskComplete,
  onTaskClick,
}) => {
  const activeTop5 = tasks.filter((t) => t.status === 'Active').slice(0, 5);

  return (
    <Card
      className='p-0 overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 shadow-xl'
      elevated
    >
      <div className='flex items-center gap-4 px-6 pt-6 pb-4 bg-gradient-to-r from-orange-500 to-red-600 text-white'>
        <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
          <CheckCircle className='w-7 h-7 text-white' />
        </div>
        <div className='flex items-center gap-3'>
          <h2 className='text-3xl font-display font-bold'>Active Tasks</h2>
          <div className='h-1 w-12 bg-white/60 rounded-full'></div>
        </div>
        <span className='ml-auto text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm'>
          {activeTop5.length} tasks
        </span>
      </div>

      <div className='divide-y divide-orange-100'>
        {activeTop5.length === 0 ? (
          <div className='px-4 py-6 text-center'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className='w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='w-10 h-10 text-orange-500' />
              </div>
              <p className='text-gray-800 text-xl font-semibold mb-2'>
                No active tasks!
              </p>
              <p className='text-gray-600 text-sm mb-6'>
                Great job staying on top of things.
              </p>
              <Button
                onClick={onOpenTaskModal}
                className='bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2'
              >
                <CheckCircle className='w-4 h-4' />
                Add New Task
              </Button>
            </motion.div>
          </div>
        ) : (
          activeTop5.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: '#fef7ed',
              }}
              transition={{
                duration: 0.4,
                delay: 0.05 * idx,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className='flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group'
            >
              {/* Checkbox */}
              <label className='relative flex items-center cursor-pointer group'>
                <input
                  type='checkbox'
                  checked={task.status === 'Completed'}
                  onChange={() => onTaskComplete(task._id)}
                  className='peer appearance-none w-7 h-7 border-2 border-orange-300 rounded-xl bg-white checked:bg-gradient-to-r checked:from-green-500 checked:to-green-600 checked:border-transparent transition-all duration-300 focus:ring-4 focus:ring-green-200 hover:border-orange-400 group-hover:border-orange-500 shadow-sm hover:shadow-md'
                />
                <motion.span
                  className='absolute left-0 top-0 w-7 h-7 flex items-center justify-center pointer-events-none rounded-xl'
                  initial={false}
                  animate={
                    task.status === 'Completed'
                      ? {
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, 0],
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.1)',
                            'rgba(34, 197, 94, 0.3)',
                            'rgba(34, 197, 94, 0.1)',
                          ],
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                          backgroundColor: 'transparent',
                        }
                  }
                  transition={{
                    duration: 0.5,
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <motion.svg
                    className='text-white'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='3'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    initial={false}
                    animate={
                      task.status === 'Completed'
                        ? {
                            opacity: 1,
                            scale: 1,
                            pathLength: 1,
                          }
                        : {
                            opacity: 0,
                            scale: 0.8,
                            pathLength: 0,
                          }
                    }
                    transition={{
                      duration: 0.3,
                      delay: task.status === 'Completed' ? 0.1 : 0,
                      ease: 'easeOut',
                    }}
                  >
                    <motion.polyline
                      points='20 6 9 17 4 12'
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength: task.status === 'Completed' ? 1 : 0,
                      }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      strokeDasharray='1'
                      strokeDashoffset={task.status === 'Completed' ? 0 : 1}
                    />
                  </motion.svg>
                </motion.span>

                {/* Hover ring */}
                <motion.div
                  className='absolute inset-0 w-7 h-7 rounded-xl border-2 border-orange-200 opacity-0'
                  initial={false}
                  animate={{
                    scale: task.status === 'Completed' ? 1.3 : 1,
                    opacity: 0,
                  }}
                  whileHover={{
                    scale: 1.3,
                    opacity: 0.3,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </label>

              {/* Task Content */}
              <div
                className='flex-1 min-w-0 cursor-pointer group'
                onClick={() => onTaskClick(task)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <motion.div
                      className={`font-semibold text-lg truncate group-hover:text-orange-600 transition-all duration-200 ${
                        task.status === 'Completed'
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      {task.name}
                    </motion.div>

                    {/* Badges Row */}
                    <div className='flex items-center gap-2 mt-3 flex-wrap'>
                      {/* Due Date */}
                      {task.dueDate && (
                        <motion.span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            new Date(task.dueDate) < new Date()
                              ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                              : new Date(task.dueDate) <
                                new Date(Date.now() + 24 * 60 * 60 * 1000)
                              ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                              : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {new Date(task.dueDate) < new Date()
                            ? '🚨'
                            : new Date(task.dueDate) <
                              new Date(Date.now() + 24 * 60 * 60 * 1000)
                            ? '⚠️'
                            : '📅'}
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </motion.span>
                      )}

                      {/* Status */}
                      <motion.span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          task.status === 'Completed'
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                            : task.status === 'Active'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200'
                            : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {task.status === 'Completed'
                          ? '✅'
                          : task.status === 'Active'
                          ? '🔄'
                          : '⏳'}{' '}
                        {task.status}
                      </motion.span>

                      {/* Priority */}
                      {task.priority && (
                        <motion.span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                            task.priority === 'High'
                              ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                              : task.priority === 'Medium'
                              ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                              : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          {task.priority === 'High'
                            ? '🔥'
                            : task.priority === 'Medium'
                            ? '⚡'
                            : '🌱'}{' '}
                          {task.priority}
                        </motion.span>
                      )}

                      {/* Type */}
                      {task.type && (
                        <motion.span
                          className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border border-purple-200'
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          📋 {task.type}
                        </motion.span>
                      )}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className='flex flex-col items-end gap-2 ml-4'>
                    {task.type && (
                      <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                        📋 {task.type}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hover Indicator */}
              <motion.div
                className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                whileHover={{ scale: 1.1 }}
              >
                <div className='w-2 h-2 bg-orange-400 rounded-full'></div>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>

      <div className='px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-100'>
        <Link
          to='/tasks'
          className='flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200'
        >
          View All Tasks
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </Link>
      </div>
    </Card>
  );
};

export default ActiveTasksSection;
