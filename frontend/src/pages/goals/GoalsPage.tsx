import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Goal as GoalIcon,
  Target,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Eye,
  FolderOpen,
} from 'lucide-react';
import GoalModal from './GoalModal';
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
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  Goal,
  GoalCreate,
  getObjectives,
  getProjects,
  getTasks,
  Task,
  GoalWithProgress,
  getGoalsWithObjectiveProgress,
} from '../../lib/api/api';
import type { Objective } from '../../lib/api/api';
import ObjectiveModal from '../objectives/ObjectiveModal';
import ProjectModal from '../projects/ProjectModal';
import type { Project } from '../../lib/api/api';

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [objectiveModalOpen, setObjectiveModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(
    null
  );
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
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null);
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  const loadData = async () => {
    try {
      const [goalsData, objectivesData, projectsData, tasksData] =
        await Promise.all([
          getGoalsWithObjectiveProgress(),
          getObjectives(),
          getProjects(),
          getTasks(),
        ]);
      setGoals(goalsData);
      setAllObjectives(objectivesData);
      setAllProjects(projectsData);
      setAllTasks(tasksData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const handleDelete = (goal: Goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      await deleteGoal(goalToDelete._id);
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const handleSave = async (
    goalData: GoalCreate & { selectedObjectiveIds?: string[] }
  ) => {
    try {
      const { selectedObjectiveIds, ...goalDataWithoutSelected } = goalData;

      // Ensure objectives is always an array of IDs
      const objectives = Array.isArray(goalDataWithoutSelected.objectives)
        ? goalDataWithoutSelected.objectives.map(
            (obj: { _id: string } | string) =>
              typeof obj === 'string' ? obj : obj._id
          )
        : [];

      // Combine existing objectives with newly selected ones
      const allObjectiveIds = [
        ...new Set([...objectives, ...(selectedObjectiveIds || [])]),
      ];

      const payload = {
        ...goalDataWithoutSelected,
        objectives: allObjectiveIds,
      };

      if (editingGoal) {
        await updateGoal(editingGoal._id, payload);
      } else {
        await createGoal(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
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

  const handleProjectClick = async (projectId: string) => {
    setProjectDetailsOpen(false);
    setDetailsProject(null);
    setDetailsProjectRelatedObjectives([]);
    setDetailsProjectRelatedGoals([]);
    setDetailsProjectRelatedTasks([]);
    try {
      const project =
        allProjects.find((p: Project) => p._id === projectId) || null;
      setDetailsProject(project);
      if (project) {
        // Find objectives related to this project
        const relatedObjectives = allObjectives.filter((obj) =>
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
        const relatedGoals = goals.filter((goal: Goal) =>
          relatedGoalIds.includes(goal._id)
        );
        setDetailsProjectRelatedGoals(relatedGoals);

        // Find tasks related to this project
        const relatedTasks = allTasks.filter(
          (task: Task) => task.projectId === projectId
        );
        setDetailsProjectRelatedTasks(relatedTasks);
      }
      setProjectDetailsOpen(true);
    } catch (error) {
      console.error('Failed to load project details:', error);
      setDetailsProject(null);
      setDetailsProjectRelatedObjectives([]);
      setDetailsProjectRelatedGoals([]);
      setDetailsProjectRelatedTasks([]);
      setProjectDetailsOpen(true);
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

  const getStatusStats = () => {
    const stats = {
      Active: 0,
      Completed: 0,
      Next: 0,
      Paused: 0,
    };

    goals.forEach((goal) => {
      stats[goal.status]++;
    });

    return stats;
  };

  const statusStats = getStatusStats();

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
                Delete Goal?
              </DialogTitle>
              <p className='text-gray-600 mb-2'>
                Are you sure you want to delete{' '}
                <span className='font-semibold text-red-600'>
                  {goalToDelete?.name}
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
                <div className='p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg'>
                  <GoalIcon className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  Goals
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Set and track meaningful goals that align with your life pillars
                and objectives.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              Create Goal
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
                  <div className='p-3 bg-blue-100 rounded-lg'>
                    <GoalIcon className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {goals.length}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Goals
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
                  <div className='p-3 bg-green-100 rounded-lg'>
                    <TrendingUp className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats.Active}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>
                      Active Goals
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
              <Card className='p-6 bg-white border border-gray-100 hover:shadow-md transition-all duration-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-blue-100 rounded-lg'>
                    <Calendar className='w-6 h-6 text-blue-600' />
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
                  <div className='p-3 bg-yellow-100 rounded-lg'>
                    <Target className='w-6 h-6 text-yellow-600' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-gray-800'>
                      {statusStats.Next}
                    </p>
                    <p className='text-sm font-medium text-gray-600'>Next Up</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Goals Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
            {goals.map((goal) => {
              // Objectives for this goal (use goal.objectives references)
              const objectives = (goal.objectives || [])
                .map((objRef) =>
                  typeof objRef === 'string'
                    ? allObjectives.find((o) => o._id === objRef)
                    : objRef && objRef._id
                    ? allObjectives.find((o) => o._id === objRef._id)
                    : null
                )
                .filter(Boolean);
              // Get all related projects for this goal (across all objectives)
              const allRelatedProjects = objectives.flatMap((obj) =>
                allProjects.filter((proj) =>
                  (obj?.relatedProjects || []).some(
                    (p) => (typeof p === 'string' ? p : p._id) === proj._id
                  )
                )
              );
              const projectsProgress =
                allRelatedProjects.length > 0
                  ? Math.round(
                      allRelatedProjects.reduce(
                        (sum, proj) => sum + (proj?.progress || 0),
                        0
                      ) / allRelatedProjects.length
                    )
                  : 0;
              const completedProjects = allRelatedProjects.filter(
                (proj) => (proj?.progress || 0) >= 100
              ).length;

              // Tasks for this goal (via projects)
              const allRelatedTasks = allRelatedProjects.flatMap((proj) =>
                allTasks.filter((task) => task.projectId === proj._id)
              );
              const tasksProgress =
                allRelatedProjects.length > 0
                  ? Math.round(
                      allRelatedProjects.reduce(
                        (sum, proj) => sum + (proj.progress || 0),
                        0
                      ) / allRelatedProjects.length
                    )
                  : 0;
              const completedTasks = allRelatedTasks.filter(
                (task) => task.status === 'Completed'
              ).length;

              // Next due task
              const nextDueTask = allRelatedProjects
                .flatMap((proj) => proj._id)
                .map((projectId) =>
                  allTasks.filter((task) => task.projectId === projectId)
                )
                .flat()
                .filter((task) => task.status !== 'Completed' && task.dueDate)
                .sort(
                  (a, b) =>
                    new Date(a.dueDate!).getTime() -
                    new Date(b.dueDate!).getTime()
                )[0];

              return (
                <Card
                  key={goal._id}
                  className='p-6 rounded-xl shadow-md bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300'
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-lg'>
                        <GoalIcon className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='text-lg font-bold text-gray-900 mb-1'>
                          {goal.name}
                        </h3>
                        <div className='flex flex-wrap gap-2'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200'>
                            {goal.category}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              goal.status === 'Completed'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : goal.status === 'Active'
                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            {goal.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Hierarchy & Progress */}
                  <div className='mb-4 space-y-2'>
                    {/* Objectives Progress */}
                    <div>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs text-gray-600'>
                          Objectives Progress
                        </span>
                        <span className='text-xs text-gray-600'>
                          {goal.objectiveCount > 0
                            ? `${goal.progressPercent}%`
                            : 'No objectives'}
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            goal.progressPercent <= 25
                              ? 'bg-red-500'
                              : goal.progressPercent <= 89
                              ? 'bg-orange-400'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${goal.progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Projects Progress */}
                    <div>
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs text-gray-600'>Projects</span>
                        <span className='text-xs text-gray-600'>
                          {completedProjects}/{allRelatedProjects.length} (
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
                        <span className='text-xs text-gray-600'>Tasks</span>
                        <span className='text-xs text-gray-600'>
                          {completedTasks}/{allRelatedProjects.length} (
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
                      <span>Objectives: {objectives.length}</span>
                      <span>Projects: {allRelatedProjects.length}</span>
                      <span>Tasks: {allRelatedProjects.length}</span>
                      {nextDueTask && (
                        <span>
                          Next Due: {nextDueTask.name} (
                          {new Date(nextDueTask.dueDate!).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Objectives Preview */}
                  {goal.objectives && goal.objectives.length > 0 && (
                    <div className='mb-4'>
                      {(() => {
                        console.log(
                          'goal.objectives:',
                          goal.objectives,
                          'allObjectives:',
                          allObjectives
                        );
                      })()}
                      <div className='text-xs text-gray-500 mb-1'>
                        Objectives
                      </div>
                      <ul className='space-y-1'>
                        {goal.objectives.slice(0, 3).map((objRef) => {
                          // objRef may be an ID or an object; find the full object
                          const obj =
                            typeof objRef === 'string'
                              ? allObjectives.find((o) => o._id === objRef)
                              : objRef && objRef._id
                              ? allObjectives.find((o) => o._id === objRef._id)
                              : null;
                          if (!obj) return null;
                          return (
                            <li key={obj._id}>
                              <button
                                className='flex items-center space-x-2 text-left w-full hover:bg-blue-100 rounded px-2 py-1 transition'
                                onClick={() => handleObjectiveClick(obj._id)}
                              >
                                <span className='font-medium text-sm text-blue-900 truncate'>
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
                          );
                        })}
                        {goal.objectives.length > 3 && (
                          <li className='text-xs text-blue-600 mt-1'>
                            +{goal.objectives.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  {/* Projects Preview (move here, after objectives, with border) */}
                  {allRelatedProjects.length > 0 && (
                    <>
                      <div className='border-t border-indigo-200 my-2'></div>
                      <div className='mb-4'>
                        <div className='text-xs text-gray-500 mb-1'>
                          Projects
                        </div>
                        <ul className='space-y-1'>
                          {allRelatedProjects.slice(0, 3).map((proj) => (
                            <li key={proj._id}>
                              <button
                                className='flex items-center space-x-2 text-left w-full hover:bg-indigo-100 rounded px-2 py-1 transition'
                                onClick={() => handleProjectClick(proj._id)}
                              >
                                <span className='font-medium text-sm text-indigo-900 truncate'>
                                  {proj.name}
                                </span>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ml-2 ${
                                    proj.status === 'Completed'
                                      ? 'bg-green-100 text-green-700'
                                      : proj.status === 'Active'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {proj.status}
                                </span>
                              </button>
                            </li>
                          ))}
                          {allRelatedProjects.length > 3 && (
                            <li className='text-xs text-indigo-600 mt-1 px-2'>
                              +{allRelatedProjects.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </>
                  )}
                  {/* Related Projects */}
                  {/* Quick Actions */}
                  <div className='flex items-center justify-between pt-4 border-t border-blue-100 mt-4'>
                    <div className='flex space-x-2'>
                      <Button
                        variant='outline'
                        onClick={() => handleEdit(goal)}
                        className='border-gray-200 text-gray-600 hover:bg-gray-50'
                      >
                        Edit
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(goal)}
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
      </div>

      {/* Modal */}
      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        goal={editingGoal}
      />
      <ObjectiveModal
        open={objectiveModalOpen}
        onClose={() => {
          setObjectiveModalOpen(false);
          setSelectedObjective(null);
        }}
        onSave={() => {
          setObjectiveModalOpen(false);
          setSelectedObjective(null);
          loadData();
        }}
        objective={selectedObjective}
      />
      {/* Detailed Objective Modal */}
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
                      detailsObjective?.status === 'Active'
                        ? 'bg-blue-100 text-blue-700'
                        : detailsObjective?.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : detailsObjective?.status === 'Paused'
                        ? 'bg-yellow-100 text-yellow-700'
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
            {detailsObjective?.description && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Description
                </h3>
                <p className='text-gray-700'>{detailsObjective.description}</p>
              </div>
            )}

            {/* Timeline */}
            {(detailsObjective?.startDate || detailsObjective?.dueDate) && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Timeline
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {detailsObjective?.startDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Start:{' '}
                        {new Date(
                          detailsObjective.startDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {detailsObjective?.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Due:{' '}
                        {new Date(
                          detailsObjective.dueDate
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
                  <div className='text-2xl font-bold text-blue-600'>
                    {detailsRelatedGoals.length}
                  </div>
                  <div className='text-sm text-gray-600'>Related Goals</div>
                </div>
              </Card>
              <Card className='p-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-indigo-600'>
                    {detailsRelatedProjects.length}
                  </div>
                  <div className='text-sm text-gray-600'>Related Projects</div>
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

            {/* Related Tasks */}
            {detailsObjectiveRelatedTasks.length > 0 && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Related Tasks
                </h3>
                <div className='space-y-2'>
                  {detailsObjectiveRelatedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task._id}
                      className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-green-500'
                            : task.status === 'In Progress'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className='text-sm text-gray-600'>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                  {detailsObjectiveRelatedTasks.length > 5 && (
                    <p className='text-sm text-gray-500 text-center py-2'>
                      +{detailsObjectiveRelatedTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='ghost'
              onClick={() => setObjectiveDetailsOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setObjectiveDetailsOpen(false);
                setSelectedObjective(detailsObjective);
                setObjectiveModalOpen(true);
              }}
            >
              Edit Objective
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Modal */}
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

      {/* Goal Details Modal */}
      <Dialog
        open={goalDetailsOpen}
        onOpenChange={setGoalDetailsOpen}
      >
        <DialogContent className='max-w-2xl'>
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
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      detailsGoal?.status === 'Active'
                        ? 'bg-blue-100 text-blue-700'
                        : detailsGoal?.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : detailsGoal?.status === 'Paused'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {detailsGoal?.status || 'Unknown'}
                  </span>
                  {detailsGoal?.category && (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700'>
                      {detailsGoal.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            {detailsGoal?.description && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Description
                </h3>
                <p className='text-gray-700'>{detailsGoal.description}</p>
              </div>
            )}

            {(detailsGoal?.startDate || detailsGoal?.dueDate) && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Timeline
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {detailsGoal?.startDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Start:{' '}
                        {new Date(detailsGoal.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {detailsGoal?.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Due:{' '}
                        {new Date(detailsGoal.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='ghost'
              onClick={() => setGoalDetailsOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setGoalDetailsOpen(false);
                setEditingGoal(detailsGoal);
                setModalOpen(true);
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

export default GoalsPage;
