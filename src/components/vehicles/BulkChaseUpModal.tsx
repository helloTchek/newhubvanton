import React, { useState } from 'react';
import { X, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BulkChaseUpModalProps {
  vehicleCount: number;
  isOpen: boolean;
  onClose: () => void;
  onChaseUp: (method: 'email' | 'sms') => Promise<void>;
}

export const BulkChaseUpModal: React.FC<BulkChaseUpModalProps> = ({
  vehicleCount,
  isOpen,
  onClose,
  onChaseUp
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | null>(null);

  if (!isOpen) return null;

  const handleChaseUp = async (method: 'email' | 'sms') => {
    setSelectedMethod(method);
    setIsSending(true);

    try {
      await onChaseUp(method);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedMethod(null);
        onClose();
      }, 2000);
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to send bulk chase up');
      setIsSending(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {showConfirmation ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bulk Chase Up Sent!
              </h3>
              <p className="text-sm text-gray-600">
                {selectedMethod === 'email' ? 'Emails' : 'SMS messages'} have been sent to {vehicleCount} customers.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bulk Chase Up
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    You are about to send reminders to <span className="font-semibold">{vehicleCount}</span> selected customers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Choose chase up method:
                </p>

                <button
                  onClick={() => handleChaseUp('email')}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">
                    {isSending && selectedMethod === 'email' ? 'Sending...' : 'Send Emails'}
                  </span>
                </button>

                <button
                  onClick={() => handleChaseUp('sms')}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">
                    {isSending && selectedMethod === 'sms' ? 'Sending...' : 'Send SMS'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
