import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
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
import {
  Objective,
  ObjectiveCreate,
  getGoals,
  getProjects,
  createProject,
  Goal,
  Project,
} from '../../lib/api/api';
import ProjectModal from '../projects/ProjectModal';
import Card from '../../components/ui/Card';

interface ObjectiveModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    objective: ObjectiveCreate & { selectedProjectIds?: string[] }
  ) => void;
  objective?: Objective | null;
  labels?: {
    entity?: string;
    entityPlural?: string;
    parent?: string;
    parentPlural?: string;
    child?: string;
    childPlural?: string;
  };
}

interface ProjectFormData {
  name: string;
}

const ObjectiveModal: React.FC<ObjectiveModalProps> = ({
  open,
  onClose,
  onSave,
  objective,
  labels,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'Active' as Objective['status'],
    priority: 'Medium' as Objective['priority'],
    relatedGoals: [] as string[],
    relatedProjects: [] as string[],
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<ProjectFormData>({
    name: '',
  });
  const [newProjectErrors, setNewProjectErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const entityLabel = labels?.entity || 'Objective';
  const entityLabelPlural = labels?.entityPlural || `${entityLabel}s`;
  const parentLabel = labels?.parent || 'Goal';
  const parentLabelPlural = labels?.parentPlural || `${parentLabel}s`;
  const childLabel = labels?.child || 'Project';
  const childLabelPlural = labels?.childPlural || `${childLabel}s`;

  useEffect(() => {
    if (open) {
      loadData();
      if (objective) {
        setFormData({
          title: objective.title,
          status: objective.status,
          priority: objective.priority || 'Medium',
          relatedGoals: Array.isArray(objective.relatedGoals)
            ? objective.relatedGoals.map((g: { _id: string } | string) =>
                typeof g === 'string' ? g : g._id
              )
            : [],
          relatedProjects: Array.isArray(objective.relatedProjects)
            ? objective.relatedProjects.map((p: { _id: string } | string) =>
                typeof p === 'string' ? p : p._id
              )
            : [],
        });
      } else {
        setFormData({
          title: '',
          status: 'Active',
          priority: 'Medium',
          relatedGoals: [],
          relatedProjects: [],
        });
      }
      setErrors({});
      setNewProjectErrors({});
      setShowNewProjectForm(false);
      setNewProjectForm({
        name: '',
      });
      setSelectedProjectIds([]);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open, objective]);

  useEffect(() => {
    if (showNewProjectForm && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewProjectForm]);

  const loadData = async () => {
    try {
      const [goalsData, projectsData] = await Promise.all([
        getGoals(),
        getProjects(),
      ]);
      setGoals(goalsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAddNewProject = async () => {
    if (!newProjectForm.name.trim()) {
      setNewProjectErrors({ name: 'Project name is required' });
      return;
    }

    try {
      const newProject = await createProject({
        name: newProjectForm.name,
        status: 'Active',
        priority: 'Medium',
        objectives: [],
      });

      setProjects((prev) => [...prev, newProject]);
      setSelectedProjectIds((prev) => [...prev, newProject._id]);
      setNewProjectForm({
        name: '',
      });
      setShowNewProjectForm(false);
      setNewProjectErrors({});
      setAlert({ type: 'success', message: 'Project created successfully!' });
      setTimeout(() => setAlert(null), 2000);
    } catch (error) {
      console.error('Failed to create project:', error);
      setAlert({
        type: 'error',
        message: 'Failed to create project. Please try again.',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
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
        title: formData.title,
        status: formData.status,
        priority: formData.priority,
        relatedGoals: formData.relatedGoals,
        relatedProjects: formData.relatedProjects,
        selectedProjectIds: selectedProjectIds, // Include selected projects
      });
      setAlert({
        type: 'success',
        message: objective
          ? 'Objective updated successfully!'
          : 'Objective created successfully!',
      });
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to save objective. Please try again.',
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedGoals: prev.relatedGoals.includes(goalId)
        ? prev.relatedGoals.filter((id) => id !== goalId)
        : [...prev.relatedGoals, goalId],
    }));
  };

  const handleProjectToggle = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedProjects: prev.relatedProjects.includes(projectId)
        ? prev.relatedProjects.filter((id) => id !== projectId)
        : [...prev.relatedProjects, projectId],
    }));
  };

  const removeGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedGoals: prev.relatedGoals.filter((id) => id !== goalId),
    }));
  };

  const handleProjectSelection = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const validateNewProject = () => {
    const errors: Record<string, string> = {};
    if (!newProjectForm.name.trim()) {
      errors.name = 'Project name is required';
    }
    if (newProjectForm.name.length > 100) {
      errors.name = 'Project name must be less than 100 characters';
    }
    setNewProjectErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewProjectInputChange = (
    field: keyof ProjectFormData,
    value: any
  ) => {
    setNewProjectForm((prev) => ({ ...prev, [field]: value }));
    if (newProjectErrors[field]) {
      setNewProjectErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const removeProject = (projectId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedProjects: prev.relatedProjects.filter((id) => id !== projectId),
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        dir='auto'
        className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl'
      >
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
            {objective ? `Edit ${entityLabel}` : `Create New ${entityLabel}`}
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
          <Card className='p-5 border-purple-100'>
            <div className='mb-4'>
              <h2 className='text-lg font-bold text-purple-700 mb-1'>
                {entityLabel} Details
              </h2>
              <p className='text-sm text-gray-500 mb-2'>
                Fill in the details for your new {entityLabel.toLowerCase()}.
              </p>
            </div>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Title
                </label>
                <input
                  name='title'
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={`Enter your ${entityLabel.toLowerCase()} title`}
                  className='w-full px-3 py-2.5 border rounded-lg transition-all duration-200 border-purple-200 focus:border-purple-500 bg-white'
                  ref={titleInputRef}
                />
                {errors.title && (
                  <div className='flex items-center gap-1 mt-1 text-red-600 text-sm'>
                    <AlertTriangle className='w-4 h-4' />
                    {errors.title}
                  </div>
                )}
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='block text-sm font-semibold text-gray-700'>
                    Priority
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleSelectChange('priority', value)
                    }
                  >
                    <SelectTrigger className='border-purple-200 focus:border-purple-500 bg-white'>
                      <SelectValue placeholder='Select priority' />
                    </SelectTrigger>
                    <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                      <SelectItem value='Low'>Low</SelectItem>
                      <SelectItem value='Medium'>Medium</SelectItem>
                      <SelectItem value='High'>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <label className='block text-sm font-semibold text-gray-700'>
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                  >
                    <SelectTrigger className='border-purple-200 focus:border-purple-500 bg-white'>
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
              </div>
            </div>
          </Card>
          {/* Related Parent Section */}
          <Card className='p-5 border-purple-100'>
            <div className='mb-4'>
              <h2 className='text-lg font-bold text-purple-700 mb-1'>
                Related {parentLabelPlural}
              </h2>
              <p className='text-sm text-gray-500 mb-2'>
                Link {parentLabelPlural.toLowerCase()} to this{' '}
                {entityLabel.toLowerCase()} for better tracking.
              </p>
            </div>
            {/* Selected Goals Display */}
            {formData.relatedGoals.length > 0 && (
              <div className='space-y-2'>
                <p className='text-sm font-medium text-gray-600'>
                  Selected {parentLabelPlural}:
                </p>
                <div className='flex flex-wrap gap-2'>
                  {formData.relatedGoals.map((goalId) => {
                    const goal = goals.find((g) => g._id === goalId);
                    return goal ? (
                      <motion.span
                        key={goalId}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                      >
                        {goal.name}
                        <button
                          type='button'
                          onClick={() => removeGoal(goalId)}
                          className='ml-2 text-blue-600 hover:text-blue-800'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </motion.span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Parent Selection */}
            <div className='max-h-32 overflow-y-auto border-2 border-purple-100 rounded-lg p-3 space-y-2 bg-purple-50'>
              {goals.length === 0 ? (
                <p className='text-sm text-gray-500 text-center py-2'>
                  No {parentLabelPlural.toLowerCase()} available
                </p>
              ) : (
                goals.map((goal) => (
                  <label
                    key={goal._id}
                    className='flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-purple-100 transition-colors'
                  >
                    <input
                      type='checkbox'
                      checked={formData.relatedGoals.includes(goal._id)}
                      onChange={() => handleGoalToggle(goal._id)}
                      className='rounded border-purple-300 text-purple-600 focus:ring-purple-500'
                    />
                    <span className='text-sm text-gray-700'>{goal.name}</span>
                  </label>
                ))
              )}
            </div>
          </Card>
          {/* Enhanced Child Section */}
          <Card className='p-5 border-indigo-100'>
            <div className='mb-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-bold text-indigo-700'>
                  Associate {childLabelPlural}
                </h2>
                <button
                  type='button'
                  onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                  className='flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors'
                >
                  {showNewProjectForm ? (
                    <ChevronUp className='w-4 h-4' />
                  ) : (
                    <ChevronDown className='w-4 h-4' />
                  )}
                  {showNewProjectForm ? 'Hide' : `Add New ${childLabel}`}
                </button>
              </div>
              <p className='text-sm text-gray-500'>
                Select existing {childLabelPlural.toLowerCase()} or create new
                ones to associate with this {entityLabel.toLowerCase()}.
              </p>
            </div>

            {/* New Project Form */}
            {showNewProjectForm && (
              <div className='mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {childLabel} Name *
                    </label>
                    <input
                      type='text'
                      value={newProjectForm.name}
                      onChange={(e) =>
                        handleNewProjectInputChange('name', e.target.value)
                      }
                      placeholder={`Enter ${childLabel.toLowerCase()} name`}
                      className='w-full px-3 py-2 border rounded-lg transition-all duration-200 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                    {newProjectErrors.name && (
                      <p className='text-sm text-red-600 mt-1'>
                        {newProjectErrors.name}
                      </p>
                    )}
                  </div>

                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      onClick={handleAddNewProject}
                      className='bg-indigo-600 hover:bg-indigo-700 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      {`Create ${childLabel}`}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Projects Selection */}
            <div className='space-y-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Select Existing {childLabelPlural}
              </label>
              <div className='max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2'>
                {projects.length === 0 ? (
                  <div className='text-sm text-gray-500 text-center py-4'>
                    {`No ${childLabelPlural.toLowerCase()} available.`}
                  </div>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project._id}
                      className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={selectedProjectIds.includes(project._id)}
                        onChange={() => handleProjectSelection(project._id)}
                        className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {project.name}
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : project.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {project.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : project.status === 'Active'
                                ? 'bg-blue-100 text-blue-700'
                                : project.status === 'Next'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedProjectIds.length > 0 && (
                <div className='text-sm text-gray-600 bg-indigo-50 p-2 rounded'>
                  {`Selected ${
                    selectedProjectIds.length
                  } ${childLabelPlural.toLowerCase()} to associate with this ${entityLabel.toLowerCase()}`}
                </div>
              )}
            </div>
          </Card>
          <div className='flex justify-between space-x-3 pt-6 border-t border-purple-100'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
              className='border-purple-200 text-purple-600 hover:bg-purple-50'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg flex items-center gap-2'
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
              {objective ? 'Update' : 'Create'} {entityLabel}
            </Button>
          </div>
        </motion.form>
        <ProjectModal
          open={projectModalOpen}
          onClose={() => {
            setProjectModalOpen(false);
            setSelectedProject(null);
          }}
          onSave={() => {
            setProjectModalOpen(false);
            setSelectedProject(null);
            loadData();
          }}
          project={selectedProject}
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

export default ObjectiveModal;
