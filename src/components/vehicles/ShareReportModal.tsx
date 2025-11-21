import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Mail, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export type ShareStatus = 'never_shared' | 'up_to_date' | 'needs_sharing';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (recipients: string[], message?: string) => Promise<void>;
  onShareInternal?: () => Promise<void>;
  vehicleRegistration: string;
  shareStatus?: ShareStatus;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  onShare,
  onShareInternal,
  vehicleRegistration,
  shareStatus = 'needs_sharing',
}) => {
  const { t } = useTranslation('vehicles');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    const email = currentEmail.trim();

    if (!email) return;

    if (!validateEmail(email)) {
      toast.error(t('share.invalidEmail'));
      return;
    }

    if (recipients.includes(email)) {
      toast.error('Email already added');
      return;
    }

    setRecipients([...recipients, email]);
    setCurrentEmail('');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRecipient();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recipients.length === 0) {
      toast.error(t('share.atLeastOneRecipient'));
      return;
    }

    setIsSubmitting(true);

    try {
      await onShare(recipients, message || undefined);
      toast.success(t('share.shareSuccess'));
      setRecipients([]);
      setMessage('');
      onClose();
    } catch (error) {
      toast.error(t('share.shareError'));
      console.error('Share error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInternalShare = async () => {
    if (!onShareInternal) return;

    setIsSubmittingInternal(true);

    try {
      await onShareInternal();
      toast.success('Report marked as shared internally');
      onClose();
    } catch (error) {
      toast.error('Failed to share report internally');
      console.error('Internal share error:', error);
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isSubmittingInternal) {
      setRecipients([]);
      setCurrentEmail('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                    {t('share.title')}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    {vehicleRegistration}
                  </p>

                  {/* Share Status Indicator */}
                  {shareStatus === 'up_to_date' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-700">
                        Report is up to date
                      </span>
                    </div>
                  )}

                  {shareStatus === 'needs_sharing' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm text-amber-700">
                        Report modified - needs sharing
                      </span>
                    </div>
                  )}

                  {shareStatus === 'never_shared' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-700">
                        Report has never been shared
                      </span>
                    </div>
                  )}
                </div>

                {/* Internal Share Button - Only show if callback provided */}
                {onShareInternal && (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleInternalShare}
                      disabled={isSubmittingInternal || isSubmitting}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                    >
                      {isSubmittingInternal ? 'Sharing...' : 'Share Updated Report (Internal Event)'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      This will create an internal event without sending emails
                    </p>
                  </div>
                )}

                {/* Divider */}
                {onShareInternal && (
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or share via email</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('share.recipients')}
                      </label>

                      <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={currentEmail}
                            onChange={(e) => setCurrentEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t('share.enterEmail')}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddRecipient}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={isSubmitting}
                        >
                          <Plus className="w-4 h-4" />
                          {t('share.addRecipient')}
                        </button>
                      </div>

                      {recipients.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {recipients.map((email) => (
                            <div
                              key={email}
                              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-700">{email}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipient(email)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('share.message')}
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t('share.messagePlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {t('actions.cancel', { ns: 'common' })}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting || recipients.length === 0}
                    >
                      {isSubmitting ? t('messages.saving', { ns: 'common' }) : t('share.shareReport')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
