import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Edit2, Grid, Car, Copy } from 'lucide-react';
import { useTabs, TabIconType } from '../../contexts/TabContext';
import clsx from 'clsx';

const getIconForType = (iconType?: TabIconType) => {
  switch (iconType) {
    case 'grid':
      return <Grid className="w-4 h-4" />;
    case 'car':
      return <Car className="w-4 h-4" />;
    default:
      return null;
  }
};

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, switchTab, removeTab, addTab, closeOtherTabs, closeAllTabs, renameTab, duplicateTab, reorderTabs } = useTabs();
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'left' | 'right'>('left');
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleTabClick = (tabId: string) => {
    switchTab(tabId);
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    removeTab(tabId);
  };

  const handleNewTab = () => {
    addTab({
      title: 'All Vehicles',
      path: '/vehicles',
      iconType: 'grid',
    });
  };

  const handleStartRename = (tabId: string, currentTitle: string) => {
    setRenamingTabId(tabId);
    setRenameValue(currentTitle);
    handleCloseContextMenu();
  };

  const handleFinishRename = (tabId: string) => {
    if (renameValue.trim()) {
      renameTab(tabId, renameValue.trim());
    }
    setRenamingTabId(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingTabId(null);
    setRenameValue('');
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  useEffect(() => {
    if (renamingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTabId]);

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);

      // Determine if we're on the left or right half of the tab
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      const position = e.clientX < midpoint ? 'left' : 'right';
      setDropPosition(position);
    }
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
    setDropPosition('left');
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    if (!draggedTabId || draggedTabId === targetTabId) {
      setDraggedTabId(null);
      setDragOverTabId(null);
      setDropPosition('left');
      return;
    }

    const fromIndex = tabs.findIndex(t => t.id === draggedTabId);
    let toIndex = tabs.findIndex(t => t.id === targetTabId);

    if (fromIndex !== -1 && toIndex !== -1) {
      // If dropping on the right side, adjust the target index
      if (dropPosition === 'right') {
        toIndex += 1;
      }

      // Adjust index if moving from left to right
      if (fromIndex < toIndex) {
        toIndex -= 1;
      }

      reorderTabs(fromIndex, toIndex);
    }

    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropPosition('left');
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    setDropPosition('left');
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="hidden md:flex bg-gray-100 border-t border-gray-300 items-center px-2 overflow-x-auto scrollbar-hide fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center gap-0.5 min-w-0 flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              draggable={!renamingTabId}
              onClick={() => handleTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.id)}
              onDragEnd={handleDragEnd}
              className={clsx(
                'group flex items-center gap-2 px-4 py-2.5 cursor-move transition-all min-w-0 max-w-[220px] relative',
                activeTabId === tab.id
                  ? 'bg-white text-gray-900 shadow-sm rounded-b-lg'
                  : 'bg-transparent text-gray-700 hover:bg-white/50 rounded-b-lg',
                draggedTabId === tab.id && 'opacity-50',
                dragOverTabId === tab.id && dropPosition === 'left' && 'border-l-2 border-blue-500',
                dragOverTabId === tab.id && dropPosition === 'right' && 'border-r-2 border-blue-500'
              )}
              style={{
                marginTop: '-1px',
              }}
            >
              {tab.iconType && (
                <span className={clsx(
                  'flex-shrink-0 transition-colors',
                  activeTabId === tab.id ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {getIconForType(tab.iconType)}
                </span>
              )}
              {renamingTabId === tab.id ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleFinishRename(tab.id)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      handleFinishRename(tab.id);
                    } else if (e.key === 'Escape') {
                      handleCancelRename();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-normal flex-1 min-w-0 bg-white border border-blue-500 rounded px-1 py-0.5 outline-none"
                />
              ) : (
                <span className="text-sm font-normal truncate flex-1 min-w-0">
                  {tab.title}
                </span>
              )}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={clsx(
                    'flex-shrink-0 p-1 rounded-full transition-all',
                    activeTabId === tab.id
                      ? 'opacity-70 hover:opacity-100 hover:bg-gray-200'
                      : 'opacity-0 group-hover:opacity-70 group-hover:hover:opacity-100 hover:bg-gray-200'
                  )}
                  aria-label="Close tab"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleNewTab}
          className="flex-shrink-0 p-2 ml-1 text-gray-600 hover:bg-white/70 rounded-lg transition-colors"
          aria-label="New tab"
          title="New tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              const tab = tabs.find(t => t.id === contextMenu.tabId);
              if (tab) {
                handleStartRename(contextMenu.tabId, tab.title);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={() => {
              duplicateTab(contextMenu.tabId);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <div className="border-t border-gray-100 my-1"></div>
          {tabs.length > 1 && (
            <button
              onClick={() => {
                removeTab(contextMenu.tabId);
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          )}
          {tabs.length > 1 && (
            <button
              onClick={() => {
                closeOtherTabs(contextMenu.tabId);
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Close other tabs
            </button>
          )}
          {tabs.length > 1 && (
            <button
              onClick={() => {
                closeAllTabs();
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Close all tabs
            </button>
          )}
        </div>
      )}
    </>
  );
};
