import { Bookmark } from '../types';

const LOCAL_STORAGE_KEY = 'link.pile.bookmarks';
const API_BASE = import.meta.env.VITE_API_BASE || '';

export const bookmarkService = {
  async getBookmarks(): Promise<Bookmark[]> {
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (error) {
      console.warn('API fetch failed, falling back to local storage', error);
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addBookmark(bookmark: Bookmark): Promise<Bookmark | null> {
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });
      if (!res.ok) throw new Error('Failed to create');
      return await res.json();
    } catch (error) {
      console.warn('API add failed, persisting locally', error);
      const current = await this.getBookmarks();
      const updated = [bookmark, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return bookmark;
    }
  },

  async updateReadStatus(id: string, isRead: boolean): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      });
      if (!res.ok) throw new Error('Failed to update read status');
    } catch (error) {
      console.warn('API update failed, persisting locally', error);
      const current = await this.getBookmarks();
      const updated = current.map(b => b.id === id ? { ...b, isRead } : b);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  async deleteBookmark(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/api/bookmarks?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (error) {
      console.warn('API delete failed, persisting locally', error);
      const current = await this.getBookmarks();
      const updated = current.filter(b => b.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }
};
