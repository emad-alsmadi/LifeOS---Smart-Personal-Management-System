import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Eye,
  Calendar,
  Target,
  Sparkles,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import ObjectiveModal from './ObjectiveModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import ObjectiveDetailsModal from './ObjectiveDetailsModal';
import ProjectDetailsModal from '../projects/ProjectDetailsModal';
import ProjectModal from '../projects/ProjectModal';
import GoalModal from '../goals/GoalModal';
import { getTasks, Task } from '../../lib/api/api';
import {
  getObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
  Objective,
  ObjectiveCreate,
} from '../../lib/api/api';
import { getProjects, getGoals, Goal, Project } from '../../lib/api/api';

const ObjectivesPage: React.FC = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] = useState<Objective | null>(
    null
  );
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [objectiveDetailsOpen, setObjectiveDetailsOpen] = useState(false);
  const [detailsObjective, setDetailsObjective] = useState<Objective | null>(
    null
  );
  const [detailsRelatedProjects, setDetailsRelatedProjects] = useState<any[]>(
    []
  );
  const [detailsRelatedGoals, setDetailsRelatedGoals] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allGoals, setAllGoals] = useState<any[]>([]);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);
  const [detailsProjectRelatedObjectives, setDetailsProjectRelatedObjectives] =
    useState<Objective[]>([]);
  const [detailsProjectRelatedGoals, setDetailsProjectRelatedGoals] = useState<
    Goal[]
  >([]);
  const [detailsProjectRelatedTasks, setDetailsProjectRelatedTasks] = useState<
    Task[]
  >([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [detailsGoalRelatedObjectives, setDetailsGoalRelatedObjectives] =
    useState<Objective[]>([]);
  const [detailsGoalRelatedProjects, setDetailsGoalRelatedProjects] = useState<
    Project[]
  >([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [objectivesData, projectsData, goalsData, tasksData] =
        await Promise.all([
          getObjectives(),
          getProjects(),
          getGoals(),
          getTasks(),
        ]);
      setObjectives(objectivesData);
      setAllProjects(projectsData);
      setAllGoals(goalsData);
      setAllTasks(tasksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingObjective(null);
    setModalOpen(true);
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setModalOpen(true);
  };

  const handleDelete = (objective: Objective) => {
    setObjectiveToDelete(objective);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!objectiveToDelete) return;
    try {
      await deleteObjective(objectiveToDelete._id);
      setDeleteDialogOpen(false);
      setObjectiveToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete objective:', error);
    }
  };

  const handleSave = async (
    objectiveData: ObjectiveCreate & { selectedProjectIds?: string[] }
  ) => {
    try {
      const { selectedProjectIds, ...objectiveDataWithoutSelected } =
        objectiveData;

      // Combine existing projects with newly selected ones
      const allProjectIds = [
        ...new Set([
          ...objectiveDataWithoutSelected.relatedProjects,
          ...(selectedProjectIds || []),
        ]),
      ];

      const payload = {
        ...objectiveDataWithoutSelected,
        relatedProjects: allProjectIds,
      };

      if (editingObjective) {
        await updateObjective(editingObjective._id, payload);
      } else {
        await createObjective(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save objective:', error);
    }
  };

  const handleObjectiveClick = async (objectiveId: string) => {
    setObjectiveDetailsOpen(false);
    setDetailsObjective(null);
    setDetailsRelatedProjects([]);
    setDetailsRelatedGoals([]);
    try {
      const objectives = await getObjectives();
      const obj =
        objectives.find((o: Objective) => o._id === objectiveId) || null;
      setDetailsObjective(obj);
      if (obj) {
        const [allProjects, allGoals] = await Promise.all([
          getProjects(),
          getGoals(),
        ]);
        const relatedProjectIds: string[] = (obj.relatedProjects || [])
          .map((p: string | { _id: string }) =>
            typeof p === 'string' ? p : p._id
          )
          .filter(Boolean);
        setDetailsRelatedProjects(
          allProjects.filter((p: any) => relatedProjectIds.includes(p._id))
        );
        const relatedGoalIds: string[] = (obj.relatedGoals || [])
          .map((g: string | { _id: string }) =>
            typeof g === 'string' ? g : g._id
          )
          .filter(Boolean);
        setDetailsRelatedGoals(
          allGoals.filter((g: any) => relatedGoalIds.includes(g._id))
        );
      }
      setObjectiveDetailsOpen(true);
    } catch {
      setDetailsObjective(null);
      setDetailsRelatedProjects([]);
      setDetailsRelatedGoals([]);
      setObjectiveDetailsOpen(true);
    }
  };

  const handleProjectClick = async (projectId: string) => {
    setProjectDetailsOpen(false);
    setDetailsProject(null);
    setDetailsProjectRelatedObjectives([]);
    setDetailsProjectRelatedGoals([]);
    setDetailsProjectRelatedTasks([]);
    try {
      const project = allProjects.find((p: any) => p._id === projectId) || null;
      setDetailsProject(project);
      if (project) {
        // Find objectives related to this project
        const relatedObjectives = objectives.filter((obj) =>
          (obj.relatedProjects || []).some(
            (p: any) => (typeof p === 'string' ? p : p._id) === projectId
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
          (task: any) => task.projectId === projectId
        );
        setDetailsProjectRelatedTasks(relatedTasks);
      }
      setProjectDetailsOpen(true);
    } catch {
      setDetailsProject(null);
      setDetailsProjectRelatedObjectives([]);
      setDetailsProjectRelatedGoals([]);
      setDetailsProjectRelatedTasks([]);
      setProjectDetailsOpen(true);
    }
  };

  const handleGoalClick = async (goalId: string) => {
    setGoalDetailsOpen(false);
    setDetailsGoal(null);
    setDetailsGoalRelatedObjectives([]);
    setDetailsGoalRelatedProjects([]);
    try {
      const goal = allGoals.find((g: any) => g._id === goalId) || null;
      setDetailsGoal(goal);
      if (goal) {
        // Find objectives related to this goal
        const relatedObjectives = objectives.filter((obj) =>
          (obj.relatedGoals || []).some(
            (g: any) => (typeof g === 'string' ? g : g._id) === goalId
          )
        );
        setDetailsGoalRelatedObjectives(relatedObjectives);

        // Find projects related to this goal (via objectives)
        const relatedProjectIds = relatedObjectives
          .flatMap((obj) =>
            (obj.relatedProjects || []).map((p: any) =>
              typeof p === 'string' ? p : p._id
            )
          )
          .filter(Boolean);
        const relatedProjects = allProjects.filter((project: any) =>
          relatedProjectIds.includes(project._id)
        );
        setDetailsGoalRelatedProjects(relatedProjects);
      }
      setGoalDetailsOpen(true);
    } catch {
      setDetailsGoal(null);
      setDetailsGoalRelatedObjectives([]);
      setDetailsGoalRelatedProjects([]);
      setGoalDetailsOpen(true);
    }
  };

  const getStatusStats = () => {
    const stats = {
      Active: 0,
      Achieved: 0,
      Paused: 0,
      Revised: 0,
      Next: 0,
    };
    objectives.forEach((objective) => {
      if (Object.prototype.hasOwnProperty.call(stats, objective.status)) {
        stats[objective.status]++;
      }
    });
    return stats;
  };

  const getFilteredObjectives = () => {
    return objectives.filter(
      (objective) =>
        (statusFilter === 'All' || objective.status === statusFilter) &&
        (priorityFilter === 'all' || objective.priority === priorityFilter)
    );
  };

  // Fix statusStats usage: only use valid keys
  const statusStats = getStatusStats();

  // Define types for relatedGoals and relatedProjects
  // Remove unused RelatedItem type

  // Type guard for related items
  function isRelatedObj(item: unknown): item is { _id: string; name: string } {
    return (
      typeof item === 'object' &&
      item !== null &&
      '_id' in item &&
      'name' in item
    );
  }

  const columns = [
    {
      key: 'title',
      label: 'Name',
      render: (value: string) => (
        <div className='flex items-center space-x-3'>
          <div className='p-2 bg-blue-100 rounded-lg'>
            <Eye className='w-4 h-4 text-blue-600' />
          </div>
          <span className='font-semibold text-gray-900'>{value}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'priority',
      label: 'Priority',
    },
    {
      key: 'relatedGoals',
      label: 'Goals',
      render: (value: { _id: string; name: string }[]) => (
        <div className='flex items-center space-x-2'>
          <Target className='w-4 h-4 text-blue-500' />
          <div className='flex flex-col'>
            {value && value.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {value
                  .slice(0, 2)
                  .map((goal: { _id: string; name: string }) => (
                    <button
                      key={goal._id}
                      onClick={() => handleGoalClick(goal._id)}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 hover:border-blue-300 transition-colors cursor-pointer'
                    >
                      {goal.name}
                    </button>
                  ))}
                {value.length > 2 && (
                  <span className='text-xs text-gray-500'>
                    +{value.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className='text-sm text-gray-500'>No goals</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'relatedProjects',
      label: 'Projects',
      render: (value: { _id: string; name: string }[]) => (
        <div className='flex items-center space-x-2'>
          <FolderOpen className='w-4 h-4 text-indigo-500' />
          <div className='flex flex-col'>
            {value && value.length > 0 ? (
              <div className='flex flex-wrap gap-1'>
                {value
                  .slice(0, 2)
                  .map((project: { _id: string; name: string }) => (
                    <button
                      key={project._id}
                      onClick={() => handleProjectClick(project._id)}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200 hover:border-indigo-300 transition-colors cursor-pointer'
                    >
                      {project.name}
                    </button>
                  ))}
                {value.length > 2 && (
                  <span className='text-xs text-gray-500'>
                    +{value.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className='text-sm text-gray-500'>No projects</span>
            )}
          </div>
        </div>
      ),
    },
  ];

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
                Delete Objective?
              </DialogTitle>
              <p className='text-gray-600 mb-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold text-red-600'>
                  {objectiveToDelete?.title}
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
                <div className='p-3 bg-purple-500 rounded-xl shadow-sm'>
                  <Eye className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold text-gray-800'>Objectives</h1>
              </div>
              <p className='text-lg text-gray-600'>
                Define your long-term objectives and aspirations to guide your
                goals and actions.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-purple-500 hover:bg-purple-600 text-white shadow-sm hover:shadow-md transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              Create Objective
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
                  <div className='p-3 bg-gray-100 rounded-lg'>
                    <Target className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {objectives.length}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>Total</p>
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
                  <div className='p-3 bg-purple-100 rounded-lg'>
                    <Eye className='w-6 h-6 text-purple-600' />
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
                    <Sparkles className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats['Achieved']}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Achieved
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
                  <div className='p-3 bg-yellow-100 rounded-lg'>
                    <Calendar className='w-6 h-6 text-yellow-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats['Next']}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>Next Up</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* View Toggle Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex items-center justify-between'
          >
            <div className='flex items-center space-x-2'>
              <h2 className='text-xl font-semibold text-gray-800'>
                All Objectives
              </h2>
              <span className='text-sm text-gray-500'>
                ({objectives.length} total)
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                onClick={() => setView('table')}
                variant={view === 'table' ? 'primary' : 'outline'}
                className={
                  view === 'table'
                    ? 'bg-purple-500 text-white'
                    : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                }
                size='sm'
              >
                Table View
              </Button>
              <Button
                onClick={() => setView('grid')}
                variant={view === 'grid' ? 'primary' : 'outline'}
                className={
                  view === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                }
                size='sm'
              >
                Card View
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='flex flex-wrap gap-4 items-center bg-gradient-to-r from-white to-purple-50 p-6 rounded-xl shadow-lg border-2 border-purple-200 mb-0'
          >
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2 text-purple-500'
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
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-purple-300 hover:shadow-lg cursor-pointer min-w-[140px]'
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
                      value='Achieved'
                      className='font-medium py-2'
                    >
                      🏆 Achieved
                    </option>
                    <option
                      value='Paused'
                      className='font-medium py-2'
                    >
                      ⏸️ Paused
                    </option>
                    <option
                      value='Revised'
                      className='font-medium py-2'
                    >
                      🔄 Revised
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
                      className='w-5 h-5 text-purple-500'
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
                    className='w-4 h-4 mr-2 text-purple-500'
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
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-purple-300 hover:shadow-lg cursor-pointer min-w-[140px]'
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
                      className='w-5 h-5 text-purple-500'
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

          {/* Content Area */}
          {view === 'table' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className='overflow-hidden bg-white border border-gray-100 shadow-sm'>
                <div className='bg-gray-50 px-6 py-4 border-b border-gray-100'>
                  <p className='text-sm text-gray-600'>
                    Manage and track all your objectives in table format
                  </p>
                </div>
                <DataTable
                  data={getFilteredObjectives()}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
                {getFilteredObjectives().map((objective) => {
                  // Related goals for this objective
                  const relatedGoalIds = (objective.relatedGoals || [])
                    .map((g: any) => (typeof g === 'string' ? g : g._id))
                    .filter(Boolean);
                  const relatedGoals = allGoals.filter((goal: any) =>
                    relatedGoalIds.includes(goal._id)
                  );
                  const totalGoals = relatedGoals.length;
                  const completedGoals = relatedGoals.filter(
                    (goal: any) => goal.status === 'Completed'
                  ).length;
                  const goalsProgress =
                    totalGoals > 0
                      ? Math.round((completedGoals / totalGoals) * 100)
                      : 0;

                  // Related projects for this objective
                  const relatedProjectIds = (objective.relatedProjects || [])
                    .map((p: any) => (typeof p === 'string' ? p : p._id))
                    .filter(Boolean);
                  const relatedProjects = allProjects.filter((project) =>
                    relatedProjectIds.includes(project._id)
                  );
                  const projectsProgress =
                    relatedProjects.length > 0
                      ? Math.round(
                          relatedProjects.reduce(
                            (sum, proj) => sum + (proj.progress || 0),
                            0
                          ) / relatedProjects.length
                        )
                      : 0;
                  const completedProjects = relatedProjects.filter(
                    (proj) => (proj.progress || 0) >= 100
                  ).length;
                  const relatedTasks = allTasks.filter((task) =>
                    relatedProjects.some(
                      (project) => project._id === task.projectId
                    )
                  );
                  const tasksProgress =
                    relatedProjects.length > 0
                      ? Math.round(
                          relatedProjects.reduce(
                            (sum, proj) => sum + (proj.progress || 0),
                            0
                          ) / relatedProjects.length
                        )
                      : 0;
                  const completedTasks = relatedTasks.filter(
                    (t) => t.status === 'Completed'
                  ).length;

                  return (
                    <Card
                      key={objective._id}
                      className='p-6 rounded-2xl shadow-lg bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 group'
                    >
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex items-center space-x-3'>
                          <div className='p-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                            <Eye className='w-5 h-5 text-white' />
                          </div>
                          <div>
                            <h3
                              className='text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:underline hover:text-purple-700 transition'
                              onClick={() =>
                                handleObjectiveClick(objective._id)
                              }
                            >
                              {objective.title}
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  ['Achieved'].includes(objective.status)
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : objective.status === 'Active'
                                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {objective.status}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  objective.priority === 'High'
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : objective.priority === 'Medium'
                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    : 'bg-green-100 text-green-700 border-green-200'
                                }`}
                              >
                                {objective.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Tracking */}
                      <div className='mb-4 space-y-2'>
                        {/* Goals Progress */}
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs text-gray-600'>
                              Related Goals
                            </span>
                            <span className='text-xs text-gray-600'>
                              {completedGoals}/{totalGoals} ({goalsProgress}%)
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                goalsProgress <= 25
                                  ? 'bg-red-500'
                                  : goalsProgress <= 89
                                  ? 'bg-orange-400'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${goalsProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Projects Progress */}
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs text-gray-600'>
                              Related Projects
                            </span>
                            <span className='text-xs text-gray-600'>
                              {completedProjects}/{relatedProjects.length} (
                              {projectsProgress}%)
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                projectsProgress <= 25
                                  ? 'bg-red-500'
                                  : projectsProgress <= 89
                                  ? 'bg-orange-400'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${projectsProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Tasks Progress */}
                        <div>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='text-xs text-gray-600'>
                              Project Tasks
                            </span>
                            <span className='text-xs text-gray-600'>
                              {completedTasks}/{relatedTasks.length} (
                              {tasksProgress}%)
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                tasksProgress <= 25
                                  ? 'bg-red-500'
                                  : tasksProgress <= 89
                                  ? 'bg-orange-400'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${tasksProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        {/* Quick Stats */}
                        <div className='flex flex-wrap gap-4 mt-2 text-xs text-gray-700'>
                          <span>Goals: {totalGoals}</span>
                          <span>Projects: {relatedProjects.length}</span>
                          <span>Tasks: {relatedTasks.length}</span>
                        </div>
                      </div>
                      {/* Related Goals Preview */}
                      {relatedGoals && relatedGoals.length > 0 && (
                        <div className='mb-4'>
                          <div className='text-xs text-gray-500 mb-1'>
                            Related Goals
                          </div>
                          <ul className='space-y-1'>
                            {relatedGoals.slice(0, 3).map((goal: any) => (
                              <li key={goal._id}>
                                <button
                                  className='flex items-center justify-between space-x-2 text-left w-full hover:bg-blue-100 rounded px-2 py-1 transition'
                                  onClick={() => handleGoalClick(goal._id)}
                                >
                                  <span className='font-medium text-sm text-blue-900 truncate'>
                                    {goal.name}
                                  </span>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      goal.status === 'Completed'
                                        ? 'bg-green-100 text-green-700'
                                        : goal.status === 'Active'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {goal.status}
                                  </span>
                                </button>
                              </li>
                            ))}
                            {relatedGoals.length > 3 && (
                              <li className='text-xs text-blue-600 mt-1 px-2'>
                                +{relatedGoals.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Related Projects Preview */}
                      {relatedProjects && relatedProjects.length > 0 && (
                        <div className='mb-4'>
                          <div className='text-xs text-gray-500 mb-1'>
                            Related Projects
                          </div>
                          <ul className='space-y-1'>
                            {relatedProjects.slice(0, 3).map((project: any) => (
                              <li key={project._id}>
                                <button
                                  className='flex items-center justify-between space-x-2 text-left w-full hover:bg-indigo-100 rounded px-2 py-1 transition'
                                  onClick={() =>
                                    handleProjectClick(project._id)
                                  }
                                >
                                  <span className='font-medium text-sm text-indigo-900 truncate'>
                                    {project.name}
                                  </span>
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      project.status === 'Completed'
                                        ? 'bg-green-100 text-green-700'
                                        : project.status === 'Active'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {project.status}
                                  </span>
                                </button>
                              </li>
                            ))}
                            {relatedProjects.length > 3 && (
                              <li className='text-xs text-indigo-600 mt-1 px-2'>
                                +{relatedProjects.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {relatedGoals.length === 0 &&
                        relatedProjects.length === 0 && (
                          <div className='mb-4 text-center py-4 text-gray-500'>
                            <Target className='w-8 h-8 mx-auto mb-2 text-gray-300' />
                            <span className='text-sm'>
                              No related goals or projects
                            </span>
                          </div>
                        )}
                      {/* Quick Actions */}
                      <div className='flex items-center justify-between pt-4 border-t border-purple-100 mt-4'>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            onClick={() => handleEdit(objective)}
                            className='border-gray-200 text-gray-600 hover:bg-gray-50'
                          >
                            Edit
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(objective)}
                            className='border-red-200 text-red-500 hover:bg-red-50'
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <ObjectiveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        objective={editingObjective}
      />
      <ObjectiveDetailsModal
        open={objectiveDetailsOpen}
        onClose={() => setObjectiveDetailsOpen(false)}
        onEdit={() => {
          setObjectiveDetailsOpen(false);
          setEditingObjective(detailsObjective);
          setModalOpen(true);
        }}
        objective={detailsObjective}
        relatedProjects={detailsRelatedProjects}
        relatedGoals={detailsRelatedGoals}
      />
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
                  {detailsProject?.name || 'Project Details'}
                </DialogTitle>
                <div className='flex items-center space-x-2 mt-2'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      detailsProject?.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : detailsProject?.status === 'Active'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {detailsProject?.status || 'Unknown'}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      detailsProject?.priority === 'High'
                        ? 'bg-red-100 text-red-700'
                        : detailsProject?.priority === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {detailsProject?.priority || 'Medium'} Priority
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Project Dates */}
            {(detailsProject?.startDate || detailsProject?.dueDate) && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Timeline
                </h3>
                <div className='flex items-center space-x-6 text-sm text-gray-600'>
                  {detailsProject?.startDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        Start:{' '}
                        {new Date(
                          detailsProject.startDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {detailsProject?.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4' />
                      <span>
                        Due:{' '}
                        {new Date(detailsProject.dueDate).toLocaleDateString()}
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
                  <div className='text-sm text-gray-600'>Completed Tasks</div>
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
                                {new Date(task.dueDate).toLocaleDateString()}
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
                setEditingProject(detailsProject);
                setProjectModalOpen(true);
              }}
            >
              Edit Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={() => {
          setGoalModalOpen(false);
          loadData();
        }}
        goal={detailsGoal}
      />
      <ProjectModal
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
          loadData();
        }}
        project={editingProject}
      />

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

            {/* Progress Overview */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card className='p-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {detailsGoalRelatedObjectives.length}
                  </div>
                  <div className='text-sm text-gray-600'>
                    Related Objectives
                  </div>
                </div>
              </Card>
              <Card className='p-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-indigo-600'>
                    {detailsGoalRelatedProjects.length}
                  </div>
                  <div className='text-sm text-gray-600'>Related Projects</div>
                </div>
              </Card>
              <Card className='p-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      detailsGoalRelatedObjectives.filter(
                        (obj) => obj.status === 'Achieved'
                      ).length
                    }
                  </div>
                  <div className='text-sm text-gray-600'>
                    Completed Objectives
                  </div>
                </div>
              </Card>
            </div>

            {/* Related Objectives */}
            {detailsGoalRelatedObjectives.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Related Objectives
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {detailsGoalRelatedObjectives.map((objective) => (
                    <Card
                      key={objective._id}
                      className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                      onClick={() => {
                        setGoalDetailsOpen(false);
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

            {/* Related Projects */}
            {detailsGoalRelatedProjects.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Related Projects
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {detailsGoalRelatedProjects.map((project) => (
                    <Card
                      key={project._id}
                      className='p-4 hover:shadow-md transition-shadow cursor-pointer'
                      onClick={() => {
                        setGoalDetailsOpen(false);
                        handleProjectClick(project._id);
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
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setGoalDetailsOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setGoalDetailsOpen(false);
                setGoalModalOpen(true);
              }}
            >
              Edit Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ObjectivesPage;
