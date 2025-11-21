import React, { useState, useRef } from 'react';
import { X, Plus, MoreVertical } from 'lucide-react';
import { useTabs } from '../../contexts/TabContext';
import clsx from 'clsx';

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, switchTab, removeTab, addTab, closeOtherTabs, closeAllTabs } = useTabs();
  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

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
    });
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  React.useEffect(() => {
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

  if (tabs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-gray-100 border-b border-gray-300 flex items-center px-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-0.5 min-w-0 flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={clsx(
                'group flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-all min-w-0 max-w-[220px] relative',
                activeTabId === tab.id
                  ? 'bg-white text-gray-900 shadow-sm rounded-t-lg'
                  : 'bg-transparent text-gray-700 hover:bg-white/50 rounded-t-lg'
              )}
              style={{
                marginBottom: '-1px',
              }}
            >
              {tab.icon && (
                <span className={clsx(
                  'flex-shrink-0 transition-colors',
                  activeTabId === tab.id ? 'text-blue-600' : 'text-gray-500'
                )}>
                  {tab.icon}
                </span>
              )}
              <span className="text-sm font-normal truncate flex-1 min-w-0">
                {tab.title}
              </span>
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
              removeTab(contextMenu.tabId);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={() => {
              closeOtherTabs(contextMenu.tabId);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Close other tabs
          </button>
          <button
            onClick={() => {
              closeAllTabs();
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          >
            Close all tabs
          </button>
        </div>
      )}
    </>
  );
};
