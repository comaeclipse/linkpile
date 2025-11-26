import React, { useMemo } from 'react';
import { Bookmark, TagCount } from '../types';

interface TagCloudProps {
  bookmarks: Bookmark[];
  activeTag: string | null;
  onTagClick: (tag: string) => void;
}

export const TagCloud: React.FC<TagCloudProps> = ({ bookmarks, activeTag, onTagClick }) => {
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookmarks.forEach(bm => {
      bm.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count desc, then name asc
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count } as TagCount))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [bookmarks]);

  if (tagCounts.length === 0) return null;

  return (
    <div className="mt-8 md:mt-0">
      <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-3">Tags</h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {tagCounts.map(({ tag, count }) => {
          // Simple font sizing based on count logic
          const isBig = count > 3;
          const isMedium = count > 1;
          
          return (
            <div key={tag} className="flex items-baseline">
              <button
                onClick={() => onTagClick(tag)}
                className={`
                  hover:underline
                  ${activeTag === tag ? 'text-black font-bold bg-yellow-100' : 'text-blue-600'}
                  ${isBig ? 'text-lg' : isMedium ? 'text-sm' : 'text-xs'}
                `}
              >
                {tag}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 border-t border-gray-100 pt-4">
         <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-2">Related</h4>
         <p className="text-xs text-gray-400">
           {activeTag ? `Filtering by "${activeTag}"` : 'Viewing all bookmarks'}
         </p>
      </div>
    </div>
  );
};
