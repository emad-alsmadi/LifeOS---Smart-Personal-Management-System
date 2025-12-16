import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { Calendar, ArrowRight } from 'lucide-react';
import type { Event } from '../../lib/api/api';

interface Props {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const UpcomingEventsSection: React.FC<Props> = ({ events, onEventClick }) => {
  return (
    <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
      <div className='flex items-center space-x-2 mb-3'>
        <div className='p-1.5 bg-purple-500 rounded-lg'>
          <Calendar className='w-4 h-4 text-white' />
        </div>
        <h2 className='text-lg font-bold text-gray-900'>Upcoming Events</h2>
      </div>

      <div className='space-y-2'>
        {events.slice(0, 3).map((event) => (
          <motion.div
            key={event._id}
            className='flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-purple-50 hover:shadow-md transition-all duration-300 cursor-pointer group'
            onClick={() => onEventClick(event)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className='p-1 bg-purple-100 rounded group-hover:bg-purple-200 transition-colors duration-300'>
              <Calendar className='w-4 h-4 text-purple-600' />
            </div>
            <div className='flex-1'>
              <div className='font-medium text-gray-900 group-hover:text-purple-700 transition-colors duration-300'>
                {event.title}
              </div>
              <div className='text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-300'>
                {new Date(event.startDate).toLocaleDateString()} at{' '}
                {new Date(event.startDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <ArrowRight className='w-4 h-4 text-purple-500' />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default UpcomingEventsSection;
