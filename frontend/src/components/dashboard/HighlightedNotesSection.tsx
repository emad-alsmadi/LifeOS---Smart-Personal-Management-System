import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { Star, StickyNote, ArrowRight } from 'lucide-react';
import type { Note } from '../../lib/api/api';

interface Props {
  notes: Note[];
  onNoteClick: (note: Note) => void;
  viewAllHref?: string;
}

const HighlightedNotesSection: React.FC<Props> = ({
  notes,
  onNoteClick,
  viewAllHref = '/notes',
}) => {
  return (
    <Card className='p-4 bg-white border border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center space-x-2'>
          <div className='p-1.5 bg-amber-500 rounded-lg'>
            <Star className='w-4 h-4 text-white' />
          </div>
          <h2 className='text-lg font-bold text-gray-900'>Highlighted Notes</h2>
        </div>
        <Link
          to={viewAllHref}
          className='text-amber-600 hover:text-amber-700 font-medium text-sm'
        >
          View All
        </Link>
      </div>

      <div className='space-y-2'>
        {notes.slice(0, 3).map((note) => (
          <motion.div
            key={note._id}
            className='p-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-pointer group'
            onClick={() => onNoteClick(note)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className='flex items-center justify-between mb-2'>
              <div className='p-1 bg-amber-100 rounded group-hover:bg-amber-200 transition-colors duration-300'>
                <StickyNote className='w-4 h-4 text-amber-600' />
              </div>
              {note.category && (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200'>
                  {note.category}
                </span>
              )}
              <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <ArrowRight className='w-4 h-4 text-amber-500' />
              </div>
            </div>
            <div className='font-medium text-gray-900 mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors duration-300'>
              {note.title}
            </div>
            <div className='text-sm text-gray-600 line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors duration-300'>
              {note.content}
            </div>
            <div className='text-xs text-gray-500 group-hover:text-amber-500 transition-colors duration-300'>
              📅 {new Date(note.createdAt).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

export default HighlightedNotesSection;
