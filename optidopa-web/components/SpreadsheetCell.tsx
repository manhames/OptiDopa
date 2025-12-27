'use client';

import { useEffect, useRef, useState } from 'react';

export type CellType = 'date' | 'time' | 'select' | 'readonly' | 'text';

interface SpreadsheetCellProps {
  value: string;
  onChange: (value: string) => void;
  type: CellType;
  options?: string[]; // For select type
  isFocused: boolean;
  isEditing: boolean;
  onFocus: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => void;
  className?: string;
  readOnlyDisplay?: React.ReactNode; // Custom display for readonly cells
}

export default function SpreadsheetCell({
  value,
  onChange,
  type,
  options = [],
  isFocused,
  isEditing,
  onFocus,
  onStartEdit,
  onStopEdit,
  onNavigate,
  className = '',
  readOnlyDisplay,
}: SpreadsheetCellProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // Sync local value with prop value
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  // Focus cell when focused changes
  useEffect(() => {
    if (isFocused && !isEditing && cellRef.current) {
      cellRef.current.focus();
    }
  }, [isFocused, isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      // In edit mode
      if (e.key === 'Escape') {
        e.preventDefault();
        setLocalValue(value); // Reset to original
        onStopEdit();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onChange(localValue);
        onStopEdit();
        onNavigate('down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onChange(localValue);
        onStopEdit();
        onNavigate(e.shiftKey ? 'shift-tab' : 'tab');
      }
    } else {
      // In navigation mode
      if (e.key === 'Enter' && type !== 'readonly') {
        e.preventDefault();
        onStartEdit();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('right');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onNavigate(e.shiftKey ? 'shift-tab' : 'tab');
      } else if (e.key.length === 1 && type !== 'readonly') {
        // Start typing - enter edit mode
        e.preventDefault();
        setLocalValue(e.key);
        onStartEdit();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (isEditing) {
      onChange(localValue);
      onStopEdit();
    }
  };

  const cellClasses = `
    relative px-2 py-1.5 border border-gray-300 dark:border-gray-600
    ${isFocused ? 'ring-2 ring-blue-500 dark:ring-blue-400 z-10' : ''}
    ${isEditing ? 'bg-white dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}
    ${type === 'readonly' ? 'bg-gray-100 dark:bg-gray-900' : 'cursor-cell'}
    transition-colors
    ${className}
  `.trim();

  const inputClasses = `
    w-full h-full px-1 py-0 border-none outline-none bg-transparent
    text-gray-900 dark:text-white text-sm
    focus:outline-none
  `.trim();

  if (type === 'readonly') {
    return (
      <div
        ref={cellRef}
        className={cellClasses}
        onClick={onFocus}
        onKeyDown={handleKeyDown}
        tabIndex={isFocused ? 0 : -1}
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {readOnlyDisplay || value}
        </div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div
        ref={cellRef}
        className={cellClasses}
        onClick={onFocus}
        onDoubleClick={onStartEdit}
        onKeyDown={handleKeyDown}
        tabIndex={isFocused ? 0 : -1}
      >
        <div className="text-sm text-gray-900 dark:text-white truncate">
          {value || <span className="text-gray-400">&nbsp;</span>}
        </div>
      </div>
    );
  }

  // Editing mode
  if (type === 'select') {
    return (
      <div className={cellClasses}>
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={inputClasses}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={cellClasses}>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === 'date' ? 'date' : type === 'time' ? 'time' : 'text'}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
    </div>
  );
}
