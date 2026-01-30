import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { BookmarkList } from './components/BookmarkList';
import { TagCloud } from './components/TagCloud';
import { Bookmark } from './types';
import { bookmarkService } from './services/bookmarkService';

// Lazy load heavier components
const AddBookmarkForm = lazy(() => import('./components/AddBookmarkForm'));
const Organizer = lazy(() => import('./components/Organizer'));

export const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'organize'>('list');

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setIsLoading(true);
    try {
      const data = await bookmarkService.getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error("Failed to load bookmarks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBookmark = async (url: string, title: string, description: string, tags: string[]) => {
    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      url,
      title,
      description,
      tags,
      createdAt: Date.now(),
      isRead: false,
    };

    // Optimistic update
    setBookmarks(prev => [newBookmark, ...prev]);
    setShowAddForm(false);

    try {
      await bookmarkService.addBookmark(newBookmark);
    } catch (error) {
      console.error("Failed to save bookmark", error);
      // Revert optimistic update on failure
      loadBookmarks();
      alert("Failed to save bookmark to database.");
    }
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    // Optimistic update
    const previous = bookmarks;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, isRead } : b));

    try {
      await bookmarkService.updateReadStatus(id, isRead);
    } catch (error) {
      console.error("Failed to update read status", error);
      // Revert
      setBookmarks(previous);
      alert("Failed to update bookmark status.");
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      // Optimistic update
      const previous = bookmarks;
      setBookmarks(prev => prev.filter(b => b.id !== id));

      try {
        await bookmarkService.deleteBookmark(id);
      } catch (error) {
        console.error("Failed to delete bookmark", error);
        setBookmarks(previous);
        alert("Failed to delete bookmark from database.");
      }
    }
  };

  const handleEditBookmark = async (id: string, title: string, tags: string[]) => {
    const previous = bookmarks;
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, title, tags } : b));

    try {
      await bookmarkService.updateBookmark(id, { title, tags });
    } catch (error) {
      console.error("Failed to update bookmark", error);
      setBookmarks(previous);
      alert("Failed to update bookmark.");
    }
  };

  const filteredBookmarks = useMemo(() => {
    if (!activeTag) return bookmarks;
    return bookmarks.filter(bm => bm.tags.includes(activeTag));
  }, [bookmarks, activeTag]);

  return (
    <div className={`min-h-screen bg-white p-4 md:p-6 ${currentView === 'list' ? 'lg:max-w-5xl lg:mx-auto' : ''}`}>
      <Header
        onReset={() => {
          setActiveTag(null);
          setCurrentView('list');
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content Area */}
        <main className="flex-1 relative">
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 rounded border border-gray-100 z-10 relative">
            <div className="text-sm">
              {activeTag ? (
                <>
                  <span className="text-gray-500">Tag: </span>
                  <span className="font-bold text-black bg-yellow-100 px-1">{activeTag}</span>
                  <button
                    onClick={() => setActiveTag(null)}
                    className="ml-2 text-blue-600 text-xs hover:underline"
                  >(remove)</button>
                </>
              ) : (
                <span className="text-gray-500">
                  {currentView === 'organize' ? 'Whiteboard Mode' : 'All Items'} ({bookmarks.length})
                </span>
              )}
            </div>
            {currentView === 'list' && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`text-sm font-bold px-3 py-1 rounded transition-colors ${showAddForm ? 'bg-gray-200 text-gray-600' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                {showAddForm ? 'Close' : '+ add a new bookmark'}
              </button>
            )}
          </div>

          {showAddForm && currentView === 'list' && (
            <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
              <AddBookmarkForm
                onAdd={handleAddBookmark}
                onCancel={() => setShowAddForm(false)}
              />
            </Suspense>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-300 mb-2"></div>
              <p className="text-xs">Loading your pile...</p>
            </div>
          ) : (
            <>
              {currentView === 'organize' ? (
                <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading organizer...</div>}>
                  <Organizer bookmarks={filteredBookmarks} />
                </Suspense>
              ) : (
                <BookmarkList
                  bookmarks={filteredBookmarks}
                  onTagClick={setActiveTag}
                  onDelete={handleDeleteBookmark}
                  onToggleRead={handleToggleRead}
                  onEdit={handleEditBookmark}
                />
              )}
            </>
          )}
        </main>

        {/* Right Sidebar (Tag Cloud) - Only show in LIST view */}
        {currentView === 'list' && (
          <aside className="w-full md:w-64 flex-shrink-0">
            <TagCloud
              bookmarks={bookmarks}
              activeTag={activeTag}
              onTagClick={(tag) => {
                setActiveTag(tag);
                setCurrentView('list');
              }}
            />

            <div className="mt-12 bg-blue-50 p-4 rounded text-xs text-blue-800">
              <h4 className="font-bold mb-2">About link.pile</h4>
              <p className="mb-2">
                A minimal clone of the classic social bookmarking experience.
              </p>
              <p className="mb-2">
                Use the <span className="font-bold">AI Auto-suggest</span> button when adding a link to automatically generate tags and clean up descriptions using Gemini.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
