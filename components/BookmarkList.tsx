import React, { useState } from 'react';
import { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onEdit: (id: string, title: string, tags: string[]) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onTagClick, onDelete, onToggleRead, onEdit }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditTitle(bm.title);
    setEditTags(bm.tags.join(' '));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditTags('');
    setIsSaving(false);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    const tags = editTags
      .toLowerCase()
      .split(/\s+/)
      .map(t => t.trim())
      .filter(Boolean);
    try {
      await onEdit(id, editTitle.trim(), tags);
      cancelEdit();
    } catch {
      setIsSaving(false);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="text-center p-10 text-gray-400">
        No bookmarks found.
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {bookmarks.map((bm) => (
        <li key={bm.id} className="group">
          <div className="flex items-baseline gap-2 mb-1">
            <a 
              href={bm.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`text-lg leading-tight visited:text-purple-800 hover:underline hover:bg-blue-50 ${bm.isRead ? 'text-gray-500 font-normal' : 'text-blue-700 font-bold'}`}
            >
              {bm.title}
            </a>
          </div>
          
          {bm.description && (
            <p className="text-gray-700 text-sm mb-1.5 leading-snug max-w-3xl">
              {bm.description}
            </p>
          )}

          <div className="flex flex-wrap items-center text-xs gap-x-2 text-delicious-meta">
            {bm.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-2">
                <span className="text-gray-400">to</span>
                {bm.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick(tag)}
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-0.5 rounded"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            
            <span className="text-gray-300">|</span>
            
            <span className="text-gray-400">
              {new Date(bm.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }).toLowerCase()}
            </span>

            <span className="text-gray-300">|</span>

            {bm.isRead ? (
              <button 
                onClick={() => onToggleRead(bm.id, false)}
                className="text-green-600 font-medium flex items-center gap-1 hover:text-green-700"
                title="Click to mark as unread"
              >
                Read <span>✓</span>
              </button>
            ) : (
              <button 
                onClick={() => onToggleRead(bm.id, true)}
                className="text-gray-400 hover:text-blue-600 hover:underline decoration-dotted"
              >
                mark as read
              </button>
            )}

            <button
              onClick={() => startEdit(bm)}
              className="ml-2 text-blue-500 hover:text-blue-700 hover:underline decoration-dotted"
              title="Edit bookmark"
            >
              edit
            </button>

            <button 
              onClick={() => onDelete(bm.id)}
              className="ml-2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete bookmark"
            >
              delete
            </button>
          </div>

          {editingId === bm.id && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded shadow-sm space-y-2 animate-fade-in">
              <div className="text-xs text-blue-900 font-bold uppercase tracking-wide">Edit bookmark</div>
              <label className="block text-xs text-blue-800 font-semibold mb-1">Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <label className="block text-xs text-blue-800 font-semibold mb-1">Tags (space separated)</label>
              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="news tech webdev..."
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={cancelEdit}
                  className="text-xs text-blue-500 hover:text-blue-700 hover:underline px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(bm.id)}
                  disabled={isSaving}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
