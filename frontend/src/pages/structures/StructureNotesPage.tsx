import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Tag, Star, BookOpen } from 'lucide-react';
import NoteModal from '../notes/NoteModal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleNoteFavorite,
  Note,
} from '../../lib/api/api';

const StructureNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Work',
    'Personal',
    'Ideas',
    'Recipes',
    'Travel',
    'Learning',
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, categoryFilter, showFavoritesOnly]);

  const loadData = async () => {
    try {
      setLoading(true);
      const notesData = await getNotes();
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((note) => note.category === categoryFilter);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((note) => note.isFavorite);
    }

    setFilteredNotes(filtered);
  };

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleDelete = async (note: Note) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(note._id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const handleSave = async (
    noteData: Omit<Note, '_id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingNote) {
        await updateNote(editingNote._id, noteData);
      } else {
        await createNote(noteData);
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      await toggleNoteFavorite(note._id);
      await loadData();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getNotesStats = () => {
    const totalNotes = notes.length;
    const favoriteNotes = notes.filter((n) => n.isFavorite).length;
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = notes.filter((n) => n.category === category).length;
      return acc;
    }, {} as Record<string, number>);

    return { totalNotes, favoriteNotes, categoryCounts };
  };

  const stats = getNotesStats();

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          {/* Header */}
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg'>
                  <FileText className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                  Notes
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Capture and organize your thoughts, ideas, and important
                information.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' />
              New Note
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className='p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg'>
                    <FileText className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-amber-700'>
                      {stats.totalNotes}
                    </p>
                    <p className='text-sm font-medium text-amber-600'>
                      Total Notes
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className='p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg'>
                    <Star className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-pink-700'>
                      {stats.favoriteNotes}
                    </p>
                    <p className='text-sm font-medium text-pink-600'>
                      Favorites
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg'>
                    <BookOpen className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-700'>
                      {categories.length}
                    </p>
                    <p className='text-sm font-medium text-blue-600'>
                      Categories
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100 hover:shadow-lg transition-shadow'>
                <div className='flex items-center space-x-3'>
                  <div className='p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg'>
                    <Tag className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-green-700'>
                      {[...new Set(notes.flatMap((n) => n.tags))].length}
                    </p>
                    <p className='text-sm font-medium text-green-600'>
                      Unique Tags
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='bg-white p-6 rounded-xl shadow-sm border-2 border-amber-100'
          >
            <div className='flex flex-wrap gap-4 items-center'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-semibold text-gray-700'>
                  Filter:
                </span>
              </div>

              <div className='flex items-center space-x-2'>
                <label className='text-sm font-medium text-gray-600'>
                  Category:
                </label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className='w-40 border-amber-200 focus:border-amber-500'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white border border-gray-200 shadow-lg z-50'>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={showFavoritesOnly ? 'primary' : 'outline'}
                size='sm'
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={
                  showFavoritesOnly
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                }
              >
                <Star className='w-4 h-4 mr-2' />
                Favorites Only
              </Button>

              {(categoryFilter !== 'all' || showFavoritesOnly) && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setCategoryFilter('all');
                    setShowFavoritesOnly(false);
                  }}
                  className='border-amber-200 text-amber-600 hover:bg-amber-50'
                >
                  Clear All
                </Button>
              )}
            </div>
          </motion.div>

          {/* Notes Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className='min-h-[320px] flex flex-col justify-between p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 hover:border-amber-300 shadow-lg transition-all duration-300 h-full'>
                  <div>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>
                          {note.title}
                        </h3>
                        <Badge
                          variant='outline'
                          className='text-xs border-amber-200 text-amber-700'
                        >
                          {note.category}
                        </Badge>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(note)}
                        className={`p-1 rounded-full transition-colors ${
                          note.isFavorite
                            ? 'text-pink-500 hover:text-pink-600'
                            : 'text-gray-400 hover:text-pink-500'
                        }`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            note.isFavorite ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                    </div>
                    <p className='text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed'>
                      {note.content}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className='flex flex-wrap gap-1 mb-4'>
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                          >
                            <Tag className='w-3 h-3 mr-1' />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center justify-between pt-4 border-t border-amber-100 mt-auto'>
                    <span className='text-xs text-gray-500'>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <div className='flex space-x-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(note)}
                        className='text-amber-600 hover:text-amber-700 hover:bg-amber-100'
                      >
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(note)}
                        className='text-red-500 hover:text-red-700 hover:bg-red-100'
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Empty State */}
            {filteredNotes.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='col-span-full'
              >
                <Card className='p-12 text-center bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100'>
                  <div className='p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center'>
                    <FileText className='w-8 h-8 text-amber-600' />
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>
                    {categoryFilter !== 'all' || showFavoritesOnly
                      ? 'No notes match your filters'
                      : 'No notes yet'}
                  </h3>
                  <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                    {categoryFilter !== 'all' || showFavoritesOnly
                      ? "Try adjusting your filters to find what you're looking for."
                      : 'Start capturing your thoughts and ideas by creating your first note.'}
                  </p>
                  <Button
                    onClick={handleCreate}
                    className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Create Your First Note
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <NoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave as any}
        note={editingNote as any}
        categories={categories}
      />
    </>
  );
};

export default StructureNotesPage;
