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
import Card from '../../components/ui/Card';
import {
  Goal,
  GoalCreate,
  getObjectives,
  createObjective,
  Objective,
} from '../../lib/api/api';

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (goal: GoalCreate & { selectedObjectiveIds?: string[] }) => void;
  goal?: Goal | null;
  labels?: {
    entity?: string;
    entityPlural?: string;
    child?: string;
    childPlural?: string;
  };
}

interface ObjectiveFormData {
  title: string;
}

const GoalModal: React.FC<GoalModalProps> = ({
  open,
  onClose,
  onSave,
  goal,
  labels,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'Active' as Goal['status'],
    category: '',
    relatedObjectives: [] as string[],
  });
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<string[]>(
    []
  );
  const [showNewObjectiveForm, setShowNewObjectiveForm] = useState(false);
  const [newObjectiveForm, setNewObjectiveForm] = useState<ObjectiveFormData>({
    title: '',
  });
  const [newObjectiveErrors, setNewObjectiveErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const entityLabel = labels?.entity || 'Goal';
  const entityLabelPlural = labels?.entityPlural || `${entityLabel}s`;
  const childLabel = labels?.child || 'Objective';
  const childLabelPlural = labels?.childPlural || `${childLabel}s`;

  // Only use custom categories - no predefined ones
  const allCategories = [...customCategories];

  useEffect(() => {
    if (open) {
      loadData();
      if (goal) {
        setFormData({
          name: goal.name,
          status: goal.status,
          category: goal.category,
          relatedObjectives: Array.isArray(goal.objectives)
            ? goal.objectives.map((obj: { _id: string } | string) =>
                typeof obj === 'string' ? obj : obj._id
              )
            : [],
        });
        // If goal has a category, add it to custom categories
        if (goal.category && !customCategories.includes(goal.category)) {
          setCustomCategories((prev) =>
            prev.includes(goal.category) ? prev : [...prev, goal.category]
          );
        }
      } else {
        setFormData({
          name: '',
          status: 'Active',
          category: '',
          relatedObjectives: [],
        });
      }
      setErrors({});
      setNewObjectiveErrors({});
      setShowNewObjectiveForm(false);
      setNewObjectiveForm({
        title: '',
      });
      setSelectedObjectiveIds([]);
      setShowNewCategoryInput(false);
      setNewCategory('');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, goal]);

  useEffect(() => {
    if (showNewCategoryInput && newCategoryInputRef.current) {
      newCategoryInputRef.current.focus();
    }
  }, [showNewCategoryInput]);

  const loadData = async () => {
    try {
      const objectivesData = await getObjectives();
      setObjectives(objectivesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleAddNewObjective = async () => {
    if (!newObjectiveForm.title.trim()) {
      setNewObjectiveErrors({ title: 'Objective title is required' });
      return;
    }

    try {
      const newObjective = await createObjective({
        title: newObjectiveForm.title,
        status: 'Active',
        priority: 'Medium',
        relatedGoals: [],
        relatedProjects: [],
      });

      setObjectives((prev) => [...prev, newObjective]);
      setSelectedObjectiveIds((prev) => [...prev, newObjective._id]);
      setNewObjectiveForm({
        title: '',
      });
      setShowNewObjectiveForm(false);
      setNewObjectiveErrors({});
      setAlert({ type: 'success', message: 'Objective created successfully!' });
      setTimeout(() => setAlert(null), 2000);
    } catch (error) {
      console.error('Failed to create objective:', error);
      setAlert({
        type: 'error',
        message: 'Failed to create objective. Please try again.',
      });
    }
  };

  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;

    const trimmedCategory = newCategory.trim();
    if (!allCategories.includes(trimmedCategory)) {
      setCustomCategories((prev) => [...prev, trimmedCategory]);
      setFormData((prev) => ({ ...prev, category: trimmedCategory }));
    }
    setNewCategory('');
    setShowNewCategoryInput(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
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
        category: formData.category,
        objectives: formData.relatedObjectives,
        selectedObjectiveIds: selectedObjectiveIds, // Include selected objectives
      });
      setAlert({
        type: 'success',
        message: goal
          ? 'Goal updated successfully!'
          : 'Goal created successfully!',
      });
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to save goal. Please try again.',
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
    if (value === 'add-new-category') {
      setShowNewCategoryInput(true);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleObjectiveSelection = (objectiveId: string) => {
    setSelectedObjectiveIds((prev) =>
      prev.includes(objectiveId)
        ? prev.filter((id) => id !== objectiveId)
        : [...prev, objectiveId]
    );
  };

  const validateNewObjective = () => {
    const errors: Record<string, string> = {};
    if (!newObjectiveForm.title.trim()) {
      errors.title = 'Objective title is required';
    }
    if (newObjectiveForm.title.length > 100) {
      errors.title = 'Objective title must be less than 100 characters';
    }
    setNewObjectiveErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewObjectiveInputChange = (
    field: keyof ObjectiveFormData,
    value: any
  ) => {
    setNewObjectiveForm((prev) => ({ ...prev, [field]: value }));
    if (newObjectiveErrors[field]) {
      setNewObjectiveErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleObjectiveToggle = (objectiveId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedObjectives: prev.relatedObjectives.includes(objectiveId)
        ? prev.relatedObjectives.filter((id) => id !== objectiveId)
        : [...prev.relatedObjectives, objectiveId],
    }));
  };

  const removeObjective = (objectiveId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedObjectives: prev.relatedObjectives.filter(
        (id) => id !== objectiveId
      ),
    }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent
        dir='auto'
        className='sm:max-w-[600px] bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 shadow-xl overflow-y-auto max-h-[90vh] relative'
      >
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
            {goal ? `Edit ${entityLabel}` : `Create New ${entityLabel}`}
          </DialogTitle>
        </DialogHeader>
        {/* Alert for success/failure */}
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
                  {entityLabel} Name
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
                  <label className='block text-sm font-semibold text-gray-700'>
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange('status', value)
                    }
                  >
                    <SelectTrigger className='border-blue-200 focus:border-blue-500 bg-white'>
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
                <div className='space-y-2 relative'>
                  <label className='block text-sm font-semibold text-gray-700'>
                    Category
                  </label>
                  <div className='relative w-full max-w-full'>
                    {!showNewCategoryInput ? (
                      <>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => {
                            if (value === 'add-new-category') {
                              setShowNewCategoryInput(true);
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                category: value,
                              }));
                              setShowNewCategoryInput(false);
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`border-blue-200 focus:border-blue-500 bg-white ${
                              errors.category ? 'border-red-300' : ''
                            }`}
                          >
                            <SelectValue placeholder='Select category' />
                          </SelectTrigger>
                          <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                            {allCategories.length === 0 ? (
                              <div className='px-3 py-2 text-sm text-gray-500'>
                                No categories yet. Click "+ Add New Category" to
                                create one.
                              </div>
                            ) : (
                              allCategories.map((category) => (
                                <SelectItem
                                  key={category}
                                  value={category}
                                >
                                  {category}
                                </SelectItem>
                              ))
                            )}
                            <SelectItem
                              value='add-new-category'
                              className='text-blue-600 font-medium'
                            >
                              + Add New Category
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <div className='block w-full mt-2 flex flex-col sm:flex-row items-center gap-2 bg-white border border-blue-100 rounded-md shadow p-2 transition-all duration-200'>
                        <input
                          name='category'
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder='Enter new'
                          className='flex-1 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 px-2 py-1 text-sm text-gray-800 placeholder-gray-400 transition-all outline-none bg-white min-w-0'
                          ref={newCategoryInputRef}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewCategory();
                            }
                          }}
                        />
                        <button
                          type='button'
                          disabled={!newCategory.trim()}
                          onClick={handleAddNewCategory}
                          className='bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-sm hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed'
                        >
                          Add
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            setShowNewCategoryInput(false);
                            setNewCategory('');
                          }}
                          className='bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200 transition border border-gray-200'
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 mt-1'>
                    Categories help you organize your{' '}
                    {entityLabelPlural.toLowerCase()}.
                  </p>
                  {errors.category && (
                    <div className='flex items-center gap-1 mt-1 text-red-600 text-sm'>
                      <AlertTriangle className='w-4 h-4' />
                      {errors.category}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className='p-5 border-purple-100'>
            <div className='mb-4'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-bold text-purple-700'>
                  Associate {childLabelPlural}
                </h2>
                <button
                  type='button'
                  onClick={() => setShowNewObjectiveForm(!showNewObjectiveForm)}
                  className='flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors'
                >
                  {showNewObjectiveForm ? (
                    <ChevronUp className='w-4 h-4' />
                  ) : (
                    <ChevronDown className='w-4 h-4' />
                  )}
                  {showNewObjectiveForm ? 'Hide' : `Add New ${childLabel}`}
                </button>
              </div>
              <p className='text-sm text-gray-500'>
                Select existing {childLabelPlural.toLowerCase()} or create new
                ones to associate with this {entityLabel.toLowerCase()}.
              </p>
            </div>

            {showNewObjectiveForm && (
              <div className='mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200'>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {childLabel} Title *
                    </label>
                    <input
                      type='text'
                      value={newObjectiveForm.title}
                      onChange={(e) =>
                        handleNewObjectiveInputChange('title', e.target.value)
                      }
                      placeholder={`Enter ${childLabel.toLowerCase()} title`}
                      className='w-full px-3 py-2 border rounded-lg transition-all duration-200 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    />
                    {newObjectiveErrors.title && (
                      <p className='text-sm text-red-600 mt-1'>
                        {newObjectiveErrors.title}
                      </p>
                    )}
                  </div>

                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      onClick={handleAddNewObjective}
                      className='bg-purple-600 hover:bg-purple-700 text-white'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      {`Create ${childLabel}`}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-3'>
              <label className='block text-sm font-medium text-gray-700'>
                {`Select Existing ${childLabelPlural}`}
              </label>
              <div className='max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2'>
                {objectives.length === 0 ? (
                  <div className='text-sm text-gray-500 text-center py-4'>
                    {`No ${childLabelPlural.toLowerCase()} available.`}
                  </div>
                ) : (
                  objectives.map((objective) => (
                    <label
                      key={objective._id}
                      className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={selectedObjectiveIds.includes(objective._id)}
                        onChange={() => handleObjectiveSelection(objective._id)}
                        className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                      />
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {objective.title}
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              objective.priority === 'High'
                                ? 'bg-red-100 text-red-800'
                                : objective.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {objective.priority}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              objective.status === 'Completed'
                                ? 'bg-green-100 text-green-700'
                                : objective.status === 'Active'
                                ? 'bg-blue-100 text-blue-700'
                                : objective.status === 'Next'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {objective.status}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedObjectiveIds.length > 0 && (
                <div className='text-sm text-gray-600 bg-purple-50 p-2 rounded'>
                  {`Selected ${
                    selectedObjectiveIds.length
                  } ${childLabelPlural.toLowerCase()} to associate with this ${entityLabel.toLowerCase()}`}
                </div>
              )}
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
              {loading
                ? goal
                  ? 'Updating...'
                  : 'Creating...'
                : goal
                ? 'Update'
                : 'Create'}{' '}
              {entityLabel}
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalModal;
