'use client';

import { Dose } from '@/lib/pharmacokinetics';
import { ImportResult } from '@/lib/xlsxUtils';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  importResult: ImportResult | null;
  onConfirm: (doses: Dose[]) => void;
}

export default function ImportPreviewModal({
  isOpen,
  onClose,
  importResult,
  onConfirm,
}: ImportPreviewModalProps) {
  if (!isOpen || !importResult) return null;

  const hasErrors = importResult.errors.length > 0;
  const canImport = importResult.doses.length > 0;

  const handleConfirm = () => {
    if (canImport) {
      onConfirm(importResult.doses);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Import Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Summary */}
          <div className="mb-6">
            <div className="flex items-start gap-3">
              {canImport ? (
                <CheckCircle className="text-green-500 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
              )}
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {canImport
                    ? `Found ${importResult.doses.length} dose(s) ready to import`
                    : 'No valid doses found'}
                </p>
                {importResult.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {importResult.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                Validation Errors ({importResult.errors.length})
              </h3>
              <div className="max-h-40 overflow-y-auto">
                {importResult.errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-700 dark:text-red-300 mb-1">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Preview Table */}
          {canImport && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Preview (showing first {Math.min(5, importResult.doses.length)} doses)
              </h3>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">#</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Time</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Medication</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Dose</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.doses.slice(0, 5).map((dose, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{format(dose.datetime, 'yyyy-MM-dd')}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{format(dose.datetime, 'HH:mm')}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{dose.medication}</td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">{dose.doseAmount}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {dose.doseMg} mg
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            dose.formulation === 'IR'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                          }`}>
                            {dose.formulation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importResult.doses.length > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  ... and {importResult.doses.length - 5} more dose(s)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {canImport && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ This will replace all current doses
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {canImport && (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                Import {importResult.doses.length} Dose(s)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
