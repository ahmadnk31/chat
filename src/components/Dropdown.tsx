'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showCheck?: boolean;
  hoverMode?: boolean; // Enable hover functionality like Claude/ChatGPT
}

export default function Dropdown({
  options,
  value,
  placeholder = 'Select an option',
  onSelect,
  className = '',
  disabled = false,
  size = 'md',
  variant = 'default',
  showCheck = true,
  hoverMode = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    }, 150); // Small delay to prevent flickering
  };

  const handleSelect = (optionValue: string) => {
    if (!disabled) {
      onSelect(optionValue);
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (hoverMode || disabled) return; // Don't allow clicking in hover mode
    setIsOpen(!isOpen);
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
    ghost: 'bg-transparent border-0 hover:bg-gray-100 focus:bg-gray-100',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
  };
  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dropdown Trigger */}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between rounded-lg transition-all duration-200
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-20 border-blue-500' : ''}
        `}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-2 flex-shrink-0">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu with smooth transitions */}
      <div className={`
        absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
        transform transition-all duration-200 ease-out origin-top
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }
      `}>
        <div className="max-h-60 overflow-auto py-1">
          {options.map((option) => (
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
              {option.icon && (
                <span className="mr-2 flex-shrink-0">{option.icon}</span>
              )}
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                )}
              </div>
              {showCheck && value === option.value && (
                <Check className="ml-2 h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
