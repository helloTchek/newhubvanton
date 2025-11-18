import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Globe, Check } from 'lucide-react';
import clsx from 'clsx';
import { supportedLanguages, SupportedLanguage } from '../../i18n/config';
import { authService } from '../../services/authService';

export const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (languageCode: SupportedLanguage) => {
    await i18n.changeLanguage(languageCode);

    try {
      await authService.updateUserLanguage(languageCode);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors">
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.nativeName}</span>
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
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {supportedLanguages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={clsx(
                      'group flex w-full items-center justify-between px-4 py-2 text-sm',
                      active ? 'bg-teal-50 text-teal-700' : 'text-gray-700',
                      i18n.language === language.code && 'bg-teal-50'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-medium">{language.nativeName}</span>
                      <span className="text-gray-500 text-xs">{language.name}</span>
                    </span>
                    {i18n.language === language.code && (
                      <Check className="w-4 h-4 text-teal-600" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
