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
import { Project, Goal, Objective } from '../../lib/api/api';
import ProjectModal from '../projects/ProjectModal';
import ProjectDetailsModal from '../projects/ProjectDetailsModal';
import {
  getObjectives,
  getTasks,
  getGoals,
  getProjects,
} from '../../lib/api/api';
import { useState } from 'react';
import { Task } from '../../lib/api/api';
import GoalModal from '../goals/GoalModal';
import { Target } from 'lucide-react';

interface ObjectiveDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  objective: Objective | null;
  relatedProjects: Project[];
  relatedGoals: Goal[];
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

const ObjectiveDetailsModal: React.FC<ObjectiveDetailsModalProps> = ({
  open,
  onClose,
  onEdit,
  objective,
  relatedProjects,
  relatedGoals,
}) => {
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);
  const [detailsRelatedObjectives, setDetailsRelatedObjectives] = useState<
    Objective[]
  >([]);
  const [detailsRelatedTasks, setDetailsRelatedTasks] = useState<Task[]>([]);
  const [projectEditModalOpen, setProjectEditModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [goalDetailsOpen, setGoalDetailsOpen] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<any>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  if (!objective) return null;

  // Type guard for optional description
  function hasDescription(obj: unknown): obj is { description: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'description' in obj &&
      typeof (obj as { description: unknown }).description === 'string'
    );
  }
  let description: string | undefined = undefined;
  if (hasDescription(objective)) {
    description = objective.description;
  }

  const handleProjectClick = async (project: Project) => {
    setProjectDetailsOpen(false);
    setDetailsProject(null);
    setDetailsRelatedObjectives([]);
    setDetailsRelatedTasks([]);
    // Fetch related objectives and tasks
    try {
      const [allObjectives, allTasks] = await Promise.all([
        getObjectives(),
        getTasks(),
      ]);
      setDetailsProject(project);
      setDetailsRelatedObjectives(
        allObjectives.filter((obj) =>
          (project.objectives || []).includes(obj._id)
        )
      );
      setDetailsRelatedTasks(
        allTasks.filter((task) => task.projectId === project._id)
      );
      setProjectDetailsOpen(true);
    } catch {
      setDetailsProject(project);
      setDetailsRelatedObjectives([]);
      setDetailsRelatedTasks([]);
      setProjectDetailsOpen(true);
    }
  };

  const handleGoalClick = async (goal: any) => {
    setGoalDetailsOpen(false);
    setDetailsGoal(null);
    try {
      const goals = await getGoals();
      const foundGoal = goals.find((g: any) => g._id === (goal._id || goal));
      setDetailsGoal(foundGoal);
      setGoalDetailsOpen(true);
    } catch {
      setDetailsGoal(null);
      setGoalDetailsOpen(true);
    }
  };

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
                <Target className='w-6 h-6 text-white' />
              </div>
              <div>
                <DialogTitle
                  className='text-2xl font-bold text-gray-900 !no-underline focus:!no-underline'
                  style={{ textDecoration: 'none' }}
                >
                  {objective.title}
                </DialogTitle>
                <div className='flex items-center space-x-2 mt-2'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusColors[objective.status]
                    }`}
                  >
                    {objective.status}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      priorityColors[objective.priority]
                    }`}
                  >
                    {objective.priority} Priority
                  </span>
                  <span className='text-xs text-gray-500 ml-2'>
                    Created:{' '}
                    {new Date(objective.createdAt).toLocaleDateString()}
                  </span>
                  <span className='text-xs text-gray-500'>
                    Updated:{' '}
                    {new Date(objective.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className='space-y-6'>
            {description && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  Description
                </h3>
                <p className='text-gray-700'>{description}</p>
              </div>
            )}
            {/* Timeline */}
            {(objective.startDate || objective.dueDate) && (
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Timeline
                </h3>
                <div className='grid grid-cols-2 gap-4'>
                  {objective.startDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Start:{' '}
                        {new Date(objective.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {objective.dueDate && (
                    <div className='flex items-center space-x-2'>
                      <Calendar className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>
                        Due: {new Date(objective.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Related Projects */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Related Projects
              </h3>
              <div className='flex flex-wrap gap-2'>
                {relatedProjects.length === 0 ? (
                  <span className='text-xs text-gray-400'>
                    No related projects
                  </span>
                ) : (
                  relatedProjects.map((project) => (
                    <Badge
                      key={project._id}
                      className='cursor-pointer bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      onClick={() => handleProjectClick(project)}
                    >
                      {project.name}
                    </Badge>
                  ))
                )}
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
      <ProjectDetailsModal
        open={projectDetailsOpen}
        onClose={() => setProjectDetailsOpen(false)}
        onEdit={() => {
          setProjectDetailsOpen(false);
          setProjectToEdit(detailsProject);
          setProjectEditModalOpen(true);
        }}
        project={detailsProject}
        relatedObjectives={detailsRelatedObjectives}
        relatedTasks={detailsRelatedTasks}
      />
      <ProjectModal
        open={projectEditModalOpen}
        onClose={() => {
          setProjectEditModalOpen(false);
          setProjectToEdit(null);
        }}
        onSave={() => {
          setProjectEditModalOpen(false);
          setProjectToEdit(null);
        }}
        project={projectToEdit}
      />
      <GoalModal
        open={goalDetailsOpen}
        onClose={() => setGoalDetailsOpen(false)}
        onSave={() => setGoalDetailsOpen(false)}
        goal={detailsGoal}
      />
    </>
  );
};

export default ObjectiveDetailsModal;
