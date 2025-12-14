import React from 'react';
import { useState, useEffect } from 'react';
import { Car, LogOut, User, Bell, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useTranslation();

  // Listen for sidebar state changes (in a real app, this would use context or props)
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };

    // Initial check
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarToggle', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Check if we're on a vehicle report page and extract vehicle info
  const isVehicleReportPage = location.pathname.includes('/vehicles/') && location.pathname.includes('/report');
  
  // In a real app, you'd get this from the route params or context
  // For now, we'll use mock data based on the current route
  const getReportTitle = () => {
    if (isVehicleReportPage) {
      // Extract vehicle ID from URL and return appropriate title
      // This is simplified - in a real app you'd fetch this data
      return "Rapport - AB-123-CD - January 15";
    }
    return null;
  };

  return (
    <header className="border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-40" style={{ backgroundColor: theme?.backgroundPrimaryColor || '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left side - Logo and Report Title */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-shrink-0">
              {theme?.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt="Company Logo"
                  className="h-6 sm:h-8 w-auto object-contain"
                />
              ) : (
                <img
                  src="/logo_tchek-web.png"
                  alt="Tchek.ai Logo"
                  className="h-6 sm:h-8 w-auto object-contain"
                />
              )}
            </div>

            {/* Report Title - Hidden on mobile */}
            {getReportTitle() && (
              <div className="hidden md:block border-l border-gray-300 pl-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getReportTitle()}
                </h2>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Actions Dropdown - only show on vehicle report pages */}
            {isVehicleReportPage && (
              <Menu as="div" className="relative hidden sm:block">
                <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="hidden md:inline">Actions</span>
                  <ChevronDown className="w-4 h-4" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Download Report
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Share Report
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={clsx(
                              active ? 'bg-gray-100' : '',
                              'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Export Data
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}

            {/* Notifications - Hidden on small mobile */}
            <button className="hidden sm:flex relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.companyName || 'All Companies'}</p>
                  <div className="text-xs text-gray-500">
                    <p className="truncate max-w-32">{user?.email}</p>
                  </div>
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'flex items-center gap-2 px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/company-selection')}
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          <Settings className="w-4 h-4" />
                          Change Company
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={clsx(
                            active ? 'bg-gray-100' : '',
                            'flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700'
                          )}
                        >
                          <LogOut className="w-4 h-4" />
                          {t('actions.logout')}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};