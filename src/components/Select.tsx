'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
  label?: string;
  required?: boolean;
  hoverMode?: boolean; // Enable hover functionality like Claude/ChatGPT
}

export default function Select({
  options,
  value,
  placeholder = 'Select an option',
  onSelect,
  className = '',
  disabled = false,
  searchable = false,
  clearable = false,
  size = 'md',
  error,
  label,
  required = false,
  hoverMode = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search term
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (!hoverMode || disabled) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!hoverMode || disabled) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSearchTerm('');
    }, 150); // Small delay to prevent flickering
  };

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onSelect(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect('');
  };

  const toggleDropdown = () => {
    if (hoverMode || disabled) return; // Don't allow clicking in hover mode
    setIsOpen(!isOpen);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  return (
    <div 
      className={`relative ${className}`} 
      ref={selectRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between rounded-lg border transition-all duration-200
          ${sizeClasses[size]}
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          ${disabled ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-opacity-20' : ''}
        `}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption?.label || placeholder}
        </span>
        <div className="flex items-center">
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              className="mr-1 p-0.5 rounded hover:bg-gray-100 transition-colors duration-150"
              onClick={handleClear}
            >
              <span className="text-gray-400 text-sm">×</span>
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Menu with smooth transitions */}
      <div className={`
        absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
        transform transition-all duration-200 ease-out origin-top
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }
      `}>
        {/* Search Input */}
        {searchable && (
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Options */}
        <div className="max-h-60 overflow-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`
                  w-full px-3 py-2 text-left flex items-center hover:bg-gray-50 transition-colors duration-150
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                role="option"
                aria-selected={value === option.value}
              >
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  )}
                </div>
                {value === option.value && (
                  <Check className="ml-2 h-4 w-4 text-blue-600" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
