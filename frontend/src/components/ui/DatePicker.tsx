import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import Button from './Button';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onDateChange(new Date(value));
    } else {
      onDateChange(undefined);
    }
  };

  return (
    <div className='relative'>
      <div className='relative'>
        <input
          type='date'
          value={date ? date.toISOString().split('T')[0] : ''}
          onChange={handleDateInputChange}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        />
        <CalendarIcon className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
      </div>
    </div>
  );
};

export default DatePicker;
