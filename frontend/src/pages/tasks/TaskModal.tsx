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
import { Task, getProjects, getTasks, Project } from '../../lib/api/api';
import Card from '../../components/ui/Card';
import { AlertTriangle } from 'lucide-react';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    task: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => void;
  task?: Task | null;
  labels?: {
    entity?: string;
    entityPlural?: string;
    parent?: string;
    parentPlural?: string;
  };
}

const DEFAULT_TYPES = ['Work', 'Schedule'];
const LOCAL_STORAGE_KEY = 'customTaskTypes';

const TaskModal: React.FC<TaskModalProps> = ({
  open,
  onClose,
  onSave,
  task,
  labels,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active' as Task['status'],
    priority: 'Medium' as Task['priority'],
    type: 'Work' as Task['type'],
    dueDate: undefined as Date | undefined,
    projectId: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [customTypes, setCustomTypes] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newType, setNewType] = useState('');

  const allTypes = [...DEFAULT_TYPES, ...customTypes];

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const entityLabel = labels?.entity || 'Task';
  const entityLabelPlural = labels?.entityPlural || `${entityLabel}s`;
  const parentLabel = labels?.parent || 'Project';
  const parentLabelPlural = labels?.parentPlural || `${parentLabel}s`;

  const handleAddNewType = () => {
    const type = newType.trim();
    if (!type || allTypes.includes(type)) return;
    const updated = [...customTypes, type];
    setCustomTypes(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setFormData((prev) => ({ ...prev, type }));
    setShowNewTypeInput(false);
    setNewType('');
  };

  useEffect(() => {
    console.log('TaskModal useEffect - open:', open, 'task:', task);
    if (open) {
      loadData();
      if (task) {
        setFormData({
          name: task.name,
          status: task.status,
          priority: task.priority,
          type: task.type,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          projectId: task.projectId ? String(task.projectId) : '',
        });
      } else {
        setFormData({
          name: '',
          status: 'Active',
          priority: 'Medium',
          type: 'Work',
          dueDate: undefined,
          projectId: '',
        });
      }
      setErrors({});
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, task]);

  const loadData = async () => {
    try {
      console.log('Loading task modal data...');
      const [projectsData, tasksData] = await Promise.all([
        getProjects(),
        getTasks(),
      ]);
      console.log('Loaded data:', { projectsData, tasksData });
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    console.log('Form validation:', { formData, newErrors });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const payload = {
        name: formData.name,
        status: formData.status,
        priority: formData.priority,
        type: formData.type,
        dueDate: formData.dueDate?.toISOString(),
        projectId: formData.projectId ? String(formData.projectId) : undefined,
      };
      console.log('Saving task with payload:', payload);

      await onSave(payload);
      setAlert({
        type: 'success',
        message: task
          ? 'Task updated successfully!'
          : 'Task created successfully!',
      });
      setTimeout(() => setAlert(null), 2000);
    } catch (error) {
      console.error('Failed to save task:', error);
      setAlert({
        type: 'error',
        message: 'Failed to save task. Please try again.',
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
    console.log('Select change:', { name, value });
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  console.log('TaskModal render - open:', open);
  console.log('Projects for dropdown:', projects);
  console.log('Current projectId:', formData.projectId);

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        dir='auto'
        className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle>
            {task ? `Edit ${entityLabel}` : `Create New ${entityLabel}`}
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

              <div className='grid grid-cols-3 gap-4'>
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
                      <SelectItem value='Paused'>Paused</SelectItem>
                      <SelectItem value='Next'>Next</SelectItem>
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

                <div className='space-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Type
                  </label>
                  {!showNewTypeInput ? (
                    <Select
                      value={formData.type}
                      onValueChange={(value) => {
                        if (value === '__add_new__') {
                          setShowNewTypeInput(true);
                        } else {
                          setFormData((prev) => ({ ...prev, type: value }));
                        }
                      }}
                    >
                      <SelectTrigger className='border-blue-200 focus:border-blue-500 bg-white'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                      <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                        {allTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                          >
                            {type}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value='__add_new__'
                          className='text-blue-600 font-medium'
                        >
                          + Add New Type
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className='flex flex-col sm:flex-row items-center gap-2 bg-white border border-blue-100 rounded-md p-2'>
                      <input
                        name='type'
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        placeholder='Enter new type'
                        className='flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm'
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewType();
                          }
                        }}
                      />
                      <button
                        type='button'
                        disabled={!newType.trim()}
                        onClick={handleAddNewType}
                        className='bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium'
                      >
                        Add
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setShowNewTypeInput(false);
                          setNewType('');
                        }}
                        className='bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium'
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
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

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  {parentLabel}
                </label>
                <Select
                  value={formData.projectId || 'none'}
                  onValueChange={(value) =>
                    handleSelectChange(
                      'projectId',
                      value === 'none' ? '' : value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select a ${parentLabel.toLowerCase()} (optional)`}
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                    <SelectItem value='none'>
                      No {parentLabel.toLowerCase()}
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem
                        key={project._id}
                        value={project._id}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

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
              disabled={loading}
              className='bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg flex items-center gap-2'
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
              {task ? 'Update' : 'Create'} {entityLabel}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
