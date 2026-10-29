'use client';

import { Dose, MEDICATIONS } from '@/lib/pharmacokinetics';
import { parseTSVToDoses, dosesToTSV } from '@/lib/xlsxUtils';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useCallback, useRef, useEffect } from 'react';
import SpreadsheetCell from './SpreadsheetCell';

interface DoseTableProps {
  doses: Dose[];
  onUpdate: (id: string, updates: Partial<Dose>) => void;
  onDelete: (id: string) => void;
  onBulkUpdate?: (doses: Dose[]) => void;
}

interface CellPosition {
  row: number;
  col: number;
}

const COLUMNS = [
  { key: 'date', label: 'Date', width: 140, type: 'date' as const },
  { key: 'time', label: 'Time', width: 100, type: 'time' as const },
  { key: 'medication', label: 'Medication', width: 140, type: 'select' as const },
  { key: 'dose', label: 'Dose', width: 100, type: 'select' as const },
  { key: 'amount', label: 'Amount (mg)', width: 120, type: 'readonly' as const },
  { key: 'formulation', label: 'Type', width: 80, type: 'readonly' as const },
];

export default function DoseTable({ doses, onUpdate, onDelete, onBulkUpdate }: DoseTableProps) {
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    Object.fromEntries(COLUMNS.map(col => [col.key, col.width]))
  );
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);

  const tableRef = useRef<HTMLDivElement>(null);
  const sortedDoses = [...doses].sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  // Copy functionality
  const handleCopy = useCallback(() => {
    if (doses.length === 0) return;

    const tsv = dosesToTSV(doses);
    navigator.clipboard.writeText(tsv).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, [doses]);

  // Paste functionality
  const handlePaste = useCallback(async () => {
    if (!onBulkUpdate) return;

    try {
      const text = await navigator.clipboard.readText();
      const result = parseTSVToDoses(text);

      if (result.doses.length > 0) {
        // Show confirmation or directly update
        if (confirm(`Paste ${result.doses.length} dose(s)? This will replace current data.\n${result.warnings.join('\n')}`)) {
          onBulkUpdate(result.doses);
        }
      } else if (result.errors.length > 0) {
        alert('Paste failed:\n' + result.errors.join('\n'));
      }
    } catch (err) {
      console.error('Failed to paste:', err);
      alert('Failed to access clipboard. Please use Ctrl+V or Cmd+V.');
    }
  }, [onBulkUpdate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Copy: Ctrl+C or Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !editingCell) {
        e.preventDefault();
        handleCopy();
      }
      // Paste: Ctrl+V or Cmd+V
      else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !editingCell) {
        e.preventDefault();
        handlePaste();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingCell, handleCopy, handlePaste]);

  const handleCellFocus = (row: number, col: number) => {
    setFocusedCell({ row, col });
    setEditingCell(null);
  };

  const handleStartEdit = (row: number, col: number) => {
    setEditingCell({ row, col });
  };

  const handleStopEdit = () => {
    setEditingCell(null);
  };

  const handleNavigate = (row: number, col: number, direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => {
    let newRow = row;
    let newCol = col;

    switch (direction) {
      case 'up':
        newRow = Math.max(0, row - 1);
        break;
      case 'down':
        newRow = Math.min(sortedDoses.length - 1, row + 1);
        break;
      case 'left':
        newCol = Math.max(0, col - 1);
        break;
      case 'right':
      case 'tab':
        newCol = col + 1;
        if (newCol >= COLUMNS.length) {
          newCol = 0;
          newRow = Math.min(sortedDoses.length - 1, row + 1);
        }
        break;
      case 'shift-tab':
        newCol = col - 1;
        if (newCol < 0) {
          newCol = COLUMNS.length - 1;
          newRow = Math.max(0, row - 1);
        }
        break;
    }

    setFocusedCell({ row: newRow, col: newCol });
    setEditingCell(null);
  };

  const handleCellChange = (row: number, colKey: string, value: string) => {
    const dose = sortedDoses[row];
    if (!dose) return;

    switch (colKey) {
      case 'date':
        const [year, month, day] = value.split('-').map(Number);
        const newDate = new Date(dose.datetime);
        newDate.setFullYear(year, month - 1, day);
        onUpdate(dose.id, { datetime: newDate });
        break;

      case 'time':
        const [hours, minutes] = value.split(':').map(Number);
        const newTime = new Date(dose.datetime);
        newTime.setHours(hours, minutes);
        onUpdate(dose.id, { datetime: newTime });
        break;

      case 'medication':
        onUpdate(dose.id, { medication: value as 'Carbilev' | 'Sinemet CR' });
        break;

      case 'dose':
        onUpdate(dose.id, { doseAmount: value as 'Full' | 'Half' });
        break;
    }
  };

  const getCellValue = (dose: Dose, colKey: string): string => {
    switch (colKey) {
      case 'date':
        return format(dose.datetime, 'yyyy-MM-dd');
      case 'time':
        return format(dose.datetime, 'HH:mm');
      case 'medication':
        return dose.medication;
      case 'dose':
        return dose.doseAmount;
      case 'amount':
        return dose.doseMg.toString();
      case 'formulation':
        return dose.formulation;
      default:
        return '';
    }
  };

  const getSelectOptions = (colKey: string): string[] => {
    switch (colKey) {
      case 'medication':
        return ['Carbilev', 'Sinemet CR'];
      case 'dose':
        return ['Full', 'Half'];
      default:
        return [];
    }
  };

  // Column resizing
  const handleResizeStart = (colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(colKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnWidths[colKey]);
  };

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(80, Math.min(400, resizeStartWidth + diff));
      setColumnWidths(prev => ({ ...prev, [resizingColumn]: newWidth }));
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  if (sortedDoses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="text-lg mb-2">No doses added yet</p>
        <p className="text-sm">Click &quot;Add Dose&quot; to get started, or paste from Excel (Ctrl+V)</p>
      </div>
    );
  }

  return (
    <div
      ref={tableRef}
      className="spreadsheet-container overflow-auto border border-gray-300 dark:border-gray-700 rounded-lg"
      style={{ maxHeight: '600px' }}
    >
      {/* Header */}
      <div className="spreadsheet-header sticky top-0 z-20 flex bg-gray-100 dark:bg-gray-900 border-b-2 border-gray-400 dark:border-gray-600">
        <div className="header-cell flex items-center justify-center px-2 py-2 border-r border-gray-300 dark:border-gray-700 font-semibold text-xs text-gray-600 dark:text-gray-400" style={{ width: '50px', minWidth: '50px' }}>
          #
        </div>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="header-cell relative flex items-center px-3 py-2 border-r border-gray-300 dark:border-gray-700 font-semibold text-xs text-gray-700 dark:text-gray-300"
            style={{ width: `${columnWidths[col.key]}px`, minWidth: `${columnWidths[col.key]}px` }}
          >
            {col.label}
            {col.key !== 'amount' && col.key !== 'formulation' && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all"
                onMouseDown={(e) => handleResizeStart(col.key, e)}
              />
            )}
          </div>
        ))}
        <div className="header-cell flex items-center justify-center px-3 py-2 font-semibold text-xs text-gray-700 dark:text-gray-300" style={{ width: '80px', minWidth: '80px' }}>
          Actions
        </div>
      </div>

      {/* Body */}
      <div className="spreadsheet-body">
        {sortedDoses.map((dose, rowIndex) => (
          <div key={dose.id} className="spreadsheet-row flex border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-800/50">
            {/* Row number */}
            <div className="row-number flex items-center justify-center px-2 py-1 border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 font-mono" style={{ width: '50px', minWidth: '50px' }}>
              {rowIndex + 1}
            </div>

            {/* Data cells */}
            {COLUMNS.map((col, colIndex) => (
              <div key={col.key} style={{ width: `${columnWidths[col.key]}px`, minWidth: `${columnWidths[col.key]}px` }}>
                <SpreadsheetCell
                  value={getCellValue(dose, col.key)}
                  onChange={(value) => handleCellChange(rowIndex, col.key, value)}
                  type={col.type}
                  options={getSelectOptions(col.key)}
                  isFocused={focusedCell?.row === rowIndex && focusedCell?.col === colIndex}
                  isEditing={editingCell?.row === rowIndex && editingCell?.col === colIndex}
                  onFocus={() => handleCellFocus(rowIndex, colIndex)}
                  onStartEdit={() => handleStartEdit(rowIndex, colIndex)}
                  onStopEdit={handleStopEdit}
                  onNavigate={(dir) => handleNavigate(rowIndex, colIndex, dir)}
                  readOnlyDisplay={
                    col.key === 'amount' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {dose.doseMg} mg
                      </span>
                    ) : col.key === 'formulation' ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        dose.formulation === 'IR'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      }`}>
                        {dose.formulation}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            ))}

            {/* Actions cell */}
            <div className="flex items-center justify-center px-2 py-1 border-l border-gray-300 dark:border-gray-700" style={{ width: '80px', minWidth: '80px' }}>
              <button
                onClick={() => onDelete(dose.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Delete dose"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions footer */}
      <div className="border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
        <span className="font-semibold">Tip:</span> Use arrow keys to navigate • Enter to edit • Escape to cancel • Ctrl+C to copy • Ctrl+V to paste
      </div>
    </div>
  );
}
