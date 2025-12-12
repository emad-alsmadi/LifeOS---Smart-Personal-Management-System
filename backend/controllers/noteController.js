const Note = require('../models/Note');

// Get all notes for a user
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.userId })
      .sort({ updatedAt: -1 });
    
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// Get single note by ID
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Create new note
exports.createNote = async (req, res, next) => {
  try {
    const { 
      title, 
      content, 
      category, 
      tags, 
      isFavorite, 
      isPinned, 
      color
    } = req.body;
    
    const note = new Note({
      userId: req.userId,
      title,
      content,
      category,
      tags,
      isFavorite,
      isPinned,
      color
    });
    
    const savedNote = await note.save();
    
    res.status(201).json(savedNote);
  } catch (error) {
    next(error);
  }
};

// Update note
exports.updateNote = async (req, res, next) => {
  try {
    const { 
      title, 
      content, 
      category, 
      tags, 
      isFavorite, 
      isPinned, 
      color
    } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        title,
        content,
        category,
        tags,
        isFavorite,
        isPinned,
        color
      },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Delete note
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }
    
    note.isFavorite = !note.isFavorite;
    await note.save();
    
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Toggle pinned status
exports.togglePinned = async (req, res, next) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });
    
    if (!note) {
      const error = new Error('Note not found');
      error.statusCode = 404;
      throw error;
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Get notes by category
exports.getNotesByCategory = async (req, res, next) => {
  try {
    const notes = await Note.find({ 
      userId: req.userId, 
      category: req.params.category 
    })
    .sort({ updatedAt: -1 });
    
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// Search notes
exports.searchNotes = async (req, res, next) => {
  try {
    const { query } = req.query;
    
    const notes = await Note.find({
      userId: req.userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .sort({ updatedAt: -1 });
    
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}; 