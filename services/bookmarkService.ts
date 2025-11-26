import { supabase, isDbConnected } from './supabaseClient';
import { Bookmark } from '../types';
import { INITIAL_BOOKMARKS } from '../constants';

const LOCAL_STORAGE_KEY = 'link.pile.bookmarks';

export const bookmarkService = {
  async getBookmarks(): Promise<Bookmark[]> {
    if (isDbConnected && supabase) {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching from DB:', error);
        // If DB fetch fails, we could fall back to empty or handle UI error
        return [];
      }

      // Map DB columns to TypeScript interface
      return data.map((item: any) => {
        // Handle both numeric timestamps and ISO strings (Supabase default)
        let createdAt = Date.now();
        if (typeof item.created_at === 'number') {
          createdAt = item.created_at;
        } else if (typeof item.created_at === 'string') {
          createdAt = new Date(item.created_at).getTime();
        }

        return {
          id: item.id,
          url: item.url,
          title: item.title,
          description: item.description,
          tags: item.tags || [],
          createdAt: createdAt,
          isRead: item.is_read || false
        };
      });
    } else {
      // Fallback to Local Storage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_BOOKMARKS;
    }
  },

  async addBookmark(bookmark: Bookmark): Promise<Bookmark | null> {
    if (isDbConnected && supabase) {
      // We map the camelCase bookmark to snake_case for the DB if needed, 
      // though here we assume the table columns match or we map explicitly.
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description,
          tags: bookmark.tags,
          created_at: bookmark.createdAt,
          is_read: bookmark.isRead
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding to DB:', error);
        throw error;
      }
      
      // Handle potentially different return format
      let createdAt = bookmark.createdAt;
      if (data.created_at && typeof data.created_at === 'string') {
        createdAt = new Date(data.created_at).getTime();
      }

      return {
         id: data.id,
         url: data.url,
         title: data.title,
         description: data.description,
         tags: data.tags,
         createdAt: createdAt,
         isRead: data.is_read || false
      };
    } else {
      // Local Storage Logic
      const current = await this.getBookmarks();
      const updated = [bookmark, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return bookmark;
    }
  },

  async updateReadStatus(id: string, isRead: boolean): Promise<void> {
    if (isDbConnected && supabase) {
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_read: isRead })
        .eq('id', id);

      if (error) {
        console.error('Error updating read status in DB:', error);
        throw error;
      }
    } else {
      // Local Storage Logic
      const current = await this.getBookmarks();
      const updated = current.map(b => b.id === id ? { ...b, isRead } : b);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  async deleteBookmark(id: string): Promise<void> {
    if (isDbConnected && supabase) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting from DB:', error);
        throw error;
      }
    } else {
      // Local Storage Logic
      const current = await this.getBookmarks();
      const updated = current.filter(b => b.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  }
};