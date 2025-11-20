import React, { useState } from 'react';
import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Car, BarChart3, Users, Building2, Plus, Settings, HelpCircle, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const mainNavigationKeys = [
  { key: 'vehicles', href: '/vehicles', icon: Car },
  { key: 'analytics', href: '/analytics', icon: BarChart3 },
  { key: 'companies', href: '/companies', icon: Building2 },
] as const;

const bottomNavigationKeys = [
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'support', href: '/support', icon: HelpCircle },
] as const;

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg text-white"
        style={{ backgroundColor: theme?.primaryColor || '#10B981' }}
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'flex flex-col flex-shrink-0 transition-all duration-300 fixed top-14 sm:top-16 bottom-0 z-40',
        // Mobile styles
        isMobileOpen ? 'left-0 w-64' : '-left-64',
        // Desktop styles
        isCollapsed ? 'lg:w-16' : 'lg:w-64',
        'lg:left-0'
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-3 pb-4 h-full" style={{ backgroundColor: theme?.backgroundPrimaryColor || '#FFFFFF' }}>
          <div className="flex items-center justify-between pt-6 px-3">
            <div></div>
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            <div className={clsx("mb-6", isCollapsed ? "flex justify-center" : "px-3")}>
              <button
                className={clsx(
                  "text-white rounded-lg font-medium focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center",
                  isCollapsed ? "p-2" : "w-full p-3"
                )}
                style={{
                  backgroundColor: theme?.primaryColor || '#10B981',
                  '--tw-ring-color': theme?.primaryColor || '#10B981'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  const rgb = parseInt(theme?.primaryColor?.slice(1) || '10B981', 16);
                  const r = (rgb >> 16) & 0xff;
                  const g = (rgb >> 8) & 0xff;
                  const b = rgb & 0xff;
                  target.style.backgroundColor = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme?.primaryColor || '#10B981';
                }}
                title={isCollapsed ? t('navigation.newInspection') : undefined}
                onClick={closeMobileSidebar}
              >
                <Plus className={clsx(isCollapsed ? "w-6 h-6" : "w-4 h-4")} />
                {!isCollapsed && <span className="ml-2">{t('navigation.newInspection')}</span>}
              </button>
            </div>

            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="space-y-1">
                  {mainNavigationKeys.map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.href}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                            'group flex gap-x-3 rounded-l-md text-sm font-medium transition-colors',
                            isCollapsed ? 'lg:p-2 lg:justify-center p-3' : 'p-3'
                          )
                        }
                        title={isCollapsed ? t(`navigation.${item.key}`) : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={clsx(
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                                'h-5 w-5 shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            <span className={clsx(isCollapsed && 'lg:hidden')}>{t(`navigation.${item.key}`)}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li className="mt-auto">
                <ul role="list" className="space-y-1">
                  {bottomNavigationKeys.map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.href}
                        onClick={closeMobileSidebar}
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                            'group flex gap-x-3 rounded-l-md text-sm font-medium transition-colors',
                            isCollapsed ? 'lg:p-2 lg:justify-center p-3' : 'p-3'
                          )
                        }
                        title={isCollapsed ? t(`navigation.${item.key}`) : undefined}
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={clsx(
                                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                                'h-5 w-5 shrink-0'
                              )}
                              aria-hidden="true"
                            />
                            <span className={clsx(isCollapsed && 'lg:hidden')}>{t(`navigation.${item.key}`)}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};
