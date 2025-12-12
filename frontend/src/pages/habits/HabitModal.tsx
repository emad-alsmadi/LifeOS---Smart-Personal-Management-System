import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/textarea';
import { Habit } from '../../lib/api/api';
import Card from '../../components/ui/Card';
import { AlertTriangle } from 'lucide-react';

interface HabitModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    habit: Partial<Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>>
  ) => void;
  habit?: Habit | null;
}

const HabitModal: React.FC<HabitModalProps> = ({
  open,
  onClose,
  onSave,
  habit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'Daily',
    category: 'Other',
    completedDates: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const frequencies = ['Daily', 'Weekly', 'Monthly'];
  const DEFAULT_CATEGORIES = [
    'Health',
    'Productivity',
    'Learning',
    'Social',
    'Financial',
    'Other',
  ];
  const LOCAL_STORAGE_KEY = 'customHabitCategories';
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];
  const handleAddNewCategory = () => {
    const cat = newCategory.trim();
    if (!cat || allCategories.includes(cat)) return;
    const updated = [...customCategories, cat];
    setCustomCategories(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setFormData((prev) => ({ ...prev, category: cat }));
    setShowNewCategoryInput(false);
    setNewCategory('');
  };

  useEffect(() => {
    if (open) {
      if (habit) {
        setFormData({
          name: habit.name,
          description: habit.description || '',
          frequency: habit.frequency,
          category: allCategories.includes(habit.category)
            ? habit.category
            : 'Other',
          completedDates: habit.completedDates || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          frequency: 'Daily',
          category: 'Other',
          completedDates: [],
        });
      }
      setErrors({});
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [open, habit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
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
        description: formData.description,
        frequency: formData.frequency,
        category: formData.category,
        completedDates: formData.completedDates,
        currentStreak: 0,
        longestStreak: 0,
        isActive: true,
      });
      setAlert({
        type: 'success',
        message: habit
          ? 'Habit updated successfully!'
          : 'Habit created successfully!',
      });
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert({
        type: 'error',
        message: 'Failed to save habit. Please try again.',
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));

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

  const getCompletionRate = (habit: Habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0;
    const startDate = new Date(habit.createdAt);
    const today = new Date();
    const daysDiff =
      Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Only count unique dates between startDate and today
    const validDates = new Set(
      habit.completedDates.filter((dateStr) => {
        const date = new Date(dateStr);
        return date >= startDate && date <= today;
      })
    );

    return Math.min(
      100,
      Math.round((validDates.size / Math.max(daysDiff, 1)) * 100)
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {habit
              ? 'Update your habit details below.'
              : 'Fill out the form to create a new habit.'}
          </DialogDescription>
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
                Habit Details
              </h2>
              <p className='text-sm text-gray-500 mb-2'>
                Fill in the details for your new habit.
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
                  placeholder='Enter habit name'
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

              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Description
                </label>
                <Textarea
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Describe your habit (optional)'
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Frequency
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(value) =>
                  handleSelectChange('frequency', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select frequency' />
                </SelectTrigger>
                <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                  {frequencies.map((frequency) => (
                    <SelectItem
                      key={frequency}
                      value={frequency}
                    >
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 relative'>
              <label className='block text-sm font-medium text-gray-700'>
                Category
              </label>
              <div className='relative w-full max-w-full'>
                {!showNewCategoryInput ? (
                  <>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => {
                        if (value === '__add_new__') {
                          setShowNewCategoryInput(true);
                        } else {
                          setFormData((prev) => ({ ...prev, category: value }));
                          setShowNewCategoryInput(false);
                        }
                      }}
                    >
                      <SelectTrigger
                        className={
                          errors.category
                            ? 'border-red-300'
                            : 'border-blue-200 focus:border-blue-500 bg-white'
                        }
                      >
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <div className='absolute left-0 top-full w-full z-50 max-h-60 overflow-y-auto bg-white border border-blue-200 rounded-md shadow-lg mt-1'>
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
                            value='__add_new__'
                            className='text-blue-600 font-medium'
                          >
                            + Add New Category
                          </SelectItem>
                        </SelectContent>
                      </div>
                    </Select>
                  </>
                ) : (
                  <div className='block w-full mt-2 flex flex-col sm:flex-row items-center gap-2 bg-white border border-blue-100 rounded-md shadow p-2 transition-all duration-200'>
                    <input
                      name='category'
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder='Enter new category'
                      className='flex-1 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 px-2 py-1 text-sm text-gray-800 placeholder-gray-400 transition-all outline-none bg-white min-w-0'
                      autoFocus
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
              {errors.category && (
                <p className='text-sm text-red-600'>{errors.category}</p>
              )}
            </div>
          </div>

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
              loading={loading}
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
              {habit ? 'Update' : 'Create'} Habit
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitModal;
