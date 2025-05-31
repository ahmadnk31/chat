'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, HelpCircle, CreditCard, Bell } from 'lucide-react';
import Link from 'next/link';

interface UserDropdownProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  hoverMode?: boolean; // Enable hover functionality like Claude/ChatGPT
}

export default function UserDropdown({ 
  userName = 'Demo User', 
  userEmail = 'demo@example.com',
  userAvatar,
  hoverMode = true
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!hoverMode) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!hoverMode) return;
    
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150); // Small delay to prevent flickering
  };

  const toggleDropdown = () => {
    if (hoverMode) return; // Don't allow clicking in hover mode
    setIsOpen(!isOpen);
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/dashboard/settings',
      description: 'Manage your account settings',
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/dashboard/settings',
      description: 'Configure notification preferences',
    },
    {
      icon: CreditCard,
      label: 'Billing',
      href: '/dashboard/billing',
      description: 'Manage subscription and billing',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      href: '/help',
      description: 'Get help and documentation',
    },
  ];
  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* User Avatar Button */}
      <button
        type="button"
        className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
      </button>

      {/* Dropdown Menu with smooth transitions */}
      <div className={`
        absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50
        transform transition-all duration-200 ease-out origin-top-right
        ${isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }
      `}>
        {/* User Info Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="mr-3 h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100"></div>

        {/* Logout */}
        <div className="py-2">
          <button
            type="button"
            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            onClick={() => {
              setIsOpen(false);
              // Handle logout logic here
              console.log('Logout clicked');
            }}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
