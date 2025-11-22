'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import BookmarkList from '@/components/BookmarkList';
import AddBookmarkForm from '@/components/AddBookmarkForm';

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

interface Tag {
  id: string;
  name: string;
  _count: { bookmarks: number };
}

interface Category {
  id: string;
  name: string;
  _count: { bookmarks: number };
}

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
    fetchTags();
  }, []);

  // Filter bookmarks when search/category/tag changes
  useEffect(() => {
    let filtered = bookmarks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.tags.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((b) =>
        b.categories.some((c) => c.name === selectedCategory)
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((b) => b.tags.some((t) => t.name === selectedTag));
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedCategory, selectedTag]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/bookmarks');
      const data = await response.json();
      setBookmarks(data);
      setFilteredBookmarks(data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleAddBookmark = async (data: {
    url: string;
    title: string;
    description: string;
    isPublic: boolean;
    tags: string[];
    categories: string[];
  }) => {
    try {
      if (editingBookmark) {
        // Update existing bookmark
        const response = await fetch(`/api/bookmarks/${editingBookmark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          await fetchBookmarks();
          await fetchCategories();
          await fetchTags();
          setEditingBookmark(null);
        }
      } else {
        // Create new bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          await fetchBookmarks();
          await fetchCategories();
          await fetchTags();
        }
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchBookmarks();
        await fetchCategories();
        await fetchTags();
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          <Sidebar
            categories={categories}
            tags={tags}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            onCategoryClick={setSelectedCategory}
            onTagClick={setSelectedTag}
          />

          <main className="flex-1">
            <AddBookmarkForm
              onSubmit={handleAddBookmark}
              editingBookmark={editingBookmark}
              onCancelEdit={() => setEditingBookmark(null)}
            />

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Loading...</p>
              </div>
            ) : (
              <BookmarkList
                bookmarks={filteredBookmarks}
                onDelete={handleDeleteBookmark}
                onEdit={handleEditBookmark}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
