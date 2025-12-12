import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Calendar } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Task } from '../../lib/api/api';

interface TaskCalendarModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  date: Date | null;
}

const TaskCalendarModal: React.FC<TaskCalendarModalProps> = ({
  open,
  onClose,
  task,
  date,
}) => {
  if (!task || !date) return null;

  // Generate a simple calendar for the month of the due date
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dueDay = date.getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='max-w-sm p-0 rounded-3xl overflow-hidden border-0 shadow-2xl bg-white'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-5 flex items-center gap-3'>
          <div className='p-3 bg-white/20 rounded-xl flex items-center justify-center'>
            <Calendar className='w-7 h-7 text-white' />
          </div>
          <div>
            <DialogTitle className='text-xl font-extrabold text-white tracking-tight mb-0'>
              Task Due Date
            </DialogTitle>
            <div className='text-sm text-indigo-100 font-medium'>
              {date.toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
        {/* Task Info */}
        <div className='px-6 pt-5 pb-2'>
          <div className='mb-4'>
            <div className='text-lg font-bold text-indigo-800 truncate mb-1'>
              {task.name}
            </div>
            <div className='inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow-sm'>
              Due: {date.toLocaleDateString()}
            </div>
          </div>
          {/* Calendar */}
          <div className='bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-inner p-4 mt-2'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-base font-semibold text-indigo-700'>
                {date.toLocaleString('default', { month: 'long' })} {year}
              </span>
            </div>
            <div className='grid grid-cols-7 gap-1 text-xs text-center'>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                <span
                  key={d}
                  className='font-semibold text-indigo-300'
                >
                  {d}
                </span>
              ))}
              {weeks.flat().map((day, idx) =>
                day ? (
                  <span
                    key={idx}
                    className={`transition rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm font-semibold cursor-default ${
                      day === dueDay
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-110'
                        : 'text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {day}
                  </span>
                ) : (
                  <span key={idx}></span>
                )
              )}
            </div>
          </div>
        </div>
        <DialogFooter className='flex justify-end px-6 pb-4 pt-2'>
          <Button
            variant='outline'
            onClick={onClose}
            className='border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold'
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCalendarModal;
