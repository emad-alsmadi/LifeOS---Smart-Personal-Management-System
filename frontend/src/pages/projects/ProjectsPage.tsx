import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderOpen,
  Calendar,
  AlertTriangle,
  Eye,
  CheckSquare,
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import ProjectModal from './ProjectModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import ObjectiveDetailsModal from '../objectives/ObjectiveDetailsModal';
import {
  ProjectCreate,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
  getObjectives,
  getGoals,
  getTasks,
  Objective,
  Goal,
  Task,
  ProjectWithProgress,
  getProjectsWithTaskProgress,
} from '../../lib/api/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

const statusColors: Record<string, string> = {
  Active: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Next: 'bg-yellow-100 text-yellow-700',
  Paused: 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<
    ProjectWithProgress[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // new view and details state
  const [view, setView] = useState<'table' | 'grid'>('table');
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

  // Explicitly type state arrays
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  // detailed objective modal state
  const [objectiveDetailsOpen, setObjectiveDetailsOpen] = useState(false);
  const [detailsObjective, setDetailsObjective] = useState<Objective | null>(
    null
  );
  const [detailsObjectiveRelatedProjects, setDetailsObjectiveRelatedProjects] =
    useState<Project[]>([]);
  const [detailsObjectiveRelatedGoals, setDetailsObjectiveRelatedGoals] =
    useState<Goal[]>([]);

  // task details modal state
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);
  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, priorityFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, objectivesData, goalsData, tasksData] =
        await Promise.all([
          getProjectsWithTaskProgress(),
          getObjectives(),
          getGoals(),
          getTasks(),
        ]);

      setProjects(projectsData);
      setAllObjectives(objectivesData);
      setAllGoals(goalsData);
      setAllTasks(tasksData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered: ProjectWithProgress[] = [...projects];
    if (statusFilter !== 'all')
      filtered = filtered.filter((p) => p.status === statusFilter);
    if (priorityFilter !== 'all')
      filtered = filtered.filter((p) => p.priority === priorityFilter);
    setFilteredProjects(filtered);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setModalOpen(true);
  };
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true); // Open create/edit modal
  };
  const handleDelete = (project: Project) => {
    setEditingProject(project);
    setModalOpen(false);
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (
    projectData: Partial<Project> & { selectedTaskIds?: string[] }
  ) => {
    try {
      const {
        name,
        status,
        priority,
        objectives,
        startDate,
        dueDate,
        selectedTaskIds,
      } = projectData;
      const objectivesIds: string[] = Array.isArray(objectives)
        ? objectives.map((o) => (typeof o === 'string' ? o : o._id))
        : [];
      const payload: ProjectCreate = {
        name: name || '',
        status: status || 'Active',
        priority: priority || 'Medium',
        objectives: objectivesIds,
        startDate,
        dueDate,
      };

      let createdProject;
      if (editingProject) {
        await updateProject(editingProject._id, payload);
      } else {
        createdProject = await createProject(payload);
      }

      // Handle task associations for both new and existing projects
      if (selectedTaskIds) {
        const { updateTask } = await import('../../lib/api/api');
        const projectId = createdProject?._id || editingProject?._id;

        if (projectId) {
          if (editingProject) {
            // For editing: only update tasks that have changed
            const existingTaskIds = allTasks
              .filter((t) => t.projectId === projectId)
              .map((t) => t._id);

            // Remove tasks that are no longer selected
            const tasksToRemove = existingTaskIds.filter(
              (id) => !selectedTaskIds.includes(id)
            );
            await Promise.all(
              tasksToRemove.map((taskId) =>
                updateTask(taskId, {
                  projectId: undefined,
                  type: 'Project Task',
                })
              )
            );

            // Add tasks that are newly selected
            const tasksToAdd = selectedTaskIds.filter(
              (id) => !existingTaskIds.includes(id)
            );
            await Promise.all(
              tasksToAdd.map((taskId) =>
                updateTask(taskId, {
                  projectId: projectId,
                  type: 'Project Task',
                })
              )
            );
          } else {
            // For new projects: associate all selected tasks
            await Promise.all(
              selectedTaskIds.map((taskId) =>
                updateTask(taskId, {
                  projectId: projectId,
                  type: 'Project Task',
                })
              )
            );
          }
        }
      }

      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete._id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getStatusStats = () => {
    const stats = { Active: 0, Completed: 0, Next: 0, Paused: 0 };
    projects.forEach((p) => {
      stats[p.status]++;
    });
    return stats;
  };
  const statusStats = getStatusStats();

  // click to show detailed objective modal
  const handleObjectiveClick = async (objectiveId: string) => {
    setObjectiveDetailsOpen(false);
    setDetailsObjective(null);
    setDetailsObjectiveRelatedProjects([]);
    setDetailsObjectiveRelatedGoals([]);
    try {
      const [objectives, projects, goals] = await Promise.all([
        getObjectives(),
        getProjects(),
        getGoals(),
      ]);
      const obj = objectives.find((o) => o._id === objectiveId) || null;
      setDetailsObjective(obj);
      if (obj) {
        const projIds = (obj.relatedProjects || [])
          .map((p) => (typeof p === 'string' ? p : p._id))
          .filter(Boolean);
        setDetailsObjectiveRelatedProjects(
          projects.filter((p) => projIds.includes(p._id))
        );
        const goalIds = (obj.relatedGoals || [])
          .map((g) => (typeof g === 'string' ? g : g._id))
          .filter(Boolean);
        setDetailsObjectiveRelatedGoals(
          goals.filter((g) => goalIds.includes(g._id))
        );
      }
    } catch {}
    setObjectiveDetailsOpen(true);
  };

  const handleProjectClick = (projectId: string) => {
    const proj = projects.find((p) => p._id === projectId) || null;
    setDetailsProject(proj);
    if (proj) {
      const relatedObjectives = allObjectives.filter((o) =>
        (o.relatedProjects || []).some(
          (r) => (typeof r === 'string' ? r : r._id) === projectId
        )
      );
      setDetailsProjectRelatedObjectives(relatedObjectives);
      const goalIds = relatedObjectives.flatMap((o) =>
        (o.relatedGoals || []).map((g) => (typeof g === 'string' ? g : g._id))
      );
      setDetailsProjectRelatedGoals(
        allGoals.filter((g) => goalIds.includes(g._id))
      );
      const projectTasks = allTasks.filter((t) => t.projectId === projectId);

      setDetailsProjectRelatedTasks(projectTasks);
    }
    setProjectDetailsOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setDetailsTask(task);
    setTaskDetailsOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v: string) => (
        <div
          onClick={() => handleProjectClick(v as any)}
          className='flex items-center space-x-3 cursor-pointer'
        >
          <div className='p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg'>
            <FolderOpen className='w-4 h-4 text-indigo-600' />
          </div>
          <span className='font-semibold text-gray-900'>{v}</span>
        </div>
      ),
    },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    {
      key: 'objectives',
      label: 'Objectives',
      render: (objs: any[]) => (
        <div className='flex items-center space-x-2'>
          <Eye className='w-4 h-4 text-blue-600' />
          <div className='flex flex-wrap gap-1'>
            {objs && objs.length > 0 ? (
              <>
                {objs.slice(0, 2).map((o) => {
                  const objId = typeof o === 'string' ? o : o._id;
                  const objective = allObjectives.find(
                    (obj) => obj._id === objId
                  );
                  return (
                    <button
                      key={objId}
                      onClick={() => handleObjectiveClick(objId)}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 hover:border-blue-300 cursor-pointer'
                    >
                      {objective ? objective.title : objId}
                    </button>
                  );
                })}
                {objs.length > 2 && (
                  <span className='text-xs text-gray-500'>
                    +{objs.length - 2} more
                  </span>
                )}
              </>
            ) : (
              <span className='text-sm text-gray-500'>No objectives</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'tasks',
      label: 'Tasks',
      render: (value: any, project: any) => {
        // Try to use tasks directly from the project object first
        let projectTasks = project.tasks || [];

        // Fallback: if no tasks in project object, filter from allTasks
        if (!projectTasks || projectTasks.length === 0) {
          projectTasks = allTasks.filter((t) => t.projectId === project._id);
        }

        console.log(`Table view - Project ${project.name}:`, {
          projectTasks: projectTasks,
          projectTasksLength: projectTasks.length,
          projectId: project._id,
          allTasksLength: allTasks.length,
        });

        return (
          <div className='flex items-center space-x-2'>
            <CheckSquare className='w-4 h-4 text-green-500' />
            <div className='flex flex-col'>
              {projectTasks && projectTasks.length > 0 ? (
                <div className='flex flex-wrap gap-1'>
                  {projectTasks.slice(0, 2).map((task) => (
                    <button
                      key={task._id}
                      onClick={() => handleTaskClick(task)}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 hover:border-green-300 transition-colors cursor-pointer'
                      title={task.name}
                    >
                      {task.name}
                    </button>
                  ))}
                  {projectTasks.length > 2 && (
                    <span className='text-xs text-gray-500'>
                      +{projectTasks.length - 2} more
                    </span>
                  )}
                </div>
              ) : (
                <span className='text-sm text-gray-500'>No tasks</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (v: string) => (
        <div className='flex items-center space-x-2'>
          <Calendar className='w-4 h-4 text-blue-500' />
          <span className='text-sm text-gray-600'>
            {v ? new Date(v).toLocaleDateString() : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (v: string) => (
        <div className='flex items-center space-x-2'>
          <Calendar className='w-4 h-4 text-orange-500' />
          <span className='text-sm text-gray-600'>
            {v ? new Date(v).toLocaleDateString() : '-'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='container-corporate'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          {/* Header */}
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-3 bg-primary-500 rounded-lg shadow-corporate'>
                  <FolderOpen className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold text-text-primary'>
                  Projects
                </h1>
              </div>
              <p className='text-lg text-text-muted'>
                Organize and track your projects with objectives, deadlines, and
                team collaboration.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              variant='primary'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              New Project
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            {/* same as before */}
            {/* ... existing stats cards ... */}
          </div>

          {/* View Toggle Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='flex items-center justify-between'
          >
            <div className='flex items-center space-x-2'>
              <h2 className='text-xl font-semibold text-text-primary'>
                All Projects
              </h2>
              <span className='text-sm text-text-muted'>
                ({projects.length} total)
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                onClick={() => setView('table')}
                variant={view === 'table' ? 'primary' : 'outline'}
                size='sm'
              >
                Table View
              </Button>
              <Button
                onClick={() => setView('grid')}
                variant={view === 'grid' ? 'primary' : 'outline'}
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
            className='flex flex-wrap gap-4 items-center bg-gradient-to-r from-white to-indigo-50 p-6 rounded-xl shadow-lg border-2 border-indigo-200 mb-0'
          >
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-3'>
                <label className='text-sm font-semibold text-gray-700 flex items-center'>
                  <svg
                    className='w-4 h-4 mr-2 text-indigo-500'
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
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer min-w-[140px]'
                  >
                    <option
                      value='all'
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
                      value='Next'
                      className='font-medium py-2'
                    >
                      ⏭️ Next
                    </option>
                    <option
                      value='Paused'
                      className='font-medium py-2'
                    >
                      ⏸️ Paused
                    </option>
                  </select>
                  <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-indigo-500'
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
                    className='w-4 h-4 mr-2 text-indigo-500'
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
                    className='appearance-none pl-4 pr-10 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-md text-gray-700 font-medium transition-all duration-200 hover:border-indigo-300 hover:shadow-lg cursor-pointer min-w-[140px]'
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
                      className='w-5 h-5 text-indigo-500'
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
              transition={{ delay: 0.6 }}
              className='mt-0'
            >
              <Card
                className='overflow-hidden'
                elevated
              >
                <div className='bg-gray-50 px-6 py-4 border-b border-border'>
                  <h2 className='text-xl font-bold text-text-primary'>
                    All Projects
                  </h2>
                  <p className='text-sm text-text-muted mt-1'>
                    Manage and track your project portfolio
                  </p>
                </div>
                <DataTable
                  data={filteredProjects}
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
              transition={{ delay: 0.6 }}
            >
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
                {filteredProjects.map((project: ProjectWithProgress) => {
                  // calculate progress based on objectives
                  const relObjs = allObjectives.filter((o: Objective) =>
                    (o.relatedProjects || []).some(
                      (r: any) =>
                        (typeof r === 'string' ? r : r._id) === project._id
                    )
                  );
                  const total = relObjs.length;
                  const completed = relObjs.filter(
                    (o) => o.status === 'Completed'
                  ).length;
                  const percent = total
                    ? Math.round((completed / total) * 100)
                    : 0;
                  return (
                    <Card
                      key={project._id}
                      className='p-6 group cursor-pointer'
                      elevated
                    >
                      <div onClick={() => handleProjectClick(project._id)}>
                        <div className='flex items-start justify-between mb-4'>
                          <div className='flex items-center space-x-3'>
                            <div className='p-2 bg-primary-500 rounded-lg group-hover:scale-110 transition-transform duration-200'>
                              <FolderOpen className='w-5 h-5 text-white' />
                            </div>
                            <div>
                              <h3
                                className='text-lg font-bold text-text-primary mb-1 cursor-pointer hover:underline hover:text-primary-600 transition'
                                onClick={() => handleProjectClick(project._id)}
                              >
                                {project.name}
                              </h3>
                              <div className='flex flex-wrap gap-2'>
                                <span
                                  className={`status-corporate ${
                                    project.status === 'Completed'
                                      ? 'status-corporate-completed'
                                      : project.status === 'Active'
                                      ? 'status-corporate-active'
                                      : 'status-corporate-paused'
                                  }`}
                                >
                                  {project.status}
                                </span>
                                <span
                                  className={`priority-corporate ${
                                    project.priority === 'High'
                                      ? 'priority-corporate-high'
                                      : project.priority === 'Medium'
                                      ? 'priority-corporate-medium'
                                      : 'priority-corporate-low'
                                  }`}
                                >
                                  {project.priority} Priority
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Progress Tracking */}
                        <div className='mb-4 space-y-2'>
                          {/* Objectives Progress */}
                          <div>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-xs text-text-muted'>
                                Objectives Completed
                              </span>
                              <span className='text-xs text-text-muted'>
                                {completed}/{total} ({percent}%)
                              </span>
                            </div>
                            <div className='progress-corporate'>
                              <div
                                className={`progress-corporate-bar ${
                                  percent <= 25
                                    ? 'progress-corporate-error'
                                    : percent <= 89
                                    ? 'progress-corporate-warning'
                                    : 'progress-corporate-success'
                                }`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                          {/* Tasks Progress */}
                          <div>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='text-xs text-text-muted'>
                                Tasks Completed
                              </span>
                              <span className='text-xs text-text-muted'>
                                {project.completedTasks}/{project.totalTasks} (
                                {project.progressPercent}%)
                              </span>
                            </div>
                            <div className='progress-corporate'>
                              <div
                                className={`progress-corporate-bar ${
                                  project.progressPercent <= 25
                                    ? 'progress-corporate-error'
                                    : project.progressPercent <= 89
                                    ? 'progress-corporate-warning'
                                    : 'progress-corporate-success'
                                }`}
                                style={{ width: `${project.progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                          {/* Quick Stats */}
                          <div className='flex flex-wrap gap-4 mt-2 text-xs text-text-muted'>
                            <span>Objectives: {total}</span>
                            <span>Tasks: {project.totalTasks}</span>
                          </div>
                        </div>
                        {/* Related Objectives Preview */}
                        {relObjs && relObjs.length > 0 && (
                          <div className='mb-4'>
                            <div className='text-xs text-gray-500 mb-1'>
                              Related Objectives
                            </div>
                            <ul className='space-y-1'>
                              {relObjs.slice(0, 3).map((obj) => (
                                <li key={obj._id}>
                                  <button
                                    className='flex items-center justify-between space-x-2 text-left w-full hover:bg-purple-100 rounded px-2 py-1 transition'
                                    onClick={async () => {
                                      setObjectiveDetailsOpen(false);
                                      setDetailsObjective(obj);
                                      setObjectiveDetailsOpen(true);
                                    }}
                                  >
                                    <span className='font-medium text-sm text-purple-900 truncate'>
                                      {obj.title}
                                    </span>
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ml-2 ${
                                        obj.status === 'Completed'
                                          ? 'bg-green-100 text-green-700'
                                          : obj.status === 'Active'
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {obj.status}
                                    </span>
                                  </button>
                                </li>
                              ))}
                              {relObjs.length > 3 && (
                                <li className='text-xs text-purple-600 mt-1'>
                                  +{relObjs.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Related Tasks Preview */}
                        {(() => {
                          // Try to use tasks directly from the project object first
                          let projectTasks = project.tasks || [];

                          // Fallback: if no tasks in project object, filter from allTasks
                          if (!projectTasks || projectTasks.length === 0) {
                            projectTasks = allTasks.filter(
                              (t) => t.projectId === project._id
                            );
                          }

                          console.log(`Card view - Project ${project.name}:`, {
                            projectTasks: projectTasks,
                            projectTasksLength: projectTasks.length,
                            projectId: project._id,
                            allTasksLength: allTasks.length,
                          });

                          if (projectTasks.length > 0) {
                            return (
                              <div className='mb-4'>
                                <div className='text-xs text-gray-500 mb-1'>
                                  Related Tasks
                                </div>
                                <ul className='space-y-1'>
                                  {projectTasks.slice(0, 5).map((task) => (
                                    <li key={task._id}>
                                      <button
                                        className='flex items-center justify-between space-x-2 text-left w-full hover:bg-indigo-100 rounded px-2 py-1 transition'
                                        onClick={() => handleTaskClick(task)}
                                      >
                                        <span className='font-medium text-sm text-indigo-900'>
                                          {task.name}
                                        </span>
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            task.status === 'Completed'
                                              ? 'bg-green-100 text-green-700'
                                              : task.status === 'Active'
                                              ? 'bg-blue-100 text-blue-700'
                                              : 'bg-gray-100 text-gray-700'
                                          }`}
                                        >
                                          {task.status}
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                  {projectTasks.length > 5 && (
                                    <li className='text-xs text-indigo-600 mt-1 px-2'>
                                      +{projectTasks.length - 5} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Quick Actions */}
                        <div className='flex items-center justify-between pt-4 border-t border-purple-100 mt-4'>
                          <div className='flex space-x-2'>
                            <Button
                              variant='outline'
                              onClick={() => handleEdit(project)}
                              className='border-gray-200 text-gray-600 hover:bg-gray-50'
                            >
                              Edit
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleDelete(project)}
                              className='border-red-200 text-red-500 hover:bg-red-50'
                            >
                              Delete
                            </Button>
                          </div>
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

      {/* Remove GoalModal to show ObjectiveDetailsModal instead */}

      {/* Project Details Modal */}
      <ProjectDetailsModal
        open={projectDetailsOpen}
        onClose={() => setProjectDetailsOpen(false)}
        onEdit={() => {
          setProjectDetailsOpen(false);
          setEditingProject(detailsProject);
          setModalOpen(true);
        }}
        project={detailsProject}
        relatedObjectives={detailsProjectRelatedObjectives}
        relatedGoals={detailsProjectRelatedGoals}
        relatedTasks={detailsProjectRelatedTasks}
      />

      {/* Objective Details Modal (shared with goals page) */}
      <ObjectiveDetailsModal
        open={objectiveDetailsOpen}
        onClose={() => setObjectiveDetailsOpen(false)}
        onEdit={() => {}}
        objective={detailsObjective}
        relatedProjects={detailsObjectiveRelatedProjects}
        relatedGoals={detailsObjectiveRelatedGoals}
      />

      {/* Task Details Modal */}
      <Dialog
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 shadow-xl'>
          <DialogHeader>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='p-3 bg-indigo-500 rounded-xl'>
                <CheckSquare className='w-6 h-6 text-white' />
              </div>
              <div>
                <DialogTitle
                  className='text-2xl font-bold text-gray-900 !no-underline focus:!no-underline'
                  style={{ textDecoration: 'none' }}
                >
                  {detailsTask?.name}
                </DialogTitle>
                <div className='flex items-center space-x-2 mt-2'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[detailsTask?.status || '']
                    }`}
                  >
                    {detailsTask?.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      priorityColors[detailsTask?.priority || '']
                    }`}
                  >
                    {detailsTask?.priority} Priority
                  </span>
                  <span className='text-xs text-gray-500 ml-2'>
                    Created:{' '}
                    {detailsTask?.createdAt
                      ? new Date(detailsTask.createdAt).toLocaleDateString()
                      : '-'}
                  </span>
                  <span className='text-xs text-gray-500'>
                    Updated:{' '}
                    {detailsTask?.updatedAt
                      ? new Date(detailsTask.updatedAt).toLocaleDateString()
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className='space-y-6'>
            {/* Timeline */}
            {detailsTask?.dueDate && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Timeline
                </h3>
                <div className='grid grid-cols-1 gap-4'>
                  {detailsTask.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Due:{' '}
                        {new Date(detailsTask.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Related Project */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Related Project
              </h3>
              <div className='flex flex-wrap gap-2'>
                {detailsTask?.projectId ? (
                  (() => {
                    const project = projects.find(
                      (p) => p._id === detailsTask.projectId
                    );
                    return project ? (
                      <Badge
                        key={project._id}
                        className='cursor-pointer bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        onClick={() => {
                          setTaskDetailsOpen(false);
                          handleProjectClick(project._id);
                        }}
                      >
                        {project.name}
                      </Badge>
                    ) : (
                      <span className='text-xs text-gray-400'>
                        Project not found
                      </span>
                    );
                  })()
                ) : (
                  <span className='text-xs text-gray-400'>
                    No related project
                  </span>
                )}
              </div>
            </div>

            {/* Related Objective */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Related Objective
              </h3>
              <div className='flex flex-wrap gap-2'>
                {detailsTask?.objectiveId ? (
                  (() => {
                    const objective = allObjectives.find(
                      (o) => o._id === detailsTask.objectiveId
                    );
                    return objective ? (
                      <Badge
                        key={objective._id}
                        className='bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200'
                        onClick={() => {
                          setTaskDetailsOpen(false);
                          handleObjectiveClick(objective._id);
                        }}
                      >
                        {objective.title}
                      </Badge>
                    ) : (
                      <span className='text-xs text-gray-400'>
                        Objective not found
                      </span>
                    );
                  })()
                ) : (
                  <span className='text-xs text-gray-400'>
                    No related objective
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className='flex justify-end space-x-2 mt-6'>
            <Button
              variant='outline'
              onClick={() => setTaskDetailsOpen(false)}
              className='border-indigo-200 text-indigo-600 hover:bg-indigo-50'
            >
              Close
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                setTaskDetailsOpen(false);
                // You can implement task editing here if needed
                console.log('Edit task:', detailsTask);
              }}
              className='bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        project={editingProject}
      />

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <div className='flex flex-col items-center justify-center text-center'>
              <AlertTriangle className='w-12 h-12 text-red-500 mb-2' />
              <DialogTitle className='text-xl font-bold text-gray-900 mb-1'>
                Delete Project?
              </DialogTitle>
              <p className='text-gray-600 mb-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold text-red-600'>
                  {projectToDelete?.name}
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

export default ProjectsPage;
