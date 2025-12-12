import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CheckSquare,
  Calendar,
  Clock,
  TrendingUp,
  FolderOpen,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import TaskModal from './TaskModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getProjects,
  Task,
  Project,
} from '../../lib/api/api';
import ProjectDetailsModal from '../projects/ProjectDetailsModal';
import TaskCalendarModal from './TaskCalendarModal';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarModalDate, setCalendarModalDate] = useState<Date | null>(null);
  const [calendarModalTask, setCalendarModalTask] = useState<Task | null>(null);

  console.log('TasksPage render - loading:', loading, 'tasks:', tasks.length);

  useEffect(() => {
    console.log('TasksPage useEffect - loading data');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('TasksPage loadData - starting');
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        getTasks(),
        getProjects(),
      ]);
      console.log('TasksPage loadData - loaded:', { tasksData, projectsData });
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) {
      console.error('TasksPage loadData - failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('Create button clicked');
    setEditingTask(null);
    setModalOpen(true);
    console.log('Modal should be open now');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete._id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleSave = async (
    taskData: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    console.log('TasksPage handleSave called with:', taskData);
    try {
      if (editingTask) {
        console.log('Updating existing task');
        await updateTask(editingTask._id, taskData);
      } else {
        console.log('Creating new task');
        const createdTask = await createTask(taskData);
        // Add to calendar if dueDate exists
        if (createdTask.dueDate) {
          const { createEvent } = await import('../../lib/api/api');
          await createEvent({
            title: createdTask.name,
            description: '',
            startDate: createdTask.dueDate,
            endDate: createdTask.dueDate,
            allDay: true,
            type: 'Task',
            priority: createdTask.priority,
            status: 'Scheduled',
            color: '#f59e42',
          });
        }
      }
      console.log('Task saved successfully');
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // Mark as Completed handler
  const handleMarkCompleted = async (task: Task) => {
    try {
      await updateTask(task._id, { ...task, status: 'Completed' });
      await loadData();
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
    }
  };

  const getStatusStats = () => {
    const stats = {
      Active: 0,
      Completed: 0,
      Next: 0,
      Paused: 0,
    };

    tasks.forEach((task) => {
      stats[task.status]++;
    });

    return stats;
  };

  const statusStats = getStatusStats();

  // Helper to get related goals for a project
  function goalsForProject(project, allProjects, allTasks) {
    // This is a placeholder. You may want to adjust this logic to match your data model.
    // For now, it returns an empty array.
    return [];
  }

  console.log('TasksPage render - about to return JSX');

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <div className='flex flex-col items-center justify-center text-center'>
              <AlertTriangle className='w-12 h-12 text-red-500 mb-2' />
              <DialogTitle className='text-xl font-bold text-gray-900 mb-1'>
                Delete Task?
              </DialogTitle>
              <p className='text-gray-600 mb-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold text-red-600'>
                  {taskToDelete?.name}
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
      {/* page content */}
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
                <div className='p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg'>
                  <CheckSquare className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'>
                  Tasks
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Manage tasks with dependencies, attachments, and detailed
                progress tracking.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              Create Task
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className='p-6 bg-white border border-gray-100 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-orange-100 rounded-lg'>
                    <CheckSquare className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {tasks.length}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Tasks
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
              <Card className='p-6 bg-white border border-gray-100 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-blue-100 rounded-lg'>
                    <TrendingUp className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats['Active']}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>Active</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className='p-6 bg-white border border-gray-100 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-green-100 rounded-lg'>
                    <Calendar className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats.Completed}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Completed
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
              <Card className='p-6 bg-white border border-gray-100 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-red-100 rounded-lg'>
                    <Clock className='w-6 h-6 text-red-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats.Paused}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>Paused</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex flex-wrap gap-4 items-center bg-gradient-to-r from-white to-orange-50 p-6 rounded-xl shadow-lg border-2 border-orange-200 mb-0'
          >
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2 text-orange-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  Status:
                </label>
                <div className='relative'>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-orange-300 hover:shadow-lg cursor-pointer min-w-[140px]'
                  >
                    <option
                      value='All'
                      className='font-medium py-2'
                    >
                      🌟 All Status
                    </option>
                    <option
                      value='Active'
                      className='font-medium py-2'
                    >
                      🚀 Active
                    </option>
                    <option
                      value='Completed'
                      className='font-medium py-2'
                    >
                      🏆 Completed
                    </option>
                    <option
                      value='Paused'
                      className='font-medium py-2'
                    >
                      ⏸️ Paused
                    </option>
                    <option
                      value='Next'
                      className='font-medium py-2'
                    >
                      ⏭️ Next
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-orange-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className='flex items-center space-x-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2 text-orange-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  Priority:
                </label>
                <div className='relative'>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-orange-300 hover:shadow-lg cursor-pointer min-w-[140px]'
                  >
                    <option
                      value='all'
                      className='font-medium py-2'
                    >
                      🎯 All Priorities
                    </option>
                    <option
                      value='High'
                      className='font-medium py-2'
                    >
                      🔥 High
                    </option>
                    <option
                      value='Medium'
                      className='font-medium py-2'
                    >
                      ⚡ Medium
                    </option>
                    <option
                      value='Low'
                      className='font-medium py-2'
                    >
                      🌱 Low
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-orange-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Data Table replaced with Card Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
            {tasks.filter(
              (task) =>
                (statusFilter === 'All' || task.status === statusFilter) &&
                (priorityFilter === 'all' || task.priority === priorityFilter)
            ).length === 0 && !loading ? (
              <div className='col-span-full text-center text-gray-500 py-12'>
                No tasks found.
              </div>
            ) : (
              tasks
                .filter(
                  (task) =>
                    (statusFilter === 'All' || task.status === statusFilter) &&
                    (priorityFilter === 'all' ||
                      task.priority === priorityFilter)
                )
                .sort((a, b) => {
                  if (a.status === 'Completed' && b.status !== 'Completed')
                    return 1;
                  if (a.status !== 'Completed' && b.status === 'Completed')
                    return -1;
                  return 0;
                })
                .map((task) => {
                  const project =
                    typeof task.projectId === 'object' &&
                    task.projectId !== null
                      ? task.projectId
                      : projects.find((p) => p._id === task.projectId);
                  const isCompleted = task.status === 'Completed';
                  const statusColor = isCompleted
                    ? 'border-green-400'
                    : task.status === 'Active'
                    ? 'border-blue-400'
                    : task.status === 'Next'
                    ? 'border-purple-400'
                    : task.status === 'Paused'
                    ? 'border-yellow-400'
                    : 'border-gray-300';
                  const statusBg = isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-green-100'
                    : task.status === 'Active'
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                    : task.status === 'Next'
                    ? 'bg-gradient-to-br from-purple-50 to-purple-100'
                    : task.status === 'Paused'
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100'
                    : 'bg-white';
                  return (
                    <Card
                      key={task._id}
                      className={`p-7 ${statusBg} border border-orange-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white via-orange-50 to-orange-100`}
                    >
                      {/* Header */}
                      <div className='flex items-start justify-between mb-5 pb-2 border-b border-orange-100'>
                        <div className='flex items-center space-x-3 min-w-0'>
                          <div className='p-2 bg-gradient-to-br from-orange-200 to-orange-400 rounded-xl shadow-sm shrink-0'>
                            <CheckSquare className='w-5 h-5 text-white' />
                          </div>
                          <div className='min-w-0'>
                            <h3 className='text-lg font-bold text-gray-900 leading-tight mb-1 break-words'>
                              {task.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                      {/* Grouped Badges: Status, Priority, Type */}
                      <div className='mb-4 flex border-b border-orange-100 pb-2'>
                        <div className='flex items-center gap-2 flex-wrap bg-orange-50 rounded-xl px-3 py-2 mx-auto'>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
                              isCompleted
                                ? 'bg-green-200 text-green-800'
                                : task.status === 'Active'
                                ? 'bg-blue-200 text-blue-800'
                                : task.status === 'Next'
                                ? 'bg-purple-200 text-purple-800'
                                : task.status === 'Paused'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {task.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow ${
                              task.priority === 'High'
                                ? 'bg-red-200 text-red-800'
                                : task.priority === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-green-200 text-green-800'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 shadow'>
                            <FolderOpen className='w-4 h-4 mr-1 text-orange-500' />
                            {task.type}
                          </span>
                        </div>
                      </div>
                      {/* Stats: Due Date & Project */}
                      <div className='grid grid-cols-2 gap-4 mb-4'>
                        <div
                          className={`text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-100 overflow-x-auto min-w-0 cursor-pointer transition hover:bg-blue-200 hover:shadow-lg ${
                            task.dueDate ? '' : 'opacity-60 cursor-default'
                          }`}
                          onClick={() => {
                            if (task.dueDate) {
                              setCalendarModalDate(new Date(task.dueDate));
                              setCalendarModalTask(task);
                              setCalendarModalOpen(true);
                            }
                          }}
                          tabIndex={task.dueDate ? 0 : -1}
                          role='button'
                          aria-label={
                            task.dueDate
                              ? `View due date for ${task.name}`
                              : undefined
                          }
                        >
                          <div className='text-xs font-medium text-blue-600 mb-1'>
                            Due Date
                          </div>
                          {task.dueDate ? (
                            <span className='text-xs font-bold text-blue-700 whitespace-nowrap w-full min-w-0'>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className='text-xs font-bold text-blue-700 whitespace-nowrap w-full min-w-0'>
                              —
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-100 overflow-hidden cursor-pointer transition hover:bg-indigo-200 ${
                            project?.name ? 'hover:shadow-lg' : ''
                          }`}
                          onClick={() => {
                            if (project?.name) {
                              setDetailsProject(project);
                              setProjectDetailsOpen(true);
                            }
                          }}
                          tabIndex={project?.name ? 0 : -1}
                          role='button'
                          aria-label={
                            project?.name
                              ? `View project ${project.name}`
                              : undefined
                          }
                        >
                          <div className='text-xs font-medium text-indigo-600 mb-1'>
                            Project
                          </div>
                          {project?.name ? (
                            <span className='text-base font-bold text-indigo-700 truncate hover:underline focus:outline-none'>
                              {project.name}
                            </span>
                          ) : (
                            <span className='text-base font-bold text-indigo-700 truncate'>
                              No Project
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Action Button */}
                      <div className='mt-auto pt-4 border-t border-blue-100'>
                        <Button
                          variant={isCompleted ? 'outline' : 'primary'}
                          size='sm'
                          className={`w-full ${
                            isCompleted
                              ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                          }`}
                          disabled={isCompleted}
                          onClick={() =>
                            !isCompleted && handleMarkCompleted(task)
                          }
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className='w-4 h-4 mr-2' />
                              Completed
                            </>
                          ) : (
                            <>
                              <CheckSquare className='w-4 h-4 mr-2' />
                              Mark as Completed
                            </>
                          )}
                        </Button>
                      </div>
                      <div className='flex items-center justify-between pt-4 border-t border-amber-100 mt-auto'>
                        <span className='text-xs text-gray-500'>
                          {new Date(task.updatedAt).toLocaleDateString()}
                        </span>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            onClick={() => handleEdit(task)}
                            className='border-gray-200 text-gray-600 hover:bg-gray-50'
                          >
                            Edit
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(task)}
                            className='border-red-200 text-red-500 hover:bg-red-50'
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
      />
      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={projectDetailsOpen}
        onClose={() => {
          setProjectDetailsOpen(false);
          setDetailsProject(null);
        }}
        project={detailsProject}
        relatedGoals={
          detailsProject ? goalsForProject(detailsProject, projects, tasks) : []
        }
        relatedTasks={
          detailsProject
            ? tasks.filter((t) => t.projectId === detailsProject._id)
            : []
        }
      />
      {/* Calendar Modal */}
      <TaskCalendarModal
        open={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        task={calendarModalTask}
        date={calendarModalDate}
      />
    </>
  );
};

export default TasksPage;
