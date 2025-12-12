import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Structure {
  id: string;
  name: string;
  levels: string[];
}

import { motion } from 'framer-motion';
import { Plus, FileText, Star, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import NoteModal from '../notes/NoteModal';

type Note = {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

const StructureNotesPage: React.FC = () => {
  const { structureId } = useParams();

  const userId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('auth:user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      return user?._id || null;
    } catch {
      return null;
    }
  }, []);

  const structuresKey = useMemo(
    () => (userId ? `structures:${userId}` : null),
    [userId]
  );
  const scopedKey = useMemo(
    () =>
      userId && structureId ? `scoped:${userId}:${structureId}:notes` : null,
    [userId, structureId]
  );

  const [structure, setStructure] = useState<Structure | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!structuresKey || !structureId) return;
    try {
      const raw = localStorage.getItem(structuresKey);
      const list: Structure[] = raw ? JSON.parse(raw) : [];
      const s = list.find((x) => x.id === structureId) || null;
      setStructure(s);
    } catch {}
  }, [structuresKey, structureId]);

  useEffect(() => {
    try {
      setLoading(true);
      const raw = scopedKey ? localStorage.getItem(scopedKey) : null;
      setNotes(raw ? JSON.parse(raw) : []);
    } finally {
      setLoading(false);
    }
  }, [scopedKey]);

  useEffect(() => {
    let out = [...notes];
    if (categoryFilter !== 'all')
      out = out.filter((n) => n.category === categoryFilter);
    if (showFavoritesOnly) out = out.filter((n) => n.isFavorite);
    setFilteredNotes(out);
  }, [notes, categoryFilter, showFavoritesOnly]);

  const categories = useMemo(() => {
    const set = new Set<string>([
      'Work',
      'Personal',
      'Ideas',
      'Recipes',
      'Travel',
      'Learning',
    ]);
    notes.forEach((n) => n.category && set.add(n.category));
    return Array.from(set);
  }, [notes]);

  const persist = (list: Note[]) => {
    if (!scopedKey) return;
    localStorage.setItem(scopedKey, JSON.stringify(list));
    setNotes(list);
  };

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleDelete = (note: Note) => {
    if (!window.confirm('Delete this note?')) return;
    persist(notes.filter((n) => n._id !== note._id));
  };

  const handleSave = (data: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    if (editingNote) {
      persist(
        notes.map((n) =>
          n._id === editingNote._id
            ? { ...editingNote, ...data, updatedAt: now }
            : n
        )
      );
    } else {
      persist([
        ...notes,
        {
          ...data,
          _id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as Note,
      ]);
    }
    setModalOpen(false);
  };

  const handleToggleFavorite = (note: Note) => {
    persist(
      notes.map((n) =>
        n._id === note._id
          ? {
              ...n,
              isFavorite: !n.isFavorite,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const stats = useMemo(() => {
    const totalNotes = notes.length;
    const favoriteNotes = notes.filter((n) => n.isFavorite).length;
    const categoriesCount = new Set(
      notes.map((n) => n.category).filter(Boolean)
    ).size;
    return { totalNotes, favoriteNotes, categoriesCount };
  }, [notes]);

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          <div className='flex justify-between items-center'>
            <div>
              <div className='flex items-center space-x-3 mb-2'>
                <div className='p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg'>
                  <FileText className='w-8 h-8 text-white' />
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                  {structure?.name} – Notes
                </h1>
              </div>
              <p className='text-lg text-gray-600'>
                Scoped notes for this structure only.
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200'
              size='lg'
            >
              <Plus className='w-5 h-5 mr-2' /> New Note
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className='p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100'>
                <div className='text-2xl font-bold text-amber-700'>
                  {stats.totalNotes}
                </div>
                <div className='text-sm font-medium text-amber-600'>
                  Total Notes
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className='p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-100'>
                <div className='text-2xl font-bold text-pink-700'>
                  {stats.favoriteNotes}
                </div>
                <div className='text-sm font-medium text-pink-600'>
                  Favorites
                </div>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100'>
                <div className='text-2xl font-bold text-blue-700'>
                  {stats.categoriesCount}
                </div>
                <div className='text-sm font-medium text-blue-600'>
                  Categories
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white p-6 rounded-xl shadow-sm border-2 border-amber-100'
          >
            <div className='flex flex-wrap gap-3 items-center'>
              <span className='text-sm font-semibold text-gray-700'>
                Filter:
              </span>
              <label className='text-sm font-medium text-gray-600'>
                Category:
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className='w-40 border border-amber-200 rounded px-2 py-1 text-sm'
              >
                <option value='all'>All Categories</option>
                {categories.map((c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                ))}
              </select>
              <Button
                variant={showFavoritesOnly ? 'primary' : 'outline'}
                size='sm'
                onClick={() => setShowFavoritesOnly((v) => !v)}
                className={
                  showFavoritesOnly
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'border-pink-200 text-pink-600 hover:bg-pink-50'
                }
              >
                <Star className='w-4 h-4 mr-2' /> Favorites Only
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className='min-h-[280px] flex flex-col justify-between p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 hover:border-amber-300 shadow-lg transition-all duration-300 h-full'>
                  <div>
                    <div className='flex items-start justify-between mb-4'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-bold text-gray-900 mb-2'>
                          {note.title}
                        </h3>
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'>
                          {note.category}
                        </span>
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
                    No notes yet
                  </h3>
                  <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                    Start capturing your thoughts by creating your first note.
                  </p>
                  <Button
                    onClick={handleCreate}
                    className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  >
                    <Plus className='w-4 h-4 mr-2' /> Create Your First Note
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <NoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(data: any) => handleSave(data)}
        note={editingNote as any}
        categories={categories}
      />
    </>
  );
};

export default StructureNotesPage;
