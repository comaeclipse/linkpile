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
   * Loads layout data from LocalStorage.
   */
  async load(): Promise<LayoutData | null> {
    // Local Storage (Legacy data or offline)
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
   * Saves layout data to LocalStorage.
   */
  async save(data: LayoutData) {
    // Save to LocalStorage
    localStorage.setItem(LS_KEYS.TABS, JSON.stringify(data.tabs));
    localStorage.setItem(LS_KEYS.WIDGETS, JSON.stringify(data.widgets));
    localStorage.setItem(LS_KEYS.POSITIONS, JSON.stringify(data.positions));
  }
};
