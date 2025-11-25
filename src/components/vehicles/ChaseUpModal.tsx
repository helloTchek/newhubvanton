import React, { useState } from 'react';
import { X, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { Vehicle } from '../../types';
import toast from 'react-hot-toast';

interface ChaseUpModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onChaseUp: (vehicleId: string, method: 'email' | 'sms', message?: string) => Promise<void>;
}

export const ChaseUpModal: React.FC<ChaseUpModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onChaseUp
}) => {
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms' | null>(null);
  const [emailMessage, setEmailMessage] = useState(
    `Hi,\n\nThis is a friendly reminder to complete the vehicle inspection for your ${vehicle.make} ${vehicle.model} (${vehicle.registration}).\n\nPlease use the link sent previously to complete the inspection at your earliest convenience.\n\nThank you!`
  );
  const [smsMessage, setSmsMessage] = useState(
    `Reminder: Please complete the inspection for your ${vehicle.registration}. Use the link sent previously. Thank you!`
  );

  if (!isOpen) return null;

  const handleChaseUp = async (method: 'email' | 'sms') => {
    setSelectedMethod(method);
    setIsSending(true);

    try {
      const message = method === 'email' ? emailMessage : smsMessage;
      await onChaseUp(vehicle.id, method, message);
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        setSelectedMethod(null);
        onClose();
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send chase up';
      toast.error(errorMessage);
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

        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
          {showConfirmation ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chase Up Sent!
              </h3>
              <p className="text-sm text-gray-600">
                The {selectedMethod === 'email' ? 'email' : 'SMS'} has been sent successfully to the customer.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chase Up Customer
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
                <p className="text-sm text-gray-600 mb-2">
                  Send a reminder to complete the inspection for:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">{vehicle.registration}</p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {vehicle.customerEmail}
                    </p>
                    {vehicle.customerPhone && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {vehicle.customerPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm font-medium text-gray-700">
                  Choose chase up method and customize message:
                </p>

                {/* Email Section */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Email Message</span>
                  </div>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Enter email message..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    disabled={isSending}
                  />
                  <button
                    onClick={() => handleChaseUp('email')}
                    disabled={isSending || !emailMessage.trim()}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">
                      {isSending && selectedMethod === 'email' ? 'Sending...' : 'Send Email'}
                    </span>
                  </button>
                </div>

                {/* SMS Section */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">SMS Message</span>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Enter SMS message..."
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                      disabled={isSending || !vehicle.customerPhone}
                    />
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{smsMessage.length}/160 characters</span>
                      {smsMessage.length > 160 && (
                        <span className="text-red-500">Message too long</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleChaseUp('sms')}
                    disabled={isSending || !vehicle.customerPhone || !smsMessage.trim() || smsMessage.length > 160}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">
                      {isSending && selectedMethod === 'sms' ? 'Sending...' : 'Send SMS'}
                    </span>
                  </button>

                  {!vehicle.customerPhone && (
                    <p className="text-xs text-gray-500 text-center">
                      SMS unavailable - no phone number on file
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
