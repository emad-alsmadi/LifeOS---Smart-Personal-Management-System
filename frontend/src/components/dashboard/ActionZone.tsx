import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  CheckCircle,
  FolderOpen,
  BookOpen,
  Star,
  StickyNote,
  Plus,
  Activity,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Project, Task, Note, Event, Objective } from '../../lib/api/api';

interface ActionZoneProps {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  events: Event[];
  objectives: Objective[];
  onOpenProjectModal: () => void;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onOpenEventModal: () => void;
  onTaskComplete: (taskId: string) => Promise<void>;
  onProjectClick: (project: Project) => void;
  onTaskClick: (task: Task) => void;
}

const ActionZone: React.FC<ActionZoneProps> = ({
  tasks,
  projects,
  notes,
  events,
  objectives,
  onOpenProjectModal,
  onOpenTaskModal,
  onOpenNoteModal,
  onOpenEventModal,
  onTaskComplete,
  onProjectClick,
  onTaskClick,
}) => {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const activeTasks = tasks.filter((task) => task.status === 'Active');
  const recentProjects = projects.slice(0, 5);
  const recentNotes = notes.slice(0, 3);
  const upcomingEvents = events
    .filter((event) => new Date(event.startDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    .slice(0, 3);

  return (
    <div className='space-y-8'>
      {/* Enhanced Header with Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className='p-0 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 border-2 border-primary-100 shadow-corporate-xl'
          elevated
        >
          <div className='relative p-8'>
            {/* Background Pattern */}
            <div className='absolute inset-0 opacity-5'>
              <div className='absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl'></div>
              <div className='absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl'></div>
            </div>

            <div className='relative flex flex-col md:flex-row md:items-center md:justify-between gap-8'>
              <div className='flex items-center gap-6'>
                <motion.div
                  className='p-5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-corporate-lg'
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Zap className='w-12 h-12 text-white' />
                </motion.div>
                <div>
                  <h1 className='text-5xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2'>
                    Action Zone
                  </h1>
                  <p className='text-xl text-text-secondary font-medium'>
                    Focus on what needs to be done right now.
                  </p>
                  <div className='flex items-center gap-4 mt-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-3 h-3 bg-success-400 rounded-full animate-pulse'></div>
                      <span className='text-sm text-text-muted font-medium'>
                        Live Dashboard
                      </span>
                    </div>
                    <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
                    <span className='text-sm text-gray-500 font-medium'>
                      {activeTasks.length} active tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Action Buttons */}
              <div className='flex flex-wrap gap-4'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onOpenTaskModal}
                    className='bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white shadow-corporate hover:shadow-corporate-lg transform transition-all duration-200 flex items-center gap-3 px-6 py-3 rounded-xl font-semibold'
                  >
                    <Plus className='w-5 h-5' />
                    New Task
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onOpenProjectModal}
                    className='bg-gradient-to-r from-accent-500 to-accent-700 hover:from-accent-600 hover:to-accent-800 text-white shadow-corporate hover:shadow-corporate-lg transform transition-all duration-200 flex items-center gap-3 px-6 py-3 rounded-xl font-semibold'
                  >
                    <Plus className='w-5 h-5' />
                    New Project
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onOpenNoteModal}
                    className='bg-gradient-to-r from-success-500 to-success-700 hover:from-success-600 hover:to-success-800 text-white shadow-corporate hover:shadow-corporate-lg transform transition-all duration-200 flex items-center gap-3 px-6 py-3 rounded-xl font-semibold'
                  >
                    <Plus className='w-5 h-5' />
                    New Note
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Active Tasks - Enhanced Aesthetic Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className='p-0 overflow-hidden bg-gradient-to-br from-white to-primary-50 border-2 border-primary-100 shadow-corporate-xl'
          elevated
        >
          <div className='flex items-center gap-4 px-8 pt-8 pb-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white'>
            <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
              <CheckCircle className='w-7 h-7 text-white' />
            </div>
            <div className='flex items-center gap-3'>
              <h2 className='text-3xl font-display font-bold'>Active Tasks</h2>
              <div className='h-1 w-12 bg-white/60 rounded-full'></div>
            </div>
            <span className='ml-auto text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm'>
              {activeTasks.length} tasks
            </span>
          </div>

          <div className='divide-y divide-blue-100'>
            {activeTasks.length === 0 ? (
              <div className='px-8 py-12 text-center'>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className='w-20 h-20 bg-gradient-to-br from-success-100 to-primary-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <CheckCircle className='w-10 h-10 text-success-500' />
                  </div>
                  <p className='text-text-primary text-xl font-semibold mb-2'>
                    No active tasks!
                  </p>
                  <p className='text-text-muted text-sm mb-6'>
                    Great job staying on top of things.
                  </p>
                  <Button
                    onClick={onOpenTaskModal}
                    variant='primary'
                    className='bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white shadow-corporate hover:shadow-corporate-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2'
                  >
                    <Plus className='w-4 h-4' />
                    Add Your First Task
                  </Button>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {activeTasks.map((task, idx) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, x: -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                    transition={{
                      duration: 0.4,
                      delay: 0.05 * idx,
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                    className='flex items-center gap-4 px-8 py-6 hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300 group'
                  >
                    <label className='relative flex items-center cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={false}
                        onChange={async () => {
                          setCompletingTaskId(task._id);
                          await new Promise((res) => setTimeout(res, 150));
                          await onTaskComplete(task._id);
                          setCompletingTaskId(null);
                        }}
                        className='peer appearance-none w-6 h-6 border-3 border-primary-300 rounded-lg bg-white checked:bg-gradient-to-r checked:from-success-500 checked:to-success-600 checked:border-transparent transition-all duration-300 focus:ring-4 focus:ring-success-200 hover:border-primary-400 group-hover:border-primary-500'
                        disabled={completingTaskId === task._id}
                      />
                      <motion.span
                        className='absolute left-0 top-0 w-6 h-6 flex items-center justify-center pointer-events-none'
                        initial={false}
                        animate={
                          completingTaskId === task._id
                            ? {
                                scale: [1, 1.4, 1],
                                rotate: [0, 15, 0],
                                backgroundColor: [
                                  'rgba(34, 197, 94, 0.2)',
                                  'rgba(34, 197, 94, 0.4)',
                                  'rgba(34, 197, 94, 0.2)',
                                ],
                              }
                            : {
                                scale: 1,
                                rotate: 0,
                                backgroundColor: 'transparent',
                              }
                        }
                        transition={{
                          duration: 0.4,
                          type: 'spring',
                          stiffness: 400,
                          damping: 20,
                        }}
                      >
                        <svg
                          className={`transition-all duration-300 text-white ${
                            completingTaskId === task._id
                              ? 'opacity-100 scale-110'
                              : 'opacity-0 scale-90'
                          }`}
                          width='20'
                          height='20'
                          viewBox='0 0 20 20'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='3'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        >
                          <polyline points='5 11 9 15 15 7' />
                        </svg>
                      </motion.span>
                    </label>

                    <div
                      className='flex-1 min-w-0 cursor-pointer group'
                      onClick={() => onTaskClick(task)}
                    >
                      <motion.div
                        className='font-semibold text-text-primary text-lg truncate group-hover:text-primary-600 transition-all duration-200'
                        whileHover={{ x: 5 }}
                      >
                        {task.name}
                      </motion.div>
                      <div className='flex items-center gap-3 mt-2'>
                        {task.dueDate && (
                          <motion.span
                            className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border border-orange-200'
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            📅 Due:{' '}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </motion.span>
                        )}
                        {task.priority && (
                          <motion.span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              task.priority === 'High'
                                ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                                : task.priority === 'Medium'
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200'
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
                        {task.type && (
                          <motion.span
                            className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 border border-accent-200'
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            📋 {task.type}
                          </motion.span>
                        )}
                      </div>
                    </div>

                    <motion.div
                      className='opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className='w-2 h-2 bg-primary-400 rounded-full'></div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className='p-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 shadow-xl'
          elevated
        >
          <div className='p-8'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl'>
                <Activity className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent'>
                Quick Actions
              </h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <motion.button
                onClick={() => {
                  console.log('Add Task button clicked');
                  onOpenTaskModal();
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className='group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='relative p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <CheckCircle className='w-8 h-8 text-white' />
                </div>
                <span className='relative font-bold text-primary-700 text-lg group-hover:text-primary-800 transition-colors duration-300'>
                  Add Task
                </span>
                <div className='relative w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </motion.button>

              <motion.button
                onClick={() => {
                  console.log('New Project button clicked');
                  onOpenProjectModal();
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className='group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='relative p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <FolderOpen className='w-8 h-8 text-white' />
                </div>
                <span className='relative font-bold text-primary-700 text-lg group-hover:text-primary-800 transition-colors duration-300'>
                  New Project
                </span>
                <div className='relative w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </motion.button>

              <motion.button
                onClick={() => {
                  console.log('Quick Note button clicked');
                  onOpenNoteModal();
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className='group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='relative p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <StickyNote className='w-8 h-8 text-white' />
                </div>
                <span className='relative font-bold text-primary-700 text-lg group-hover:text-primary-800 transition-colors duration-300'>
                  Quick Note
                </span>
                <div className='relative w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </motion.button>

              <motion.button
                onClick={() => {
                  console.log('Schedule Event button clicked');
                  onOpenEventModal();
                }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className='group relative flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden'
              >
                <div className='absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='relative p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                  <Calendar className='w-8 h-8 text-white' />
                </div>
                <span className='relative font-bold text-primary-700 text-lg group-hover:text-primary-800 transition-colors duration-300'>
                  Schedule Event
                </span>
                <div className='relative w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </motion.button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Highlighted Notes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card
          className='p-0 overflow-hidden bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 shadow-xl'
          elevated
        >
          <div className='p-8'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg'>
                <Star className='w-6 h-6 text-white' />
              </div>
              <h2 className='text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                Highlighted Notes
              </h2>
              <Link
                to='/notes'
                className='ml-auto text-amber-600 hover:text-amber-700 text-sm font-semibold hover:underline transition-colors'
              >
                View All Notes →
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {recentNotes.length === 0 ? (
                <motion.div
                  className='col-span-full text-center py-12'
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className='w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <StickyNote className='w-8 h-8 text-amber-400' />
                  </div>
                  <p className='text-gray-600 font-medium'>No notes yet</p>
                  <p className='text-gray-400 text-sm mt-1'>
                    Create your first note to see it here
                  </p>
                  <Button
                    onClick={onOpenNoteModal}
                    className='mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2'
                  >
                    <Plus className='w-4 h-4' />
                    Create Note
                  </Button>
                </motion.div>
              ) : (
                recentNotes.map((note, idx) => (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className='group relative p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden'
                  >
                    {/* Background Pattern */}
                    <div className='absolute inset-0 opacity-5'>
                      <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-2xl'></div>
                    </div>

                    <div className='relative'>
                      {/* Note Icon */}
                      <div className='flex items-center justify-between mb-4'>
                        <div className='p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                          <StickyNote className='w-5 h-5 text-white' />
                        </div>
                        {note.category && (
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'>
                            {note.category}
                          </span>
                        )}
                      </div>

                      {/* Note Title */}
                      <h3 className='font-bold text-gray-800 group-hover:text-amber-700 transition-colors duration-300 mb-3 line-clamp-2'>
                        {note.title}
                      </h3>

                      {/* Note Content Preview */}
                      <p className='text-gray-600 text-sm line-clamp-3 mb-4'>
                        {note.content}
                      </p>

                      {/* Note Metadata */}
                      <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>
                          📅 {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <motion.div
                          className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className='w-2 h-2 bg-amber-400 rounded-full'></div>
                        </motion.div>
                      </div>

                      {/* Hover Effect Line */}
                      <div className='absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 group-hover:w-full transition-all duration-300'></div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Recent Projects and Upcoming Events */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className='p-0 overflow-hidden bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-xl'
            elevated
          >
            <div className='p-8'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                  <FolderOpen className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent'>
                  Recent Projects
                </h2>
                <Link
                  to='/projects'
                  className='ml-auto text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition-colors'
                >
                  View All →
                </Link>
              </div>
              <div className='space-y-4'>
                {recentProjects.length === 0 ? (
                  <motion.div
                    className='text-center py-12'
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <FolderOpen className='w-8 h-8 text-blue-400' />
                    </div>
                    <p className='text-gray-600 font-medium'>No projects yet</p>
                    <p className='text-gray-400 text-sm mt-1'>
                      Start your first project to see it here
                    </p>
                  </motion.div>
                ) : (
                  recentProjects.map((project, idx) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      onClick={() => onProjectClick(project)}
                      className='group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-all duration-300 border border-transparent hover:border-blue-200'
                    >
                      <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                        <FolderOpen className='w-5 h-5 text-white' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 truncate'>
                          {project.name}
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              project.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : project.status === 'Active'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {project.status}
                          </span>
                          {project.priority && (
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                project.priority === 'High'
                                  ? 'bg-red-100 text-red-700'
                                  : project.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {project.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <motion.div
                        className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                      </motion.div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            className='p-0 overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 shadow-xl'
            elevated
          >
            <div className='p-8'>
              <div className='flex items-center gap-4 mb-6'>
                <div className='p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg'>
                  <Calendar className='w-6 h-6 text-white' />
                </div>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                  Upcoming Events
                </h2>
                <Link
                  to='/calendar'
                  className='ml-auto text-orange-600 hover:text-orange-700 text-sm font-semibold hover:underline transition-colors'
                >
                  View Calendar →
                </Link>
              </div>
              <div className='space-y-4'>
                {upcomingEvents.length === 0 ? (
                  <motion.div
                    className='text-center py-12'
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Calendar className='w-8 h-8 text-orange-400' />
                    </div>
                    <p className='text-gray-600 font-medium'>
                      No upcoming events
                    </p>
                    <p className='text-gray-400 text-sm mt-1'>
                      Schedule your first event to see it here
                    </p>
                  </motion.div>
                ) : (
                  upcomingEvents.map((event, idx) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className='group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 cursor-pointer transition-all duration-300 border border-transparent hover:border-orange-200'
                    >
                      <div className='p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                        <Calendar className='w-5 h-5 text-white' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300 truncate'>
                          {event.title}
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700'>
                            📅{' '}
                            {new Date(event.startDate).toLocaleDateString(
                              undefined,
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}{' '}
                            at{' '}
                            {new Date(event.startDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className='w-2 h-2 bg-orange-400 rounded-full'></div>
                      </motion.div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ActionZone;
