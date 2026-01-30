import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bookmark } from '../types';
import { layoutService, LayoutData } from '../services/layoutService';

interface OrganizerProps {
  bookmarks: Bookmark[];
}

interface Position {
  x: number;
  y: number;
  tabId: string;
}

interface Widget {
  id: string;
  text: string;
  x: number;
  y: number;
  tabId: string;
}

interface Tab {
  id: string;
  name: string;
}

export const Organizer: React.FC<OrganizerProps> = ({ bookmarks }) => {
  // State
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

  // Editing State
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to persist state
  const persistState = useCallback((
    newTabs: Tab[] = tabs,
    newWidgets: Widget[] = widgets,
    newPositions: Record<string, Position> = positions
  ) => {
    if (!isLoaded) return; // Don't save before initial load
    layoutService.save({
      tabs: newTabs,
      widgets: newWidgets,
      positions: newPositions
    });
  }, [tabs, widgets, positions, isLoaded]);

  // 1. Initial Load from DB/Storage
  useEffect(() => {
    const init = async () => {
      const data = await layoutService.load();

      let initialTabs = data?.tabs || [];
      const initialWidgets = data?.widgets || [];
      const initialPositions = data?.positions || {};

      if (initialTabs.length === 0) {
        initialTabs = [{ id: 'main', name: 'Main Board' }];
      }

      setTabs(initialTabs);
      setWidgets(initialWidgets);
      setPositions(initialPositions);

      // Set active tab if not set or invalid
      if (!initialTabs.find(t => t.id === activeTabId)) {
        setActiveTabId(initialTabs[0].id);
      }

      setIsLoaded(true);
    };
    init();
  }, []); // Run once on mount

  // 2. Reconcile Bookmarks (Run when bookmarks change or after load)
  useEffect(() => {
    if (!isLoaded) return;

    let hasChanges = false;
    const newPositions = { ...positions };
    const currentTabId = tabs[0]?.id || 'main';

    bookmarks.forEach((bm, index) => {
      // If position exists but has no tabId (legacy data), assign to first tab
      if (newPositions[bm.id] && !newPositions[bm.id].tabId) {
        newPositions[bm.id] = { ...newPositions[bm.id], tabId: currentTabId };
        hasChanges = true;
      }

      // If no position exists, create one on the first tab
      if (!newPositions[bm.id]) {
        newPositions[bm.id] = {
          x: 20 + (index % 5) * 220,
          y: 100 + (Math.floor(index / 5) * 80),
          tabId: currentTabId
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setPositions(newPositions);
      // We don't necessarily autosave here to avoid thrashing DB on every read, 
      // but we could if we want strict consistency. 
      // For now, we update local state to show items.
    }
  }, [bookmarks, isLoaded, tabs]);

  // Tab Actions
  const addTab = () => {
    const newTab = { id: `tab-${Date.now()}`, name: 'New Tab' };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    persistState(newTabs);
    setActiveTabId(newTab.id);
  };

  const updateTabName = (id: string, name: string) => {
    const newTabs = tabs.map(t => t.id === id ? { ...t, name } : t);
    setTabs(newTabs);
    persistState(newTabs);
    setEditingTabId(null);
  };

  // Widget Actions
  const addWidget = () => {
    const newWidget: Widget = {
      id: `w-${Date.now()}`,
      text: 'New List',
      x: 50,
      y: 50,
      tabId: activeTabId
    };
    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    persistState(undefined, newWidgets);
  };

  const updateWidgetText = (id: string, text: string) => {
    const updated = widgets.map(w => w.id === id ? { ...w, text } : w);
    setWidgets(updated);
    persistState(undefined, updated);
    setEditingWidgetId(null);
  };

  const deleteWidget = (id: string) => {
    if (confirm('Delete this header?')) {
      const updated = widgets.filter(w => w.id !== id);
      setWidgets(updated);
      persistState(undefined, updated);
    }
  };

  // Add bookmark to active tab (creates/updates position)
  const addBookmarkToBoard = (bm: Bookmark) => {
    if (!activeTabId) return;
    const baseX = 80 + Math.random() * 120;
    const baseY = 120 + Math.random() * 140;
    const updatedPositions = {
      ...positions,
      [bm.id]: {
        x: baseX,
        y: baseY,
        tabId: activeTabId,
      },
    };
    setPositions(updatedPositions);
    persistState(undefined, undefined, updatedPositions);
    setIsAddMenuOpen(false);
    setSearchQuery('');
  };

  const recentBookmarks = [...bookmarks]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5);

  const searchResults = searchQuery
    ? bookmarks
      .filter((bm) => bm.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
    : recentBookmarks;

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    if (editingWidgetId) return;

    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

    setDragOffset({
      x: e.clientX - containerRect.left - initialX,
      y: e.clientY - containerRect.top - initialY
    });
    setDragId(id);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragId || !containerRef.current) return;
      e.preventDefault();

      // Check if hovering over a tab
      const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
      const tabElement = elementUnder?.closest('[data-tab-id]');
      const targetTabId = tabElement?.getAttribute('data-tab-id');

      if (targetTabId && targetTabId !== activeTabId) {
        setHoveredTabId(targetTabId);
      } else {
        setHoveredTabId(null);
      }

      // Move item logic
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left - dragOffset.x;
      const y = e.clientY - containerRect.top - dragOffset.y;

      if (dragId.startsWith('w-')) {
        setWidgets(prev => prev.map(w => w.id === dragId ? { ...w, x, y } : w));
      } else {
        setPositions(prev => ({
          ...prev,
          [dragId]: { ...prev[dragId], x, y }
        }));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && dragId) {
        setIsDragging(false);

        // CHECK DROP TARGET (TABS)
        const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
        const tabElement = elementUnder?.closest('[data-tab-id]');
        const targetTabId = tabElement?.getAttribute('data-tab-id');

        let finalWidgets = widgets;
        let finalPositions = positions;

        // Move to new tab?
        if (targetTabId && targetTabId !== activeTabId) {
          if (dragId.startsWith('w-')) {
            finalWidgets = widgets.map(w =>
              w.id === dragId ? { ...w, tabId: targetTabId, x: 20, y: 20 } : w
            );
            setWidgets(finalWidgets);
          } else {
            finalPositions = { ...positions };
            if (finalPositions[dragId]) {
              finalPositions[dragId] = { ...finalPositions[dragId], tabId: targetTabId, x: 20, y: 20 };
            }
            setPositions(finalPositions);
          }
        } else {
          // Just dropped in place, update vars for saving
          if (dragId.startsWith('w-')) {
            // widgets already updated by mousemove, just grab current state
          } else {
            // positions already updated by mousemove
          }
        }

        // SAVE TO DB
        persistState(tabs, finalWidgets, finalPositions);

        setDragId(null);
        setHoveredTabId(null);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragId, dragOffset, positions, widgets, activeTabId, tabs, persistState]);

  // Filter items for current view
  const currentWidgets = widgets.filter(w => (w.tabId || tabs[0]?.id) === activeTabId);
  const currentBookmarks = bookmarks.filter(bm => {
    const pos = positions[bm.id];
    // If no position tracked yet, or matches tab, or (fallback) matches first tab
    return (pos?.tabId || tabs[0]?.id) === activeTabId;
  });

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
        <div className="animate-pulse">Loading whiteboard...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-150px)]">
      {/* Tab Bar */}
      <div className="bg-blue-50 pt-2 px-2 flex items-end gap-1 border-b border-blue-200">
        {tabs.map(tab => (
          <div
            key={tab.id}
            data-tab-id={tab.id}
            className={`
               group px-4 py-2 rounded-t text-sm font-bold cursor-pointer select-none relative
               transition-colors
               ${activeTabId === tab.id ? 'bg-white text-blue-800 border-t border-l border-r border-blue-200 shadow-sm z-10' : 'bg-blue-100 text-blue-500 hover:bg-blue-200'}
               ${hoveredTabId === tab.id ? '!bg-green-100 !text-green-800 ring-2 ring-inset ring-green-300' : ''}
             `}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => setEditingTabId(tab.id)}
          >
            {editingTabId === tab.id ? (
              <input
                autoFocus
                className="bg-transparent outline-none min-w-[50px] w-full"
                defaultValue={tab.name}
                onBlur={(e) => updateTabName(tab.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') updateTabName(tab.id, e.currentTarget.value) }}
              />
            ) : (
              <span>{tab.name}</span>
            )}

            {/* Drop Hint */}
            {hoveredTabId === tab.id && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                Drop to move here
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addTab}
          className="ml-1 mb-1 p-1 rounded hover:bg-blue-200 text-blue-400 font-bold"
          title="Create new tab"
        >
          +
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-2 text-xs text-blue-800 flex justify-between items-center border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={addWidget}
            className="bg-white border border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1 rounded shadow-sm font-bold flex items-center gap-1 transition-all active:translate-y-0.5"
          >
            <span className="text-lg leading-none">+</span> Header
          </button>
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen((v) => !v)}
              className="bg-white border border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1 rounded shadow-sm font-bold flex items-center gap-1 transition-all active:translate-y-0.5"
            >
              <span className="text-lg leading-none">+</span> Add link
            </button>
            {isAddMenuOpen && (
              <div className="absolute z-50 mt-2 w-72 bg-white border border-blue-200 shadow-lg rounded-md p-3 space-y-3">
                <div className="text-[11px] text-blue-900 font-bold uppercase tracking-wide">Add to board</div>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title..."
                  className="w-full border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <div className="text-[11px] uppercase text-gray-400 font-semibold">
                  {searchQuery ? 'Matches' : 'Recent'}
                </div>
                <div className="flex flex-col gap-1 max-h-56 overflow-auto">
                  {searchResults.length === 0 && (
                    <div className="text-xs text-gray-400">Nothing to add</div>
                  )}
                  {searchResults.map((bm) => (
                    <button
                      key={bm.id}
                      onClick={() => addBookmarkToBoard(bm)}
                      className="text-left bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded px-2 py-1 text-sm text-blue-900 shadow-sm flex justify-between items-center"
                    >
                      <span className="truncate mr-2">{bm.title}</span>
                      <span className="text-[10px] text-blue-500 uppercase">Add</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 italic">Drag items onto a tab to move them. Double click tab to rename.</span>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset all positions, tabs, and headers?')) {
              localStorage.removeItem('link.pile.tabs');
              localStorage.removeItem('link.pile.whiteboardWidgets');
              localStorage.removeItem('link.pile.whiteboardPositions');
              window.location.reload();
            }
          }}
          className="text-blue-400 hover:text-red-500 hover:underline"
        >
          reset board
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 bg-white relative overflow-hidden shadow-inner cursor-crosshair"
        style={{
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Render Text Widgets */}
        {currentWidgets.map(w => (
          <div
            key={w.id}
            style={{ left: w.x, top: w.y, zIndex: dragId === w.id ? 50 : 10 }}
            className={`absolute group ${editingWidgetId === w.id ? 'z-50' : ''}`}
          >
            {editingWidgetId === w.id ? (
              <input
                autoFocus
                className="text-xl font-bold text-blue-900 bg-white border-2 border-blue-400 outline-none px-2 py-1 rounded shadow-lg min-w-[200px]"
                defaultValue={w.text}
                onBlur={(e) => updateWidgetText(w.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateWidgetText(w.id, e.currentTarget.value);
                }}
              />
            ) : (
              <div
                onMouseDown={(e) => handleMouseDown(e, w.id, w.x, w.y)}
                onDoubleClick={() => setEditingWidgetId(w.id)}
                className={`
                   cursor-move select-none px-4 py-2 rounded border border-transparent hover:border-blue-200 hover:bg-blue-50/50 transition-colors
                   ${dragId === w.id ? 'opacity-70' : ''}
                `}
              >
                <h2 className="text-xl font-bold text-blue-900 border-b-2 border-blue-200 pb-1 min-w-[150px]">
                  {w.text}
                </h2>
                <button
                  onClick={() => deleteWidget(w.id)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all"
                  title="Delete Header"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Render Bookmarks */}
        {currentBookmarks.map((bm) => {
          const pos = positions[bm.id] || { x: 0, y: 0 };
          return (
            <div
              key={bm.id}
              onMouseDown={(e) => handleMouseDown(e, bm.id, pos.x, pos.y)}
              style={{
                left: pos.x,
                top: pos.y,
                zIndex: dragId === bm.id ? 50 : 20
              }}
              className={`
                absolute cursor-move select-none
                bg-white border border-gray-300 shadow-sm hover:shadow-md
                rounded px-3 py-2 w-[200px] transition-shadow
                ${dragId === bm.id ? 'shadow-lg scale-105 border-blue-400' : ''}
              `}
            >
              <div className="text-xs font-bold text-blue-800 truncate pointer-events-none">
                {bm.title}
              </div>
              <div className="text-[9px] text-gray-400 truncate pointer-events-none mt-1 flex gap-1">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}`}
                  alt=""
                  className="w-3 h-3 opacity-50"
                />
                {new URL(bm.url).hostname}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Organizer;
