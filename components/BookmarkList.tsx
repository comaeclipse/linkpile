import React from 'react';
import { Bookmark } from '../types';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onTagClick: (tag: string) => void;
  onDelete: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onTagClick, onDelete, onToggleRead }) => {
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
              onClick={() => onDelete(bm.id)}
              className="ml-2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete bookmark"
            >
              delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};