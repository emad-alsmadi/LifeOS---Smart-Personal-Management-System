import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  CheckCircle,
  FolderOpen,
  BookOpen,
  Star,
  StickyNote,
  LayoutDashboard,
  Activity,
  Eye,
  Plus,
  ArrowRight,
  MapPin,
  Tag,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart,
  TrendingUp,
  Trophy,
  Focus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import {
  getProjects,
  getTasks,
  getNotes,
  getEvents,
  getGoals,
  Project,
  Task,
  Note,
  Event,
  Goal,
  getObjectives,
  Objective,
  createTask,
  createProject,
  createNote,
  createEvent,
  getGoalsWithObjectiveProgress,
  GoalWithProgress,
  getHabits,
  Habit,
  completeHabit,
  uncompleteHabit,
} from '../lib/api/api';
import ProjectModal from './projects/ProjectModal';
import TaskModal from './tasks/TaskModal';
import NoteModal from './notes/NoteModal';
import CalendarEventModal from './calendar/CalendarEventModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import TaskCalendarModal from './tasks/TaskCalendarModal';

const ActionZone: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [projectDetailsProject, setProjectDetailsProject] =
    useState<Project | null>(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarModalDate, setCalendarModalDate] = useState<Date | null>(null);
  const [calendarModalTask, setCalendarModalTask] = useState<Task | null>(null);
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [completedTaskName, setCompletedTaskName] = useState('');
  const [detailsProjectRelatedObjectives, setDetailsProjectRelatedObjectives] =
    useState<Objective[]>([]);
  const [detailsProjectRelatedGoals, setDetailsProjectRelatedGoals] = useState<
    Goal[]
  >([]);
  const [detailsProjectRelatedTasks, setDetailsProjectRelatedTasks] = useState<
    Task[]
  >([]);
  const [allGoals, setAllGoals] = useState<GoalWithProgress[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [objectiveDetailsOpen, setObjectiveDetailsOpen] = useState(false);
  const [detailsObjective, setDetailsObjective] = useState<Objective | null>(
    null
  );
  const [detailsRelatedProjects, setDetailsRelatedProjects] = useState<
    Project[]
  >([]);
  const [detailsRelatedGoals, setDetailsRelatedGoals] = useState<Goal[]>([]);
  const [
    detailsObjectiveRelatedObjectives,
    setDetailsObjectiveRelatedObjectives,
  ] = useState<Objective[]>([]);
  const [detailsObjectiveRelatedTasks, setDetailsObjectiveRelatedTasks] =
    useState<Task[]>([]);
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [noteDetailsOpen, setNoteDetailsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    console.log('[ActionZone] useEffect - start');
    loadData();
    loadObjectivesAndTasks();
    loadAllProjects();
  }, []);

  // Debug showTaskModal state changes
  React.useEffect(() => {
    console.log('[ActionZone] showTaskModal changed to:', showTaskModal);
  }, [showTaskModal]);

  const loadData = async () => {
    try {
      console.log('[ActionZone] loadData - start');
      setLoading(true);
      const [projectsData, tasksData, notesData, eventsData, habitsData] =
        await Promise.all([
          getProjects(),
          getTasks(),
          getNotes(),
          getEvents(),
          getHabits(),
        ]);
      console.log('[ActionZone] loadData - data loaded', {
        projectsData,
        tasksData,
        notesData,
        eventsData,
        habitsData,
      });
      setProjects(projectsData);
      setTasks(tasksData);
      setNotes(notesData);
      setEvents(eventsData);
      setHabits(habitsData);
    } catch (err) {
      console.error('[ActionZone] loadData - error', err);
    } finally {
      setLoading(false);
      console.log('[ActionZone] loadData - setLoading(false)');
    }
  };

  const loadObjectivesAndTasks = async () => {
    try {
      const [objectives, tasks, goals] = await Promise.all([
        getObjectives(),
        getTasks(),
        getGoalsWithObjectiveProgress(),
      ]);
      setAllObjectives(objectives);
      setAllTasks(tasks);
      setAllGoals(goals);
      console.log('[ActionZone] loadObjectivesAndTasks - loaded', {
        objectives,
        tasks,
        goals,
      });
    } catch (err) {
      setAllObjectives([]);
      setAllTasks([]);
      setAllGoals([]);
      console.error('[ActionZone] loadObjectivesAndTasks - error', err);
    }
  };

  const loadAllProjects = async () => {
    try {
      const projectsData = await getProjects();
      setAllProjects(projectsData);
      console.log('[ActionZone] loadAllProjects - loaded', projectsData);
    } catch (err) {
      setAllProjects([]);
      console.error('[ActionZone] loadAllProjects - error', err);
    }
  };

  const getRecentTasks = () => {
    return tasks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getRecentProjects = () => {
    return projects.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const handleOpenProjectModal = () => setShowProjectModal(true);
  const handleCloseProjectModal = () => setShowProjectModal(false);
  const handleProjectSave = async (projectData: any) => {
    try {
      await createProject(projectData);
      setShowProjectModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleOpenTaskModal = () => {
    console.log(
      'ActionZone: handleOpenTaskModal called, setting showTaskModal to true'
    );
    setShowTaskModal(true);
  };
  const handleCloseTaskModal = () => setShowTaskModal(false);
  const handleTaskSave = async (
    taskData: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createTask(taskData);
      setShowTaskModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleOpenNoteModal = () => setShowNoteModal(true);
  const handleCloseNoteModal = () => setShowNoteModal(false);
  const handleNoteSave = async (noteData: any) => {
    try {
      const { id, ...rest } = noteData;
      await createNote(rest);
      setShowNoteModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleOpenEventModal = () => setShowEventModal(true);
  const handleCloseEventModal = () => setShowEventModal(false);
  const toISODate = (dateStr: string, endOfDay = false) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString();
  };
  const handleEventSave = async (
    eventData: Omit<Event, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createEvent({
        ...eventData,
        startDate: toISODate(eventData.startDate),
        endDate: toISODate(eventData.endDate, true),
      });
      setShowEventModal(false);
      await loadData();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const noteCategories = Array.from(
    new Set(notes.map((n) => n.category).filter(Boolean))
  );

  // Handler functions for ActionZone
  const handleTaskComplete = async (taskId: string) => {
    try {
      await import('../lib/api/api').then(async (api) => {
        const task = tasks.find((t) => t._id === taskId);
        if (task) {
          await api.updateTask(taskId, { ...task, status: 'Completed' });

          // Show success message
          setCompletedTaskName(task.name);
          setShowSuccessMessage(true);

          // Hide success message after 3 seconds
          setTimeout(() => {
            setShowSuccessMessage(false);
            setCompletedTaskName('');
          }, 3000);
        }
      });
      await loadData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleProjectClick = async (project: Project) => {
    setProjectDetailsOpen(false);
    setProjectDetailsProject(null);
    setDetailsProjectRelatedObjectives([]);
    setDetailsProjectRelatedGoals([]);
    setDetailsProjectRelatedTasks([]);
    try {
      setProjectDetailsProject(project);
      if (project) {
        // Find objectives related to this project
        const relatedObjectives = allObjectives.filter((obj) =>
          (obj.relatedProjects || []).some(
            (p: any) => (typeof p === 'string' ? p : p._id) === project._id
          )
        );
        setDetailsProjectRelatedObjectives(relatedObjectives);

        // Find goals related to this project (via objectives)
        const relatedGoalIds = relatedObjectives
          .flatMap((obj) =>
            (obj.relatedGoals || []).map((g: any) =>
              typeof g === 'string' ? g : g._id
            )
          )
          .filter(Boolean);
        const relatedGoals = allGoals.filter((goal: any) =>
          relatedGoalIds.includes(goal._id)
        );
        setDetailsProjectRelatedGoals(relatedGoals);

        // Find tasks related to this project
        const relatedTasks = allTasks.filter(
          (task: any) => task.projectId === project._id
        );
        setDetailsProjectRelatedTasks(relatedTasks);
      }
      setProjectDetailsOpen(true);
    } catch (error) {
      console.error('Failed to load project details:', error);
      setProjectDetailsProject(null);
      setDetailsProjectRelatedObjectives([]);
      setDetailsProjectRelatedGoals([]);
      setDetailsProjectRelatedTasks([]);
      setProjectDetailsOpen(true);
    }
  };

  const handleTaskClick = (task: Task) => {
    console.log('[ActionZone] handleTaskClick - start', task);
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const handleObjectiveClick = async (objectiveId: string) => {
    // Reset state
    setObjectiveDetailsOpen(false);
    setDetailsObjective(null);
    setDetailsRelatedProjects([]);
    setDetailsRelatedGoals([]);
    setDetailsObjectiveRelatedObjectives([]);
    setDetailsObjectiveRelatedTasks([]);

    try {
      const [objectives, projects, goals, tasks] = await Promise.all([
        getObjectives(),
        getProjects(),
        getGoals(),
        getTasks(),
      ]);

      const obj =
        objectives.find((o: Objective) => o._id === objectiveId) || null;
      setDetailsObjective(obj);

      if (obj) {
        // Find related projects
        const relatedProjectIds: string[] = (obj.relatedProjects || [])
          .map((p: string | { _id: string }) => {
            if (typeof p === 'string') return p;
            if (
              typeof p === 'object' &&
              p !== null &&
              typeof p._id === 'string'
            )
              return p._id;
            return '';
          })
          .filter(Boolean);
        setDetailsRelatedProjects(
          projects.filter((p: Project) => relatedProjectIds.includes(p._id))
        );

        // Find related goals
        const relatedGoalIds: string[] = (obj.relatedGoals || [])
          .map((g: string | { _id: string }) => {
            if (typeof g === 'string') return g;
            if (
              typeof g === 'object' &&
              g !== null &&
              typeof g._id === 'string'
            )
              return g._id;
            return '';
          })
          .filter(Boolean);
        setDetailsRelatedGoals(
          goals.filter((g: Goal) => relatedGoalIds.includes(g._id))
        );

        // Find related objectives (objectives that reference this objective)
        const relatedObjectives = objectives.filter(
          (o: Objective) =>
            o._id !== obj._id &&
            ((o.relatedGoals || []).some((g: string | { _id: string }) => {
              const gId = typeof g === 'string' ? g : g._id;
              return relatedGoalIds.includes(gId);
            }) ||
              (o.relatedProjects || []).some((p: string | { _id: string }) => {
                const pId = typeof p === 'string' ? p : p._id;
                return relatedProjectIds.includes(pId);
              }))
        );
        setDetailsObjectiveRelatedObjectives(relatedObjectives);

        // Find related tasks (tasks from related projects)
        const relatedTasks = tasks.filter((t: Task) =>
          relatedProjectIds.includes(t.projectId || '')
        );
        setDetailsObjectiveRelatedTasks(relatedTasks);
      }

      setObjectiveDetailsOpen(true);
    } catch (error) {
      console.error('Failed to load objective details:', error);
      setDetailsObjective(null);
      setDetailsRelatedProjects([]);
      setDetailsRelatedGoals([]);
      setDetailsObjectiveRelatedObjectives([]);
      setDetailsObjectiveRelatedTasks([]);
      setObjectiveDetailsOpen(true);
    }
  };

  const handleGoalClick = async (goalId: string) => {
    try {
      const goals = await getGoals();
      const goal = goals.find((g: Goal) => g._id === goalId);
      if (goal) {
        setDetailsGoal(goal);
        setGoalDetailsOpen(true);
      }
    } catch (error) {
      console.error('Failed to load goal:', error);
    }
  };

  const handleEventClick = (event: Event) => {
    console.log('[ActionZone] handleEventClick - start', event);
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const handleNoteClick = (note: Note) => {
    console.log('[ActionZone] handleNoteClick - start', note);
    setSelectedNote(note);
    setNoteDetailsOpen(true);
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
      await loadData();
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

  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  if (loading) {
    return (
      <div className='layout-corporate flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 shadow-corporate'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen pb-16 bg-background'>
      <div className='w-full max-w-none px-4 sm:px-6 lg:px-8 pt-8 mx-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-4'
        >
          {/* ===== QUICK ACTIONS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className='p-4 bg-gradient-to-br from-white to-purple-50 border border-purple-200 shadow-sm'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-2'>
                  <div className='p-2 bg-purple-500 rounded-lg'>
                    <Zap className='w-5 h-5 text-white' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Quick Actions
                  </h2>
                </div>
                <span className='text-sm text-purple-600 font-medium'>
                  Get things done fast
                </span>
              </div>

              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {/* Create Task */}
                <motion.button
                  onClick={handleOpenTaskModal}
                  className='flex items-center gap-3 p-3 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200 group'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                    <CheckCircle className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium text-gray-900 group-hover:text-orange-700 transition-colors duration-200 text-sm'>
                    New Task
                  </span>
                </motion.button>

                {/* Create Project */}
                <motion.button
                  onClick={handleOpenProjectModal}
                  className='flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                    <FolderOpen className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200 text-sm'>
                    New Project
                  </span>
                </motion.button>

                {/* Create Note */}
                <motion.button
                  onClick={handleOpenNoteModal}
                  className='flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200 group'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                    <StickyNote className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium text-gray-900 group-hover:text-amber-700 transition-colors duration-200 text-sm'>
                    New Note
                  </span>
                </motion.button>

                {/* Create Event */}
                <motion.button
                  onClick={handleOpenEventModal}
                  className='flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all duration-200 group'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                    <Calendar className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-200 text-sm'>
                    New Event
                  </span>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* ===== GOALS PROGRESS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              className='p-0 overflow-hidden bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-xl'
              elevated
            >
              <div className='flex items-center gap-4 px-8 pt-8 pb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white'>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <Target className='w-7 h-7 text-white' />
                </div>
                <div className='flex items-center gap-3'>
                  <h2 className='text-3xl font-display font-bold'>
                    Goals Progress
                  </h2>
                  <div className='h-1 w-12 bg-white/60 rounded-full'></div>
                </div>
                <span className='ml-auto text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm'>
                  {allGoals.length} goals
                </span>
              </div>

              <div className='p-4'>
                {allGoals.length === 0 ? (
                  <motion.div
                    className='text-center py-12'
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <Target className='w-10 h-10 text-blue-500' />
                    </div>
                    <p className='text-gray-800 text-xl font-semibold mb-2'>
                      No goals set yet!
                    </p>
                    <p className='text-gray-600 text-sm mb-6'>
                      Set your first goal to start tracking progress.
                    </p>
                    <Link to='/goals'>
                      <Button className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2'>
                        <Plus className='w-4 h-4' />
                        Create Your First Goal
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className='space-y-3'>
                    {/* Overall Progress Summary */}
                    <div className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-200/50 shadow-xl'>
                      {/* Background Pattern */}
                      <div className='absolute inset-0 opacity-5'>
                        <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl'></div>
                        <div className='absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl'></div>
                      </div>

                      <div className='relative'>
                        <div className='flex items-center justify-between mb-6'>
                          <div>
                            <h3 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1'>
                              Overall Progress
                            </h3>
                            <p className='text-sm text-blue-600/80'>
                              Your journey to success
                            </p>
                          </div>
                          <div className='text-right'>
                            <div className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                              {Math.round(
                                allGoals.reduce(
                                  (sum, goal) =>
                                    sum + (goal.progressPercent || 0),
                                  0
                                ) / allGoals.length
                              )}
                              %
                            </div>
                            <div className='text-sm text-blue-600/70 font-medium'>
                              Average Completion
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Overall Progress Bar */}
                        <div className='relative w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full h-6 overflow-hidden shadow-inner border border-gray-300/30'>
                          {/* Background Pattern */}
                          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'></div>

                          <motion.div
                            className='h-full relative rounded-full overflow-hidden'
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.round(
                                allGoals.reduce(
                                  (sum, goal) =>
                                    sum + (goal.progressPercent || 0),
                                  0
                                ) / allGoals.length
                              )}%`,
                            }}
                            transition={{
                              duration: 2,
                              delay: 0.5,
                              ease: 'easeOut',
                            }}
                          >
                            {/* Multi-layered gradient progress */}
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600'></div>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse'></div>
                            <div
                              className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse'
                              style={{ animationDelay: '0.5s' }}
                            ></div>

                            {/* Animated particles */}
                            <div className='absolute inset-0'>
                              <div
                                className='absolute top-1/2 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping'
                                style={{ animationDelay: '0.2s' }}
                              ></div>
                              <div
                                className='absolute top-1/3 right-1/3 w-1 h-1 bg-white/60 rounded-full animate-ping'
                                style={{ animationDelay: '0.8s' }}
                              ></div>
                              <div
                                className='absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/60 rounded-full animate-ping'
                                style={{ animationDelay: '1.4s' }}
                              ></div>
                            </div>
                          </motion.div>

                          {/* Progress percentage overlay */}
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-xs font-bold text-gray-700 drop-shadow-sm'>
                              {Math.round(
                                allGoals.reduce(
                                  (sum, goal) =>
                                    sum + (goal.progressPercent || 0),
                                  0
                                ) / allGoals.length
                              )}
                              %
                            </span>
                          </div>
                        </div>

                        {/* Enhanced Progress Stats */}
                        <div className='grid grid-cols-3 gap-4 mt-4'>
                          <div className='text-center group'>
                            <div className='relative'>
                              <div className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300'>
                                {allGoals.length}
                              </div>
                              <div className='absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            </div>
                            <div className='text-sm text-blue-600/80 font-medium mt-1'>
                              Total Goals
                            </div>
                          </div>
                          <div className='text-center group'>
                            <div className='relative'>
                              <div className='text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300'>
                                {
                                  allGoals.filter(
                                    (goal) => goal.status === 'Completed'
                                  ).length
                                }
                              </div>
                              <div className='absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            </div>
                            <div className='text-sm text-green-600/80 font-medium mt-1'>
                              Completed
                            </div>
                          </div>
                          <div className='text-center group'>
                            <div className='relative'>
                              <div className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300'>
                                {
                                  allGoals.filter(
                                    (goal) => goal.status === 'Active'
                                  ).length
                                }
                              </div>
                              <div className='absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                            </div>
                            <div className='text-sm text-orange-600/80 font-medium mt-1'>
                              Active
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Goals Progress */}
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 mb-4'>
                        Top Goals Progress
                      </h3>
                      <div className='space-y-2'>
                        {allGoals
                          .sort(
                            (a, b) =>
                              (b.progressPercent || 0) -
                              (a.progressPercent || 0)
                          )
                          .slice(0, 3)
                          .map((goal, idx) => (
                            <motion.div
                              key={goal._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className='group relative p-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 border border-gray-200/50 rounded-2xl hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden'
                              onClick={() => handleGoalClick(goal._id)}
                            >
                              {/* Background Pattern */}
                              <div className='absolute inset-0 opacity-5'>
                                <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-2xl'></div>
                                <div className='absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl'></div>
                              </div>
                              <div className='relative'>
                                <div className='flex items-center justify-between mb-4'>
                                  <div className='flex items-center gap-4'>
                                    <div className='relative'>
                                      <div className='p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                                        <Target className='w-5 h-5 text-white' />
                                      </div>
                                      {/* Glow effect */}
                                      <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300'></div>
                                    </div>
                                    <div>
                                      <h4 className='font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300'>
                                        {goal.name}
                                      </h4>
                                      <div className='flex items-center gap-2 mt-2'>
                                        <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200/50 shadow-sm'>
                                          {goal.category}
                                        </span>
                                        <span
                                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                                            goal.status === 'Completed'
                                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200/50'
                                              : goal.status === 'Active'
                                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200/50'
                                              : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200/50'
                                          }`}
                                        >
                                          {goal.status === 'Completed'
                                            ? '✅'
                                            : goal.status === 'Active'
                                            ? '🔄'
                                            : '⏸️'}{' '}
                                          {goal.status}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='text-right'>
                                    <div className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300'>
                                      {goal.progressPercent || 0}%
                                    </div>
                                    <div className='text-xs text-gray-500 font-medium'>
                                      {goal.objectiveCount || 0} objectives
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced Individual Goal Progress Bar */}
                              <div className='relative w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full h-4 overflow-hidden shadow-inner border border-gray-300/30'>
                                {/* Background Pattern */}
                                <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent'></div>

                                <motion.div
                                  className='h-full relative rounded-full overflow-hidden'
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${goal.progressPercent || 0}%`,
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    delay: 0.3 + idx * 0.1,
                                    ease: 'easeOut',
                                  }}
                                >
                                  {/* Dynamic gradient based on progress */}
                                  <div
                                    className={`absolute inset-0 ${
                                      (goal.progressPercent || 0) <= 25
                                        ? 'bg-gradient-to-r from-red-500 via-red-600 to-pink-600'
                                        : (goal.progressPercent || 0) <= 50
                                        ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500'
                                        : (goal.progressPercent || 0) <= 75
                                        ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600'
                                        : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600'
                                    }`}
                                  ></div>

                                  {/* Shimmer effects */}
                                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-pulse'></div>
                                  <div
                                    className='absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse'
                                    style={{ animationDelay: '0.3s' }}
                                  ></div>

                                  {/* Animated sparkles */}
                                  <div className='absolute inset-0'>
                                    <div
                                      className='absolute top-1/2 left-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping'
                                      style={{ animationDelay: '0.2s' }}
                                    ></div>
                                    <div
                                      className='absolute top-1/3 right-1/3 w-1 h-1 bg-white/70 rounded-full animate-ping'
                                      style={{ animationDelay: '0.6s' }}
                                    ></div>
                                    <div
                                      className='absolute bottom-1/3 left-1/2 w-1 h-1 bg-white/70 rounded-full animate-ping'
                                      style={{ animationDelay: '1s' }}
                                    ></div>
                                  </div>

                                  {/* Progress glow effect */}
                                  <div
                                    className={`absolute inset-0 rounded-full ${
                                      (goal.progressPercent || 0) <= 25
                                        ? 'shadow-lg shadow-red-500/30'
                                        : (goal.progressPercent || 0) <= 50
                                        ? 'shadow-lg shadow-orange-500/30'
                                        : (goal.progressPercent || 0) <= 75
                                        ? 'shadow-lg shadow-yellow-500/30'
                                        : 'shadow-lg shadow-green-500/30'
                                    }`}
                                  ></div>
                                </motion.div>

                                {/* Progress percentage overlay */}
                                <div className='absolute inset-0 flex items-center justify-center'>
                                  <span className='text-xs font-bold text-gray-700 drop-shadow-sm'>
                                    {goal.progressPercent || 0}%
                                  </span>
                                </div>
                              </div>

                              {/* Enhanced Hover Indicator */}
                              <motion.div
                                className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                                whileHover={{ scale: 1.2 }}
                              >
                                <div className='relative'>
                                  <div className='w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg'></div>
                                  <div className='absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-ping opacity-75'></div>
                                </div>
                              </motion.div>

                              {/* Bottom accent line */}
                              <div className='absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-500 ease-out'></div>
                            </motion.div>
                          ))}
                      </div>

                      {/* Enhanced View All Goals Link */}
                      <div className='mt-8 text-center'>
                        <Link
                          to='/goals'
                          className='group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 font-semibold text-sm rounded-xl border border-blue-200/50 hover:border-blue-300/50 transition-all duration-300 shadow-sm hover:shadow-md'
                        >
                          <span>View All Goals</span>
                          <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* ===== ACTIVE TASKS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card
                className='p-0 overflow-hidden bg-gradient-to-br from-white to-orange-50 border-2 border-orange-100 shadow-xl'
                elevated
              >
                <div className='flex items-center gap-4 px-6 pt-6 pb-4 bg-gradient-to-r from-orange-500 to-red-600 text-white'>
                  <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                    <CheckCircle className='w-7 h-7 text-white' />
                  </div>
                  <div className='flex items-center gap-3'>
                    <h2 className='text-3xl font-display font-bold'>
                      Active Tasks
                    </h2>
                    <div className='h-1 w-12 bg-white/60 rounded-full'></div>
                  </div>
                  <span className='ml-auto text-sm font-semibold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm'>
                    {
                      tasks
                        .filter((task) => task.status === 'Active')
                        .slice(0, 5).length
                    }{' '}
                    tasks
                  </span>
                </div>

                <div className='divide-y divide-orange-100'>
                  {tasks.filter((task) => task.status === 'Active').slice(0, 5)
                    .length === 0 ? (
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
                          onClick={handleOpenTaskModal}
                          className='bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2'
                        >
                          <Plus className='w-4 h-4' />
                          Add New Task
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.status === 'Active')
                      .slice(0, 5)
                      .map((task, idx) => (
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
                          {/* Enhanced Checkbox */}
                          <label className='relative flex items-center cursor-pointer group'>
                            <input
                              type='checkbox'
                              checked={task.status === 'Completed'}
                              onChange={() => handleTaskComplete(task._id)}
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
                                    pathLength:
                                      task.status === 'Completed' ? 1 : 0,
                                  }}
                                  transition={{ duration: 0.4, delay: 0.1 }}
                                  strokeDasharray='1'
                                  strokeDashoffset={
                                    task.status === 'Completed' ? 0 : 1
                                  }
                                />
                              </motion.svg>
                            </motion.span>

                            {/* Hover Effect Ring */}
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
                            onClick={() => handleTaskClick(task)}
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

                                {/* Enhanced Badges Row */}
                                <div className='flex items-center gap-2 mt-3 flex-wrap'>
                                  {/* Due Date with Urgency Indicator */}
                                  {task.dueDate && (
                                    <motion.span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                                        new Date(task.dueDate) < new Date()
                                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                                          : new Date(task.dueDate) <
                                            new Date(
                                              Date.now() + 24 * 60 * 60 * 1000
                                            )
                                          ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                                          : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200'
                                      }`}
                                      whileHover={{ scale: 1.05 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {new Date(task.dueDate) < new Date()
                                        ? '🚨'
                                        : new Date(task.dueDate) <
                                          new Date(
                                            Date.now() + 24 * 60 * 60 * 1000
                                          )
                                        ? '⚠️'
                                        : '📅'}
                                      Due:{' '}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </motion.span>
                                  )}

                                  {/* Status Badge */}
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

                                  {/* Priority Badge */}
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

                                  {/* Task Type */}
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

                              {/* Progress Indicator */}
                              <div className='flex flex-col items-end gap-2 ml-4'>
                                {/* Task Type */}
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
            </motion.div>
          </motion.div>

          {/* ===== UPCOMING EVENTS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
              <div className='flex items-center space-x-2 mb-3'>
                <div className='p-1.5 bg-purple-500 rounded-lg'>
                  <Calendar className='w-4 h-4 text-white' />
                </div>
                <h2 className='text-lg font-bold text-gray-900'>
                  Upcoming Events
                </h2>
              </div>

              <div className='space-y-2'>
                {events.slice(0, 3).map((event) => (
                  <motion.div
                    key={event._id}
                    className='flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-purple-50 hover:shadow-md transition-all duration-300 cursor-pointer group'
                    onClick={() => handleEventClick(event)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className='p-1 bg-purple-100 rounded group-hover:bg-purple-200 transition-colors duration-300'>
                      <Calendar className='w-4 h-4 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-300'>
                        {event.title}
                      </div>
                      <div className='text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-300'>
                        {new Date(event.startDate).toLocaleDateString()} at{' '}
                        {new Date(event.startDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <ArrowRight className='w-4 h-4 text-purple-500' />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ===== RECENT PROJECTS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='p-1.5 bg-blue-500 rounded-lg'>
                    <FolderOpen className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Recent Projects
                  </h2>
                </div>
                <Link
                  to='/projects'
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                >
                  View All
                </Link>
              </div>

              <div className='space-y-2'>
                {projects.slice(0, 3).map((project) => (
                  <motion.div
                    key={project._id}
                    className='flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all duration-300 cursor-pointer group'
                    onClick={() => handleProjectClick(project)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className='p-1 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors duration-300'>
                      <FolderOpen className='w-4 h-4 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-300'>
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
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <ArrowRight className='w-4 h-4 text-blue-500' />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ===== DAILY HABITS SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='p-1.5 bg-green-500 rounded-lg'>
                    <Activity className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Daily Habits
                  </h2>
                </div>
                <Link
                  to='/habits'
                  className='text-green-600 hover:text-green-700 font-medium text-sm'
                >
                  View All
                </Link>
              </div>

              <div className='space-y-2'>
                {habits.slice(0, 3).map((habit) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isCompletedToday =
                    habit.completedDates?.includes(today) || false;
                  const streak = getStreakCount(habit);

                  return (
                    <motion.div
                      key={habit._id}
                      className='p-2 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-300 group'
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div className='p-1 bg-green-100 rounded group-hover:bg-green-200 transition-colors duration-300'>
                            <Activity className='w-4 h-4 text-green-600' />
                          </div>
                          <span className='font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-300'>
                            {habit.name}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          {streak > 0 && (
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200'>
                              🔥 {streak} day streak
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last 7 Days Progress */}
                      <div className='mb-3'>
                        <div className='flex space-x-1'>
                          {getLast7Days().map((date) => {
                            const dateString = date.toISOString().split('T')[0];
                            const isCompleted =
                              habit.completedDates?.includes(dateString) ||
                              false;
                            const isToday = dateString === today;

                            return (
                              <motion.button
                                key={dateString}
                                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                  isCompleted
                                    ? 'bg-green-500 border-green-500 hover:bg-green-600'
                                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                                } ${isToday ? 'ring-2 ring-green-300' : ''}`}
                                onClick={() =>
                                  toggleHabitCompletion(habit, dateString)
                                }
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={`${date.toLocaleDateString()}: ${
                                  isCompleted ? 'Completed' : 'Not completed'
                                }`}
                              >
                                {isCompleted && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className='w-full h-full flex items-center justify-center'
                                  >
                                    <CheckCircle className='w-3 h-3 text-white' />
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Today's Action Button */}
                      <button
                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isCompletedToday
                            ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                        }`}
                        onClick={() => toggleHabitCompletion(habit, today)}
                      >
                        {isCompletedToday ? (
                          <span className='flex items-center justify-center gap-2'>
                            <CheckCircle className='w-4 h-4' />
                            Completed Today
                          </span>
                        ) : (
                          <span className='flex items-center justify-center gap-2'>
                            <CheckCircle className='w-4 h-4' />
                            Mark Complete
                          </span>
                        )}
                      </button>
                    </motion.div>
                  );
                })}

                {habits.length === 0 && (
                  <div className='text-center py-4'>
                    <div className='w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                      <Activity className='w-6 h-6 text-green-500' />
                    </div>
                    <p className='text-gray-600 text-sm mb-2'>
                      No habits set yet
                    </p>
                    <Link
                      to='/habits'
                      className='text-green-600 hover:text-green-700 text-sm font-medium'
                    >
                      Create your first habit
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* ===== HIGHLIGHTED NOTES SECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='p-1.5 bg-amber-500 rounded-lg'>
                    <Star className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-lg font-bold text-gray-900'>
                    Highlighted Notes
                  </h2>
                </div>
                <Link
                  to='/notes'
                  className='text-amber-600 hover:text-amber-700 font-medium text-sm'
                >
                  View All
                </Link>
              </div>

              <div className='space-y-2'>
                {notes.slice(0, 3).map((note) => (
                  <motion.div
                    key={note._id}
                    className='p-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-pointer group'
                    onClick={() => handleNoteClick(note)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='p-1 bg-amber-100 rounded group-hover:bg-amber-200 transition-colors duration-300'>
                        <StickyNote className='w-4 h-4 text-amber-600' />
                      </div>
                      {note.category && (
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'>
                          {note.category}
                        </span>
                      )}
                      <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <ArrowRight className='w-4 h-4 text-amber-500' />
                      </div>
                    </div>
                    <div className='font-medium text-gray-900 mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors duration-300'>
                      {note.title}
                    </div>
                    <div className='text-sm text-gray-600 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors duration-300'>
                      {note.content}
                    </div>
                    <div className='text-xs text-gray-500 group-hover:text-amber-500 transition-colors duration-300'>
                      📅 {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Enhanced Success Message Toast */}
          <AnimatePresence>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -100, scale: 0.8, x: 100 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, y: -100, scale: 0.8, x: 100 }}
                transition={{
                  duration: 0.6,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                }}
                className='fixed top-6 right-6 z-50 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-2xl border border-green-300/50 backdrop-blur-sm'
              >
                {/* Background Pattern */}
                <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl'></div>
                <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl'></div>

                <div className='relative flex items-center gap-4'>
                  {/* Animated Icon */}
                  <motion.div
                    className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  >
                    <CheckCircle className='w-8 h-8 text-white' />
                  </motion.div>

                  {/* Content */}
                  <div className='flex-1'>
                    <motion.div
                      className='font-bold text-xl mb-1'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Task Completed! 🎉
                    </motion.div>
                    <motion.div
                      className='text-green-100 text-sm font-medium'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      "{completedTaskName}" has been marked as completed
                    </motion.div>
                    <motion.div
                      className='text-green-200 text-xs mt-2'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Great job staying productive! 💪
                    </motion.div>
                  </div>

                  {/* Progress Indicator */}
                  <motion.div
                    className='flex flex-col items-center gap-1'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className='w-2 h-2 bg-white/60 rounded-full animate-pulse'></div>
                    <div
                      className='w-1 h-1 bg-white/40 rounded-full animate-pulse'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className='w-1 h-1 bg-white/20 rounded-full animate-pulse'
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </motion.div>
                </div>

                {/* Auto-dismiss Progress Bar */}
                <motion.div
                  className='absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl'
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Event Details Modal */}
          <Dialog
            open={eventDetailsOpen}
            onOpenChange={setEventDetailsOpen}
          >
            <DialogContent className='max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200'>
              <DialogHeader className='pb-4'>
                <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
                  <div className='p-2 bg-purple-500 rounded-lg'>
                    <Calendar className='w-6 h-6 text-white' />
                  </div>
                  Event Details
                </DialogTitle>
              </DialogHeader>

              {selectedEvent && (
                <div className='space-y-6'>
                  {/* Event Title */}
                  <div className='bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200'>
                    <h3 className='text-xl font-bold text-purple-900 mb-2'>
                      {selectedEvent.title}
                    </h3>
                    <p className='text-purple-700'>
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Event Details Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Date & Time */}
                    <div className='bg-gray-50 p-4 rounded-xl'>
                      <div className='flex items-center gap-3 mb-2'>
                        <Calendar className='w-5 h-5 text-purple-600' />
                        <span className='font-semibold text-gray-900'>
                          Date & Time
                        </span>
                      </div>
                      <div className='text-gray-700'>
                        <div className='font-medium'>
                          {new Date(selectedEvent.startDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </div>
                        <div className='text-sm text-gray-600'>
                          {new Date(selectedEvent.startDate).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}{' '}
                          -{' '}
                          {new Date(selectedEvent.endDate).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {selectedEvent.location && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <MapPin className='w-5 h-5 text-purple-600' />
                          <span className='font-semibold text-gray-900'>
                            Location
                          </span>
                        </div>
                        <div className='text-gray-700 font-medium'>
                          {selectedEvent.location}
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {selectedEvent.category && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <Tag className='w-5 h-5 text-purple-600' />
                          <span className='font-semibold text-gray-900'>
                            Category
                          </span>
                        </div>
                        <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200'>
                          {selectedEvent.category}
                        </div>
                      </div>
                    )}

                    {/* Priority */}
                    {selectedEvent.priority && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <AlertTriangle className='w-5 h-5 text-purple-600' />
                          <span className='font-semibold text-gray-900'>
                            Priority
                          </span>
                        </div>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                            selectedEvent.priority === 'High'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : selectedEvent.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}
                        >
                          {selectedEvent.priority}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  {selectedEvent.notes && (
                    <div className='bg-amber-50 p-4 rounded-xl border border-amber-200'>
                      <div className='flex items-center gap-3 mb-2'>
                        <StickyNote className='w-5 h-5 text-amber-600' />
                        <span className='font-semibold text-gray-900'>
                          Additional Notes
                        </span>
                      </div>
                      <div className='text-gray-700'>{selectedEvent.notes}</div>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className='text-sm text-gray-500 text-center pt-4 border-t border-gray-200'>
                    Created on{' '}
                    {new Date(selectedEvent.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedEvent.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Task Details Modal */}
          <Dialog
            open={taskDetailsOpen}
            onOpenChange={setTaskDetailsOpen}
          >
            <DialogContent className='max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200'>
              <DialogHeader className='pb-4'>
                <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
                  <div className='p-2 bg-orange-500 rounded-lg'>
                    <CheckCircle className='w-6 h-6 text-white' />
                  </div>
                  Task Details
                </DialogTitle>
              </DialogHeader>

              {selectedTask && (
                <div className='space-y-6'>
                  {/* Task Title */}
                  <div className='bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200'>
                    <h3 className='text-xl font-bold text-orange-900 mb-2'>
                      {selectedTask.name}
                    </h3>
                    <p className='text-orange-700'>
                      Task Type: {selectedTask.type}
                    </p>
                  </div>

                  {/* Task Details Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Status */}
                    <div className='bg-gray-50 p-4 rounded-xl'>
                      <div className='flex items-center gap-3 mb-2'>
                        <CheckCircle className='w-5 h-5 text-orange-600' />
                        <span className='font-semibold text-gray-900'>
                          Status
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                          selectedTask.status === 'Completed'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : selectedTask.status === 'Active'
                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {selectedTask.status}
                      </div>
                    </div>

                    {/* Priority */}
                    {selectedTask.priority && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <AlertTriangle className='w-5 h-5 text-orange-600' />
                          <span className='font-semibold text-gray-900'>
                            Priority
                          </span>
                        </div>
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                            selectedTask.priority === 'High'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : selectedTask.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}
                        >
                          {selectedTask.priority}
                        </div>
                      </div>
                    )}

                    {/* Due Date */}
                    {selectedTask.dueDate && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <Calendar className='w-5 h-5 text-orange-600' />
                          <span className='font-semibold text-gray-900'>
                            Due Date
                          </span>
                        </div>
                        <div className='text-gray-700 font-medium'>
                          {new Date(selectedTask.dueDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Type */}
                    {selectedTask.type && (
                      <div className='bg-gray-50 p-4 rounded-xl'>
                        <div className='flex items-center gap-3 mb-2'>
                          <Tag className='w-5 h-5 text-orange-600' />
                          <span className='font-semibold text-gray-900'>
                            Type
                          </span>
                        </div>
                        <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200'>
                          {selectedTask.type}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className='text-sm text-gray-500 text-center pt-4 border-t border-gray-200'>
                    Created on{' '}
                    {new Date(selectedTask.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedTask.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Note Details Modal */}
          <Dialog
            open={noteDetailsOpen}
            onOpenChange={setNoteDetailsOpen}
          >
            <DialogContent className='max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200'>
              <DialogHeader className='pb-4'>
                <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
                  <div className='p-2 bg-amber-500 rounded-lg'>
                    <StickyNote className='w-6 h-6 text-white' />
                  </div>
                  Note Details
                </DialogTitle>
              </DialogHeader>

              {selectedNote && (
                <div className='space-y-6'>
                  {/* Note Title */}
                  <div className='bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200'>
                    <h3 className='text-xl font-bold text-amber-900 mb-2'>
                      {selectedNote.title}
                    </h3>
                    {selectedNote.category && (
                      <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 border border-amber-200'>
                        {selectedNote.category}
                      </div>
                    )}
                  </div>

                  {/* Note Content */}
                  <div className='bg-gray-50 p-6 rounded-xl'>
                    <div className='flex items-center gap-3 mb-4'>
                      <StickyNote className='w-5 h-5 text-amber-600' />
                      <span className='font-semibold text-gray-900'>
                        Content
                      </span>
                    </div>
                    <div className='text-gray-700 whitespace-pre-wrap'>
                      {selectedNote.content}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className='text-sm text-gray-500 text-center pt-4 border-t border-gray-200'>
                    Created on{' '}
                    {new Date(selectedNote.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedNote.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Project Details Modal */}
          <Dialog
            open={projectDetailsOpen}
            onOpenChange={setProjectDetailsOpen}
          >
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='p-3 bg-indigo-500 rounded-xl'>
                    <FolderOpen className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <DialogTitle className='text-2xl font-bold text-gray-900'>
                      {projectDetailsProject?.name || 'Project Details'}
                    </DialogTitle>
                    <div className='flex items-center space-x-2 mt-2'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          projectDetailsProject?.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : projectDetailsProject?.status === 'Active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {projectDetailsProject?.status || 'Unknown'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          projectDetailsProject?.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : projectDetailsProject?.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {projectDetailsProject?.priority || 'Medium'} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Project Dates */}
                {(projectDetailsProject?.startDate ||
                  projectDetailsProject?.dueDate) && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      Timeline
                    </h3>
                    <div className='flex items-center space-x-6 text-sm text-gray-600'>
                      {projectDetailsProject?.startDate && (
                        <div className='flex items-center space-x-2'>
                          <Calendar className='w-4 h-4' />
                          <span>
                            Start:{' '}
                            {new Date(
                              projectDetailsProject.startDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {projectDetailsProject?.dueDate && (
                        <div className='flex items-center space-x-2'>
                          <Calendar className='w-4 h-4' />
                          <span>
                            Due:{' '}
                            {new Date(
                              projectDetailsProject.dueDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Overview */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {detailsProjectRelatedObjectives.length}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Related Objectives
                      </div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {detailsProjectRelatedGoals.length}
                      </div>
                      <div className='text-sm text-gray-600'>Related Goals</div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {detailsProjectRelatedTasks.length}
                      </div>
                      <div className='text-sm text-gray-600'>Tasks</div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-green-600'>
                        {
                          detailsProjectRelatedTasks.filter(
                            (task) => task.status === 'Completed'
                          ).length
                        }
                      </div>
                      <div className='text-sm text-gray-600'>
                        Completed Tasks
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Related Objectives */}
                {detailsProjectRelatedObjectives.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Related Objectives
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {detailsProjectRelatedObjectives.map((objective) => (
                        <Card
                          key={objective._id}
                          className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                          onClick={() => {
                            setProjectDetailsOpen(false);
                            handleObjectiveClick(objective._id);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div className='p-2 bg-purple-100 rounded-lg'>
                                <Eye className='w-4 h-4 text-purple-600' />
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-900'>
                                  {objective.title}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {objective.priority} Priority
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                objective.status === 'Achieved'
                                  ? 'bg-green-100 text-green-700'
                                  : objective.status === 'Active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {objective.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Goals */}
                {detailsProjectRelatedGoals.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Related Goals
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {detailsProjectRelatedGoals.map((goal) => (
                        <Card
                          key={goal._id}
                          className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                          onClick={() => {
                            setProjectDetailsOpen(false);
                            handleGoalClick(goal._id);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div className='p-2 bg-blue-100 rounded-lg'>
                                <Target className='w-4 h-4 text-blue-600' />
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-900'>
                                  {goal.name}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {goal.category}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                goal.status === 'Completed'
                                  ? 'bg-green-100 text-green-700'
                                  : goal.status === 'Active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {goal.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Tasks */}
                {detailsProjectRelatedTasks.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Project Tasks
                    </h3>
                    <div className='space-y-2'>
                      {detailsProjectRelatedTasks.slice(0, 5).map((task) => (
                        <Card
                          key={task._id}
                          className='p-3 hover:shadow-sm transition-shadow'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  task.status === 'Completed'
                                    ? 'bg-green-500'
                                    : task.status === 'Active'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400'
                                }`}
                              ></div>
                              <div>
                                <h4 className='font-medium text-gray-900'>
                                  {task.name}
                                </h4>
                                {task.dueDate && (
                                  <p className='text-sm text-gray-600'>
                                    Due:{' '}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                task.status === 'Completed'
                                  ? 'bg-green-100 text-green-700'
                                  : task.status === 'Active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {detailsProjectRelatedTasks.length > 5 && (
                        <p className='text-sm text-gray-500 text-center'>
                          +{detailsProjectRelatedTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setProjectDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setProjectDetailsOpen(false);
                    // Navigate to projects page for editing
                    window.location.href = '/projects';
                  }}
                >
                  Edit Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Objective Details Modal */}
          <Dialog
            open={objectiveDetailsOpen}
            onOpenChange={setObjectiveDetailsOpen}
          >
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='p-3 bg-purple-500 rounded-xl'>
                    <Eye className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <DialogTitle className='text-2xl font-bold text-gray-900'>
                      {detailsObjective?.title || 'Objective Details'}
                    </DialogTitle>
                    <div className='flex items-center space-x-2 mt-2'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          detailsObjective?.status === 'Achieved'
                            ? 'bg-green-100 text-green-700'
                            : detailsObjective?.status === 'Active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {detailsObjective?.status || 'Unknown'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          detailsObjective?.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : detailsObjective?.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {detailsObjective?.priority || 'Medium'} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Objective Description */}
                {detailsObjective?.description && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      Description
                    </h3>
                    <p className='text-gray-700'>
                      {detailsObjective.description}
                    </p>
                  </div>
                )}

                {/* Progress Overview */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-indigo-600'>
                        {detailsRelatedProjects.length}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Related Projects
                      </div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-blue-600'>
                        {detailsRelatedGoals.length}
                      </div>
                      <div className='text-sm text-gray-600'>Related Goals</div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-purple-600'>
                        {detailsObjectiveRelatedObjectives.length}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Related Objectives
                      </div>
                    </div>
                  </Card>
                  <Card className='p-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-orange-600'>
                        {detailsObjectiveRelatedTasks.length}
                      </div>
                      <div className='text-sm text-gray-600'>Related Tasks</div>
                    </div>
                  </Card>
                </div>

                {/* Related Projects */}
                {detailsRelatedProjects.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Related Projects
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {detailsRelatedProjects.map((project) => (
                        <Card
                          key={project._id}
                          className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                          onClick={() => {
                            setObjectiveDetailsOpen(false);
                            setProjectDetailsProject(project);
                            setProjectDetailsOpen(true);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div className='p-2 bg-indigo-100 rounded-lg'>
                                <FolderOpen className='w-4 h-4 text-indigo-600' />
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-900'>
                                  {project.name}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {project.priority} Priority
                                </p>
                              </div>
                            </div>
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
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Goals */}
                {detailsRelatedGoals.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Related Goals
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                      {detailsRelatedGoals.map((goal) => (
                        <Card
                          key={goal._id}
                          className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                          onClick={() => {
                            setObjectiveDetailsOpen(false);
                            handleGoalClick(goal._id);
                          }}
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div className='p-2 bg-blue-100 rounded-lg'>
                                <Target className='w-4 h-4 text-blue-600' />
                              </div>
                              <div>
                                <h4 className='font-semibold text-gray-900'>
                                  {goal.name}
                                </h4>
                                <p className='text-sm text-gray-600'>
                                  {goal.category}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                goal.status === 'Completed'
                                  ? 'bg-green-100 text-green-700'
                                  : goal.status === 'Active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {goal.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Tasks */}
                {detailsObjectiveRelatedTasks.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                      Related Tasks
                    </h3>
                    <div className='space-y-2'>
                      {detailsObjectiveRelatedTasks.slice(0, 5).map((task) => (
                        <Card
                          key={task._id}
                          className='p-3 hover:shadow-sm transition-shadow'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  task.status === 'Completed'
                                    ? 'bg-green-500'
                                    : task.status === 'Active'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400'
                                }`}
                              ></div>
                              <div>
                                <h4 className='font-medium text-gray-900'>
                                  {task.name}
                                </h4>
                                {task.dueDate && (
                                  <p className='text-sm text-gray-600'>
                                    Due:{' '}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                task.status === 'Completed'
                                  ? 'bg-green-100 text-green-700'
                                  : task.status === 'Active'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </Card>
                      ))}
                      {detailsObjectiveRelatedTasks.length > 5 && (
                        <p className='text-sm text-gray-500 text-center'>
                          +{detailsObjectiveRelatedTasks.length - 5} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setObjectiveDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Goal Details Modal */}
          <Dialog
            open={goalDetailsOpen}
            onOpenChange={setGoalDetailsOpen}
          >
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
              <DialogHeader>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='p-3 bg-blue-500 rounded-xl'>
                    <Target className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <DialogTitle className='text-2xl font-bold text-gray-900'>
                      {detailsGoal?.name || 'Goal Details'}
                    </DialogTitle>
                    <div className='flex items-center space-x-2 mt-2'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800'>
                        {detailsGoal?.category || 'Goal'}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          detailsGoal?.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : detailsGoal?.status === 'Active'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {detailsGoal?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className='space-y-6'>
                {/* Goal Description */}
                {detailsGoal?.description && (
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      Description
                    </h3>
                    <p className='text-gray-700'>{detailsGoal.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setGoalDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Calendar Modal */}
          <TaskCalendarModal
            open={calendarModalOpen}
            onClose={() => setCalendarModalOpen(false)}
            task={calendarModalTask}
            date={calendarModalDate}
          />

          {/* Event Modal */}
          <CalendarEventModal
            open={showEventModal}
            onClose={handleCloseEventModal}
            onSave={handleEventSave}
            selectedDate={null}
            tasks={tasks}
          />

          {/* Project Modal */}
          <ProjectModal
            open={showProjectModal}
            onClose={handleCloseProjectModal}
            onSave={handleProjectSave}
          />

          {/* Task Modal */}
          <TaskModal
            open={showTaskModal}
            onClose={handleCloseTaskModal}
            onSave={handleTaskSave}
          />

          {/* Note Modal */}
          <NoteModal
            open={showNoteModal}
            onClose={handleCloseNoteModal}
            onSave={handleNoteSave}
            categories={noteCategories}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ActionZone;
