import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Project, Objective, Task, Goal } from '../../lib/api/api';
import ObjectiveDetailsModal from '../objectives/ObjectiveDetailsModal';
import GoalModal from '../goals/GoalModal';
import {
  FolderOpen,
  TrendingUp,
  Calendar,
  CheckCircle,
  Target,
} from 'lucide-react';
import { useState } from 'react';

interface ProjectDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  project: Project | null;
  relatedObjectives: Objective[];
  relatedGoals: Goal[];
  relatedTasks: Task[];
}

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

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  open,
  onClose,
  onEdit,
  project,
  relatedObjectives = [],
  relatedGoals = [],
  relatedTasks = [],
}) => {
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [objectiveDetailsOpen, setObjectiveDetailsOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(
    null
  );

  if (!project) return null;

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  };

  // Progress calculations
  const totalTasks = relatedTasks.length;
  const completedTasks = relatedTasks.filter(
    (t) => t.status === 'Completed'
  ).length;
  const tasksProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onClose}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 shadow-xl'>
          <DialogHeader>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='p-3 bg-indigo-500 rounded-xl'>
                <FolderOpen className='w-6 h-6 text-white' />
              </div>
              <div>
                <DialogTitle
                  className='text-2xl font-bold text-gray-900 !no-underline focus:!no-underline'
                  style={{ textDecoration: 'none' }}
                >
                  {project.name}
                </DialogTitle>
                <div className='flex items-center space-x-2 mt-2'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      priorityColors[project.priority]
                    }`}
                  >
                    {project.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className='space-y-6'>
            {/* Timeline */}
            {(project.startDate || project.dueDate) && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Timeline
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {project.startDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Start:{' '}
                        {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Progress Overview */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='p-4 bg-indigo-50 rounded-lg text-center'>
                <div className='text-2xl font-bold text-indigo-600'>
                  {totalTasks}
                </div>
                <div className='text-sm text-gray-600'>Total Tasks</div>
              </div>
              <div className='p-4 bg-green-50 rounded-lg text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {completedTasks}
                </div>
                <div className='text-sm text-gray-600'>Completed Tasks</div>
              </div>
              <div className='p-4 bg-orange-50 rounded-lg text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {tasksProgress}%
                </div>
                <div className='text-sm text-gray-600'>Progress</div>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                  <div
                    className='bg-orange-500 h-2 rounded-full transition-all duration-300'
                    style={{ width: `${tasksProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {/* Related Goals */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Related Goals
              </h3>
              <div className='flex flex-wrap gap-2'>
                {relatedGoals.length === 0 ? (
                  <span className='text-xs text-gray-400'>
                    No related goals
                  </span>
                ) : (
                  relatedGoals.map((goal) => (
                    <Badge
                      key={goal._id}
                      className='bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200'
                      onClick={() => handleGoalClick(goal)}
                    >
                      {goal.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            {/* Related Objectives */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Related Objectives
              </h3>
              <div className='flex flex-wrap gap-2'>
                {relatedObjectives.length === 0 ? (
                  <span className='text-xs text-gray-400'>
                    No related objectives
                  </span>
                ) : (
                  relatedObjectives.map((obj) => (
                    <Badge
                      key={obj._id}
                      className='bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200'
                      onClick={() => {
                        setSelectedObjective(obj);
                        setObjectiveDetailsOpen(true);
                      }}
                    >
                      {obj.title}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            {/* Related Tasks */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Tasks ({relatedTasks.length})
              </h3>
              <div className='space-y-2'>
                {relatedTasks.length === 0 ? (
                  <span className='text-xs text-gray-400'>
                    No tasks assigned to this project
                  </span>
                ) : (
                  relatedTasks.map((task) => (
                    <div
                      key={task._id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
                    >
                      <div className='flex items-center space-x-3'>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.status === 'Completed'
                              ? 'bg-green-500'
                              : task.status === 'Active'
                              ? 'bg-blue-500'
                              : task.status === 'Next'
                              ? 'bg-purple-500'
                              : 'bg-gray-400'
                          }`}
                        ></div>
                        <div>
                          <div className='font-medium text-gray-900'>
                            {task.name || `Task ${task._id.slice(-4)}`}
                          </div>
                          <div className='text-sm text-gray-500'>
                            Priority: {task.priority}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Badge
                          className={`${
                            task.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : task.status === 'Active'
                              ? 'bg-blue-100 text-blue-700'
                              : task.status === 'Next'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {task.status}
                        </Badge>
                        {task.dueDate && (
                          <span className='text-xs text-gray-500'>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter className='flex justify-end space-x-2 mt-6'>
            <Button
              variant='outline'
              onClick={onClose}
              className='border-indigo-200 text-indigo-600 hover:bg-indigo-50'
            >
              Close
            </Button>
            <Button
              variant='primary'
              onClick={onEdit}
              className='bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <GoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={() => setGoalModalOpen(false)}
        goal={selectedGoal}
      />
      {/* Objective Details Modal */}
      <ObjectiveDetailsModal
        open={objectiveDetailsOpen}
        onClose={() => setObjectiveDetailsOpen(false)}
        onEdit={() => setObjectiveDetailsOpen(false)}
        objective={selectedObjective}
        relatedProjects={[]}
        relatedGoals={[]}
      />
    </>
  );
};

export default ProjectDetailsModal;
