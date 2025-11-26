import { Bookmark } from '../types';
import { INITIAL_BOOKMARKS } from '../constants';

const LOCAL_STORAGE_KEY = 'link.pile.bookmarks';

export const bookmarkService = {
  async getBookmarks(): Promise<Bookmark[]> {
    // Local storage only; Neon/Prisma should be handled via API layer
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
  },

  async addBookmark(bookmark: Bookmark): Promise<Bookmark | null> {
    const current = await this.getBookmarks();
    const updated = [bookmark, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return bookmark;
  },

  async updateReadStatus(id: string, isRead: boolean): Promise<void> {
    const current = await this.getBookmarks();
    const updated = current.map(b => b.id === id ? { ...b, isRead } : b);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  async deleteBookmark(id: string): Promise<void> {
    const current = await this.getBookmarks();
    const updated = current.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
};
