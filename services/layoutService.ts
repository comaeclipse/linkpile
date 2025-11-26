const API_BASE = import.meta.env.VITE_API_BASE || '';
const LS_KEYS = {
  TABS: 'link.pile.tabs',
  WIDGETS: 'link.pile.whiteboardWidgets',
  POSITIONS: 'link.pile.whiteboardPositions',
  LAYOUT: 'link.pile.layout' // New unified key
};

export interface LayoutData {
  tabs: any[];
  widgets: any[];
  positions: Record<string, any>;
}

export const layoutService = {
  /**
   * Loads layout data from API with localStorage fallback.
   */
  async load(): Promise<LayoutData | null> {
    try {
      // Try API first
      const res = await fetch(`${API_BASE}/api/layout`);
      if (res.ok) {
        const data = await res.json();
        // Cache to localStorage for offline access
        localStorage.setItem(LS_KEYS.LAYOUT, JSON.stringify(data));
        return data;
      }
      throw new Error('API fetch failed');
    } catch (error) {
      console.warn('Failed to load layout from API, falling back to localStorage', error);

      // Try unified localStorage key first
      const cached = localStorage.getItem(LS_KEYS.LAYOUT);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fallback to legacy localStorage keys
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
    }
  },

  /**
   * Saves layout data to API and localStorage.
   */
  async save(data: LayoutData) {
    try {
      // Save to API
      const res = await fetch(`${API_BASE}/api/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('API save failed');
      }

      // Also cache to localStorage
      localStorage.setItem(LS_KEYS.LAYOUT, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save layout to API, persisting to localStorage only', error);

      // Fallback: save to localStorage
      localStorage.setItem(LS_KEYS.LAYOUT, JSON.stringify(data));
      localStorage.setItem(LS_KEYS.TABS, JSON.stringify(data.tabs));
      localStorage.setItem(LS_KEYS.WIDGETS, JSON.stringify(data.widgets));
      localStorage.setItem(LS_KEYS.POSITIONS, JSON.stringify(data.positions));
    }
  }
};
