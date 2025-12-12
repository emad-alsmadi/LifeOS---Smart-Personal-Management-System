import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
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
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/textarea';
import { Event, Task } from '../../lib/api/api';

interface CalendarEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    event: Omit<Event, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => void;
  onDelete?: () => void;
  event?: Event | null;
  selectedDate: Date | null;
  tasks: Task[];
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
  tasks,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Event' as Event['type'],
    startDate: '',
    endDate: '',
    allDay: false,
    description: '',
    priority: 'Medium' as Event['priority'],
    status: 'Scheduled' as Event['status'],
    color: '#3B82F6',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (event) {
        setFormData({
          title: event.title,
          type: event.type,
          startDate: event.startDate.split('T')[0],
          endDate: event.endDate.split('T')[0],
          allDay: event.allDay,
          description: event.description || '',
          priority: event.priority,
          status: event.status,
          color: event.color,
        });
      } else if (selectedDate) {
        setFormData({
          title: '',
          type: 'Event',
          startDate: selectedDate.toISOString().split('T')[0],
          endDate: selectedDate.toISOString().split('T')[0],
          allDay: false,
          description: '',
          priority: 'Medium',
          status: 'Scheduled',
          color: '#3B82F6',
        });
      }
      setErrors({});
    }
  }, [open, event, selectedDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toISODate = (dateStr: string, endOfDay = false) => {
    if (!dateStr) return '';

    // Create a date object from the input string (which should be in YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);

    // Create date in local timezone
    const d = new Date(year, month - 1, day); // month is 0-indexed

    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    // Get timezone offset in minutes and convert to milliseconds
    const timezoneOffset = d.getTimezoneOffset() * 60000;

    // Adjust the date by the timezone offset to ensure it stays in local time
    const adjustedDate = new Date(d.getTime() - timezoneOffset);

    return adjustedDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const startDateISO = toISODate(formData.startDate);
      const endDateISO = toISODate(formData.endDate, true);

      console.log('Creating event with dates:', {
        originalStartDate: formData.startDate,
        originalEndDate: formData.endDate,
        startDateISO,
        endDateISO,
      });

      await onSave({
        title: formData.title,
        type: formData.type,
        startDate: startDateISO,
        endDate: endDateISO,
        allDay: formData.allDay,
        description: formData.description || '',
        priority: formData.priority,
        status: formData.status,
        color: formData.color,
      });
    } catch (error) {
      console.error('Failed to save event:', error);
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

  const handleTypeChange = (type: 'task' | 'event') => {
    setFormData((prev) => ({
      ...prev,
      type,
      taskId: type === 'event' ? '' : prev.taskId,
    }));
    if (errors.taskId) {
      setErrors((prev) => ({ ...prev, taskId: '' }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle>
              {event ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
            {event && onDelete && (
              <Button
                variant='outline'
                size='sm'
                onClick={onDelete}
                className='text-red-600 hover:text-red-700'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            )}
          </div>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <Input
            label='Title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            placeholder='Enter event title'
          />

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Type
              </label>
              <Select
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                  <SelectItem value='event'>Event</SelectItem>
                  <SelectItem value='task'>Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Date
              </label>
              <Input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleInputChange}
                error={errors.date}
              />
            </div>
          </div>

          {formData.type === 'task' && (
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Task
              </label>
              <Select
                value={formData.taskId}
                onValueChange={(value) => handleSelectChange('taskId', value)}
              >
                <SelectTrigger
                  className={errors.taskId ? 'border-red-300' : ''}
                >
                  <SelectValue placeholder='Select a task' />
                </SelectTrigger>
                <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                  {tasks.map((task) => (
                    <SelectItem
                      key={task.id}
                      value={task.id}
                    >
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskId && (
                <p className='text-sm text-red-600'>{errors.taskId}</p>
              )}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Start Time'
              type='time'
              name='startTime'
              value={formData.startTime}
              onChange={handleInputChange}
            />

            <div>
              <Input
                label='End Time'
                type='time'
                name='endTime'
                value={formData.endTime}
                onChange={handleInputChange}
                error={errors.endTime}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Description
            </label>
            <Textarea
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Enter event description (optional)'
              rows={3}
            />
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              loading={loading}
            >
              {event ? 'Update' : 'Create'} Event
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventModal;
