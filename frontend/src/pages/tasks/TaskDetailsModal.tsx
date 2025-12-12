import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { Task } from '../../lib/api/api';

interface TaskDetailsModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  open,
  onClose,
  task,
  onEdit,
}) => {
  if (!task) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'default';
      case 'blocked':
        return 'destructive';
      case 'not started':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold'>
              {task.name}
            </DialogTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(task)}
            >
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-6'
        >
          {/* Status and Priority */}
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700'>Status:</span>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {task.status}
              </Badge>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700'>
                Priority:
              </span>
              <Badge variant={getPriorityBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700'>Type:</span>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {task.type}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex items-center space-x-2'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-sm font-medium text-gray-700'>Start Date</p>
                <p className='text-sm text-gray-600'>
                  {task.startDate
                    ? new Date(task.startDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Clock className='w-4 h-4 text-gray-500' />
              <div>
                <p className='text-sm font-medium text-gray-700'>Due Date</p>
                <p className='text-sm text-gray-600'>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Project */}
          {task.projectId && (
            <div>
              <p className='text-sm font-medium text-gray-700 mb-1'>Project</p>
              <p className='text-sm text-gray-600'>Project {task.projectId}</p>
            </div>
          )}

          {/* Dependencies */}
          {task.dependencies && task.dependencies.length > 0 && (
            <div>
              <div className='flex items-center space-x-2 mb-2'>
                <LinkIcon className='w-4 h-4 text-gray-500' />
                <p className='text-sm font-medium text-gray-700'>
                  Dependencies
                </p>
              </div>
              <div className='space-y-1'>
                {task.dependencies.map((depId) => (
                  <div
                    key={depId}
                    className='text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded'
                  >
                    Task {depId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className='border-t pt-4'>
            <div className='grid grid-cols-2 gap-4 text-xs text-gray-500'>
              <div>
                <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p>Updated: {new Date(task.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
