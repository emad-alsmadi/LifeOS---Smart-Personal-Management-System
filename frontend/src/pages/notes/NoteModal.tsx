import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Tag, AlertTriangle } from 'lucide-react';
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
import Card from '../../components/ui/Card';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  note?: Note | null;
  categories: string[];
}

const NoteModal: React.FC<NoteModalProps> = ({
  open,
  onClose,
  onSave,
  note,
  categories,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    isFavorite: false,
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [allCategories, setAllCategories] = useState<string[]>(categories || []);

  useEffect(() => {
    setAllCategories(categories || []);
  }, [categories]);

  useEffect(() => {
    if (open) {
      if (note) {
        setFormData({
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          isFavorite: note.isFavorite,
        });
      } else {
        setFormData({
          title: '',
          content: '',
          category: '',
          tags: [],
          isFavorite: false,
        });
      }
      setErrors({});
      setNewTag('');
      setShowNewTagInput(false);
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open, note]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);
    try {
      await onSave(formData);
      setAlert({ type: 'success', message: note ? 'Note updated successfully!' : 'Note created successfully!' });
      setTimeout(() => setAlert(null), 2000);
    } catch {
      setAlert({ type: 'error', message: 'Failed to save note. Please try again.' });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setShowNewTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-amber-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {note ? 'Edit Note' : 'Create New Note'}
          </DialogTitle>
        </DialogHeader>
        {alert && (
          <div className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-md text-sm font-medium ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
            {alert.message}
          </div>
        )}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Card className="p-5 border-amber-100">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-amber-700 mb-1">Note Details</h2>
              <p className="text-sm text-gray-500 mb-2">Fill in the details for your new note.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter note title"
                  className="w-full px-3 py-2.5 border rounded-lg transition-all duration-200 border-amber-200 focus:border-amber-500"
                  ref={titleInputRef}
                />
                {errors.title && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Content
                </label>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your note content here..."
                  rows={8}
                  className={`border-amber-200 focus:border-amber-500 ${errors.content ? 'border-red-300' : ''}`}
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category
                </label>
                {!showNewCategoryInput ? (
                <Select 
                  value={formData.category} 
                    onValueChange={(value) => {
                      if (value === '__add_new__') {
                        setShowNewCategoryInput(true);
                      } else {
                        handleSelectChange('category', value);
                      }
                    }}
                >
                  <SelectTrigger className={`border-amber-200 focus:border-amber-500 ${errors.category ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                      <SelectItem value="__add_new__" className="text-amber-600 font-medium">
                        + Add New Category
                      </SelectItem>
                  </SelectContent>
                </Select>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1 rounded-md border border-amber-200 px-2 py-1 text-sm"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newCategory.trim()) {
                          setAllCategories(prev => [...prev, newCategory.trim()]);
                          setFormData(prev => ({ ...prev, category: newCategory.trim() }));
                          setShowNewCategoryInput(false);
                          setNewCategory('');
                        } else if (e.key === 'Escape') {
                          setShowNewCategoryInput(false);
                          setNewCategory('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      disabled={!newCategory.trim()}
                      onClick={() => {
                        if (!newCategory.trim()) return;
                        setAllCategories(prev => [...prev, newCategory.trim()]);
                        setFormData(prev => ({ ...prev, category: newCategory.trim() }));
                        setShowNewCategoryInput(false);
                        setNewCategory('');
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-600"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategory('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tags
                </label>
                {/* New Tag Button */}
                <div className="mb-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    onClick={() => setShowNewTagInput((prev: boolean) => !prev)}
                  >
                    New Tag
                  </Button>
                </div>
                {showNewTagInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex space-x-2 p-3 bg-amber-100 rounded-lg border border-amber-200 mb-2"
                  >
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-amber-200 focus:border-amber-500"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                      Add
                  </Button>
                  </motion.div>
                )}
                {/* Tag list display remains unchanged */}
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isFavorite" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Mark as favorite
                </label>
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-3 pt-6 border-t border-amber-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg flex items-center gap-2"
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              {note ? 'Update' : 'Create'} Note
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default NoteModal;