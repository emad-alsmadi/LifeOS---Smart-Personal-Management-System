import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import Button from '../../components/ui/Button';
import DatePicker from '../../components/ui/DatePicker';
import {
  Project,
  getObjectives,
  Objective,
  getTasks,
  Task,
  createTask,
} from '../../lib/api/api';
import TaskModal from '../tasks/TaskModal';
import Card from '../../components/ui/Card';
import { AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project> & { selectedTaskIds?: string[] }) => void;
  project?: Project | null;
  labels?: {
    entity?: string;
    entityPlural?: string;
    parent?: string;
    parentPlural?: string;
    child?: string;
    childPlural?: string;
  };
}

interface TaskFormData {
  name: string;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  open,
  onClose,
  onSave,
  project,
  labels,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active' as Project['status'],
    priority: 'Medium' as Project['priority'],
    objectives: [] as string[],
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
  });
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState<TaskFormData>({
    name: '',
  });
  const [newTaskErrors, setNewTaskErrors] = useState<Record<string, string>>(
    {}
  );
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);

  const entityLabel = labels?.entity || 'Project';
  const entityLabelPlural = labels?.entityPlural || `${entityLabel}s`;
  const parentLabel = labels?.parent || 'Objective';
  const parentLabelPlural = labels?.parentPlural || `${parentLabel}s`;
  const childLabel = labels?.child || 'Task';
  const childLabelPlural = labels?.childPlural || `${childLabel}s`;

  const loadObjectives = async () => {
    try {
      const data = await getObjectives();
      setObjectives(data);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    }
  };

  const loadTasks = async (projectId: string) => {
    try {
      setTasksLoading(true);
      const allTasksData = await getTasks();
      setAllTasks(allTasksData);
      if (projectId) {
        // For editing: show both project tasks and unassigned tasks
        const projectTasks = allTasksData.filter(
          (t: Task) => t.projectId === projectId
        );
        const unassignedTasks = allTasksData.filter((t: Task) => !t.projectId);
        setTasks([...projectTasks, ...unassignedTasks]);
        // Set selected tasks to currently associated tasks when editing
        setSelectedTaskIds(projectTasks.map((t) => t._id));
      } else {
        // For new projects: show only unassigned tasks
        setTasks(allTasksData.filter((t: Task) => !t.projectId));
        setSelectedTaskIds([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
      setAllTasks([]);
      setSelectedTaskIds([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadObjectives();
      if (project) {
        setFormData({
          name: project.name,
          status: project.status,
          priority: project.priority,
          objectives: Array.isArray(project.objectives)
            ? project.objectives.map((obj: { _id: string } | string) =>
                typeof obj === 'string' ? obj : obj._id
              )
            : [],
          startDate: project.startDate
            ? new Date(project.startDate)
            : undefined,
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
        });
        loadTasks(project._id);
      } else {
        setFormData({
          name: '',
          status: 'Active',
          priority: 'Medium',
          objectives: [],
          startDate: undefined,
          dueDate: undefined,
        });
        loadTasks(''); // Load unassigned tasks for new project
        setSelectedTaskIds([]);
      }
      setErrors({});
      setNewTaskErrors({});
      setShowNewTaskForm(false);
      setNewTaskForm({
        name: '',
      });
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, project]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (
      formData.startDate &&
      formData.dueDate &&
      formData.startDate > formData.dueDate
    ) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);
    try {
      await onSave({
        name: formData.name,
        status: formData.status,
        priority: formData.priority,
        objectives: formData.objectives,
        startDate: formData.startDate?.toISOString(),
        dueDate: formData.dueDate?.toISOString(),
        selectedTaskIds: selectedTaskIds, // Include selected tasks
      });
      setAlert({
        type: 'success',
        message: project
          ? 'Project updated successfully!'
          : 'Project created successfully!',
      });
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to save project. Please try again.',
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const validateNewTask = () => {
    const errors: Record<string, string> = {};
    if (!newTaskForm.name.trim()) {
      errors.name = 'Task name is required';
    }
    if (newTaskForm.name.length > 100) {
      errors.name = 'Task name must be less than 100 characters';
    }
    setNewTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewTask = async () => {
    if (!validateNewTask()) return;

    try {
      const newTask = await createTask({
        name: newTaskForm.name,
        status: 'Active',
        priority: 'Medium',
        type: 'Project Task',
        dueDate: undefined,
        projectId: project?._id || undefined,
      });

      // Add the new task to selected tasks
      setSelectedTaskIds((prev) => [...prev, newTask._id]);

      // Reset form
      setNewTaskForm({
        name: '',
      });
      setShowNewTaskForm(false);
      setNewTaskErrors({});

      // Reload tasks
      await loadTasks(project?._id || '');

      setAlert({
        type: 'success',
        message: 'Task created successfully!',
      });

      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Failed to create task:', error);
      setAlert({
        type: 'error',
        message: 'Failed to create task. Please try again.',
      });
    }
  };

  const handleNewTaskInputChange = (field: keyof TaskFormData, value: any) => {
    setNewTaskForm((prev) => ({ ...prev, [field]: value }));
    if (newTaskErrors[field]) {
      setNewTaskErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        dir='auto'
        className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'
      >
        <DialogHeader>
          {/* Breadcrumbs */}
          <nav className='mb-2 text-xs text-gray-500 flex items-center space-x-2'>
            {/* You can pass the objective name as a prop for full context */}
            <span className='font-semibold text-blue-700'>{parentLabel}</span>
            <span>&gt;</span>
            <span className='font-semibold text-purple-700'>
              {project?.name || entityLabel}
            </span>
            {selectedTask && (
              <>
                <span>&gt;</span>
                <span className='font-semibold text-orange-700'>
                  {selectedTask.name}
                </span>
              </>
            )}
          </nav>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
            {project ? `Edit ${entityLabel}` : `Create New ${entityLabel}`}
          </DialogTitle>
        </DialogHeader>
        {alert && (
          <div
            className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-md text-sm font-medium ${
              alert.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {alert.type === 'error' && (
              <AlertTriangle className='w-4 h-4 text-red-500' />
            )}
            {alert.message}
          </div>
        )}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <Card className='p-5 border-blue-100'>
            <div className='mb-4'>
              <h2 className='text-lg font-bold text-blue-700 mb-1'>
                {entityLabel} Details
              </h2>
              <p className='text-sm text-gray-500 mb-2'>
                Fill in the details for your new {entityLabel.toLowerCase()}.
              </p>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Name
                </label>
                <input
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={`Enter ${entityLabel.toLowerCase()} name`}
                  className='w-full px-3 py-2.5 border rounded-lg transition-all duration-200 border-blue-200 focus:border-blue-500 bg-white'
                  ref={nameInputRef}
                />
                {errors.name && (
                  <div className='flex items-center gap-1 mt-1 text-red-600 text-sm'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                      <SelectItem value='Active'>Active</SelectItem>
                      <SelectItem value='Completed'>Completed</SelectItem>
                      <SelectItem value='Next'>Next</SelectItem>
                      <SelectItem value='Paused'>Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleSelectChange('priority', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                      <SelectItem value='Low'>Low</SelectItem>
                      <SelectItem value='Medium'>Medium</SelectItem>
                      <SelectItem value='High'>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  {parentLabelPlural}
                </label>
                <div className='max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2'>
                  {objectives.length === 0 ? (
                    <div className='text-sm text-gray-500 text-center py-4'>
                      No {parentLabelPlural.toLowerCase()} available
                    </div>
                  ) : (
                    objectives.map((objective) => (
                      <label
                        key={objective._id}
                        className='flex items-center space-x-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={formData.objectives.includes(objective._id)}
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              objectives: prev.objectives.includes(
                                objective._id
                              )
                                ? prev.objectives.filter(
                                    (id) => id !== objective._id
                                  )
                                : [...prev.objectives, objective._id],
                            }));
                          }}
                          className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                        />
                        <span className='text-sm'>{objective.title}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Start Date
                  </label>
                  <DatePicker
                    date={formData.startDate}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, startDate: date }))
                    }
                    placeholder='Select start date'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Due Date
                  </label>
                  <DatePicker
                    date={formData.dueDate}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, dueDate: date }))
                    }
                    placeholder='Select due date'
                  />
                  {errors.dueDate && (
                    <p className='text-sm text-red-600'>{errors.dueDate}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Child Selection Section */}
          {
            <Card className='p-5 border-green-100'>
              <div className='mb-4'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-bold text-green-700'>
                    {project
                      ? `Manage Associated ${childLabelPlural}`
                      : `Associate ${childLabelPlural}`}
                  </h2>
                  <button
                    type='button'
                    onClick={() => setShowNewTaskForm(!showNewTaskForm)}
                    className='flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors'
                  >
                    {showNewTaskForm ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                    {showNewTaskForm ? 'Hide' : `Add New ${childLabel}`}
                  </button>
                </div>
                <p className='text-sm text-gray-500'>
                  {project
                    ? `Select or deselect ${childLabelPlural.toLowerCase()} to associate with this ${entityLabel.toLowerCase()}. You can also create new ${childLabelPlural.toLowerCase()}.`
                    : `Select existing ${childLabelPlural.toLowerCase()} or create new ones to associate with this ${entityLabel.toLowerCase()}.`}
                </p>
              </div>

              {/* New Task Form */}
              {showNewTaskForm && (
                <div className='mb-4 p-4 bg-green-50 rounded-lg border border-green-200'>
                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        {childLabel} Name *
                      </label>
                      <input
                        type='text'
                        value={newTaskForm.name}
                        onChange={(e) =>
                          handleNewTaskInputChange('name', e.target.value)
                        }
                        placeholder={`Enter ${childLabel.toLowerCase()} name`}
                        className='w-full px-3 py-2 border rounded-lg transition-all duration-200 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      />
                      {newTaskErrors.name && (
                        <p className='text-sm text-red-600 mt-1'>
                          {newTaskErrors.name}
                        </p>
                      )}
                    </div>

                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        onClick={handleCreateNewTask}
                        className='bg-green-600 hover:bg-green-700 text-white'
                      >
                        <Plus className='w-4 h-4 mr-2' />
                        {`Create ${childLabel}`}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing Tasks Selection */}
              <div className='space-y-3'>
                <label className='block text-sm font-medium text-gray-700'>
                  {project
                    ? `Select ${childLabelPlural} to Associate`
                    : `Select Existing ${childLabelPlural}`}
                </label>
                <div className='max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2'>
                  {tasksLoading ? (
                    <div className='text-sm text-gray-500 text-center py-4'>
                      Loading tasks...
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className='text-sm text-gray-500 text-center py-4'>
                      {project
                        ? `No ${childLabelPlural.toLowerCase()} available for this ${entityLabel.toLowerCase()}.`
                        : `No unassigned ${childLabelPlural.toLowerCase()} available.`}
                    </div>
                  ) : (
                    tasks.map((task) => (
                      <label
                        key={task._id}
                        className={`flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
                          task.projectId === project?._id
                            ? 'bg-blue-50 border border-blue-200'
                            : ''
                        }`}
                      >
                        <input
                          type='checkbox'
                          checked={selectedTaskIds.includes(task._id)}
                          onChange={() => handleTaskSelection(task._id)}
                          className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                        />
                        <div className='flex-1 min-w-0'>
                          <div className='text-sm font-medium text-gray-900 truncate'>
                            {task.name}
                            {task.projectId === project?._id && (
                              <span className='ml-2 text-xs text-blue-600 font-medium'>
                                (Currently Associated)
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-2 mt-1'>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                task.priority === 'High'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                            </span>
                            {task.dueDate && (
                              <span className='text-xs text-gray-500'>
                                Due:{' '}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                </div>

                {selectedTaskIds.length > 0 && (
                  <div className='text-sm text-gray-600 bg-blue-50 p-2 rounded'>
                    {`Selected ${
                      selectedTaskIds.length
                    } ${childLabelPlural.toLowerCase()} to associate with this ${entityLabel.toLowerCase()}`}
                  </div>
                )}
              </div>
            </Card>
          }

          <div className='flex justify-between space-x-3 pt-6 border-t border-blue-100'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
              className='border-blue-200 text-blue-600 hover:bg-blue-50'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg flex items-center gap-2'
              disabled={loading}
            >
              {loading && (
                <svg
                  className='animate-spin h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                  ></path>
                </svg>
              )}
              {project ? 'Update' : 'Create'} {entityLabel}
            </Button>
          </div>
        </motion.form>

        <TaskModal
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedTask(null);
            loadTasks(project?._id || '');
          }}
          onSave={() => {
            setTaskModalOpen(false);
            setSelectedTask(null);
            loadTasks(project?._id || '');
          }}
          task={selectedTask}
          labels={{
            entity: childLabel,
            entityPlural: childLabelPlural,
            parent: entityLabel,
            parentPlural: entityLabelPlural,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;
