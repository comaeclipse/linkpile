import { supabase, isDbConnected } from './supabaseClient';

const DB_KEY = 'organizer_data';
const LS_KEYS = {
  TABS: 'link.pile.tabs',
  WIDGETS: 'link.pile.whiteboardWidgets',
  POSITIONS: 'link.pile.whiteboardPositions'
};

export interface LayoutData {
  tabs: any[];
  widgets: any[];
  positions: Record<string, any>;
}

export const layoutService = {
  /**
   * Loads layout data from Supabase, falling back to LocalStorage if offline/empty.
   */
  async load(): Promise<LayoutData | null> {
    // 1. Try Database
    if (isDbConnected && supabase) {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('value')
          .eq('key', DB_KEY)
          .single();
        
        if (data && data.value) {
          // Found data in DB
          return data.value as LayoutData;
        }
      } catch (e) {
        console.warn("Failed to load layout from DB, falling back to local storage", e);
      }
    }
    
    // 2. Fallback to Local Storage (Legacy data or offline)
    const tabs = localStorage.getItem(LS_KEYS.TABS);
    const widgets = localStorage.getItem(LS_KEYS.WIDGETS);
    const positions = localStorage.getItem(LS_KEYS.POSITIONS);
    
    if (tabs || widgets || positions) {
       return {
         tabs: tabs ? JSON.parse(tabs) : [],
         widgets: widgets ? JSON.parse(widgets) : [],
         positions: positions ? JSON.parse(positions) : {}
       };
    }

    return null;
  },

  /**
   * Saves layout data to both LocalStorage (for speed/backup) and Supabase.
   */
  async save(data: LayoutData) {
    // 1. Save to LocalStorage (Instant)
    localStorage.setItem(LS_KEYS.TABS, JSON.stringify(data.tabs));
    localStorage.setItem(LS_KEYS.WIDGETS, JSON.stringify(data.widgets));
    localStorage.setItem(LS_KEYS.POSITIONS, JSON.stringify(data.positions));

    // 2. Save to DB (Async)
    if (isDbConnected && supabase) {
      // Upsert: update if exists, insert if not
      const { error } = await supabase
        .from('app_state')
        .upsert({ key: DB_KEY, value: data }, { onConflict: 'key' });
        
      if (error) {
        console.error("Failed to save layout to DB", error);
      }
    }
  }
};