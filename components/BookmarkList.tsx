'use client';

interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  tags: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
}

export default function BookmarkList({ bookmarks, onDelete, onEdit }: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No bookmarks yet. Add your first bookmark above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-delicious-blue hover:text-delicious-darkblue hover:underline"
                >
                  {bookmark.title}
                </a>
                {!bookmark.isPublic && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Private
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{bookmark.url}</p>
              {bookmark.description && (
                <p className="text-gray-700 mt-2">{bookmark.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                {bookmark.categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Categories:</span>
                    {bookmark.categories.map((category) => (
                      <span
                        key={category.id}
                        className="text-xs bg-delicious-lightblue text-delicious-darkblue px-2 py-1 rounded"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                {bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Tags:</span>
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Added {new Date(bookmark.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(bookmark)}
                className="text-sm text-delicious-blue hover:text-delicious-darkblue hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this bookmark?')) {
                    onDelete(bookmark.id);
                  }
                }}
                className="text-sm text-red-600 hover:text-red-800 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
