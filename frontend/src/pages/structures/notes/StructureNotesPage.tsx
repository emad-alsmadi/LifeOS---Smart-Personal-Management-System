import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NoteModal from '../../notes/NoteModal';
import NotesView from '../../../components/features/notes/NotesView';
import {
  getStructureNotes,
  createStructureNote,
  updateStructureNote,
  deleteStructureNote,
  toggleStructureNoteFavorite,
  Note,
} from '../../../lib/api/api';

const StructureNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const { structureId } = useParams();

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
  }, [structureId]);

  useEffect(() => {
    filterNotes();
  }, [notes, categoryFilter, showFavoritesOnly]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!structureId) {
        setNotes([]);
      } else {
        const notesData = await getStructureNotes(structureId);
        setNotes(notesData);
      }
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
        if (!structureId) return;
        await deleteStructureNote(structureId, note._id);
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
      if (!structureId) return;
      if (editingNote) {
        await updateStructureNote(structureId, editingNote._id, noteData);
      } else {
        await createStructureNote(structureId, noteData);
      }
      setModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleToggleFavorite = async (note: Note) => {
    try {
      if (!structureId) return;
      await toggleStructureNoteFavorite(structureId, note._id);
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
      <NotesView
        notes={notes}
        filteredNotes={filteredNotes}
        categories={categories}
        categoryFilter={categoryFilter}
        showFavoritesOnly={showFavoritesOnly}
        stats={stats}
        loading={loading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onChangeCategoryFilter={setCategoryFilter}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((v) => !v)}
        onClearFilters={() => {
          setCategoryFilter('all');
          setShowFavoritesOnly(false);
        }}
      />

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
