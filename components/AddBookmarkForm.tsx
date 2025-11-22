'use client';

import { useState, useEffect } from 'react';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  tags: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

interface AddBookmarkFormProps {
  onSubmit: (data: {
    url: string;
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
    categories: string[];
  }) => void;
  editingBookmark?: Bookmark | null;
  onCancelEdit?: () => void;
}

export default function AddBookmarkForm({
  onSubmit,
  editingBookmark,
  onCancelEdit,
}: AddBookmarkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description || '');
      setIsPublic(editingBookmark.isPublic);
      setTags(editingBookmark.tags.map((t) => t.name).join(', '));
      setCategories(editingBookmark.categories.map((c) => c.name).join(', '));
      setShowForm(true);
    }
  }, [editingBookmark]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      url,
      title,
      description,
      isPublic,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      categories: categories.split(',').map((c) => c.trim()).filter(Boolean),
    });
    setUrl('');
    setTitle('');
    setDescription('');
    setIsPublic(true);
    setTags('');
    setCategories('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setIsPublic(true);
    setTags('');
    setCategories('');
    setShowForm(false);
    if (onCancelEdit) onCancelEdit();
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-delicious-blue text-white py-3 px-4 rounded-lg hover:bg-delicious-darkblue transition font-semibold"
      >
        + Add New Bookmark
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-delicious-darkblue mb-4">
        {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-1">
            URL *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-delicious-blue"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-delicious-blue"
            placeholder="My Awesome Link"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-delicious-blue"
            placeholder="Optional description..."
          />
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-semibold text-gray-700 mb-1">
            Categories (comma-separated)
          </label>
          <input
            type="text"
            id="categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-delicious-blue"
            placeholder="coding, tutorials"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-delicious-blue"
            placeholder="javascript, react, nextjs"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-delicious-blue focus:ring-delicious-blue border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
            Public bookmark
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-delicious-blue text-white py-2 px-4 rounded hover:bg-delicious-darkblue transition font-semibold"
          >
            {editingBookmark ? 'Update Bookmark' : 'Add Bookmark'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
