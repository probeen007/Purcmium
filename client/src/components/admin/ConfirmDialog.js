import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmStyle = 'primary',
  onConfirm,
  onClose,
  icon: Icon = AlertTriangle,
  iconColor = 'text-red-500'
}) => {
  if (!isOpen) return null;

  const confirmButtonClass = confirmStyle === 'danger'
    ? 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
    : 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose?.();
              }}
              className={confirmButtonClass}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;