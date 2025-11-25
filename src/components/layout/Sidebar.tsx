import React, { useState, useRef, useEffect as useEffectReact } from 'react';
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

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffectReact(() => {
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(collapsed);
  }, []);

  useEffectReact(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

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
      {/* Mobile floating action menu */}
      <div ref={mobileMenuRef} className="lg:hidden fixed bottom-4 right-4 z-50">
        {isMobileOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2 min-w-[200px]">
            <NavLink
              to="/vehicles"
              onClick={closeMobileSidebar}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap flex-1 text-right">
                {t('navigation.vehicles')}
              </span>
              <div className="p-3 rounded-full shadow-lg bg-gray-700 group-hover:bg-gray-600 transition-colors flex-shrink-0">
                <Car className="w-5 h-5 text-white" />
              </div>
            </NavLink>

            <NavLink
              to="/analytics"
              onClick={closeMobileSidebar}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap flex-1 text-right">
                {t('navigation.analytics')}
              </span>
              <div className="p-3 rounded-full shadow-lg bg-gray-700 group-hover:bg-gray-600 transition-colors flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </NavLink>

            <NavLink
              to="/companies"
              onClick={closeMobileSidebar}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap flex-1 text-right">
                {t('navigation.companies')}
              </span>
              <div className="p-3 rounded-full shadow-lg bg-gray-700 group-hover:bg-gray-600 transition-colors flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </NavLink>

            <NavLink
              to="/settings"
              onClick={closeMobileSidebar}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap flex-1 text-right">
                {t('navigation.settings')}
              </span>
              <div className="p-3 rounded-full shadow-lg bg-gray-700 group-hover:bg-gray-600 transition-colors flex-shrink-0">
                <Settings className="w-5 h-5 text-white" />
              </div>
            </NavLink>

            <button
              onClick={() => {
                closeMobileSidebar();
                // TODO: Add new inspection logic
              }}
              className="flex items-center justify-end gap-3 group"
            >
              <span className="bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap flex-1 text-right">
                {t('navigation.newInspection')}
              </span>
              <div
                className="p-3 rounded-full shadow-lg transition-colors flex-shrink-0"
                style={{ backgroundColor: theme?.primaryColor || '#10B981' }}
              >
                <Plus className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
        )}

        <button
          onClick={toggleMobileSidebar}
          className="p-4 rounded-full shadow-lg text-white transition-transform"
          style={{
            backgroundColor: theme?.primaryColor || '#10B981',
            transform: isMobileOpen ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar - Desktop only */}
      <div className={clsx(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 fixed top-14 sm:top-16 bottom-0 z-40',
        isCollapsed ? 'w-16' : 'w-64',
        'left-0'
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-3 pb-4 h-full" style={{ backgroundColor: theme?.backgroundPrimaryColor || '#FFFFFF' }}>
          <div className="flex items-center justify-between pt-6 px-3">
            <div></div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                            'group flex gap-x-3 rounded-l-md text-sm font-medium transition-colors',
                            isCollapsed ? 'p-2 justify-center' : 'p-3'
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
                            <span className={clsx(isCollapsed && 'hidden')}>{t(`navigation.${item.key}`)}</span>
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
                        className={({ isActive }) =>
                          clsx(
                            isActive
                              ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                            'group flex gap-x-3 rounded-l-md text-sm font-medium transition-colors',
                            isCollapsed ? 'p-2 justify-center' : 'p-3'
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
                            <span className={clsx(isCollapsed && 'hidden')}>{t(`navigation.${item.key}`)}</span>
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
