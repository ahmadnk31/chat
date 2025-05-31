'use client';

import { useState, useEffect } from 'react';
import { Bot, Plus, Settings, BarChart3, FileText, ChevronRight, CreditCard, LogOut, Crown, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentUser, logout, getSubscriptionBadgeColor, getSubscriptionDisplayText, isSubscriptionActive, type User } from "@/lib/auth";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const navigationItems = [
    {
      href: "/dashboard",
      icon: Bot,
      label: "My Chatbots",
      shortLabel: "Bots"
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
      shortLabel: "Stats"
    },
    {
      href: "/dashboard/sources",
      icon: FileText,
      label: "Data Sources",
      shortLabel: "Data"
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
      shortLabel: "Config"
    }
  ];
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);
  // Update isExpanded based on isHovered with debounce
  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setIsExpanded(true), 150);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsExpanded(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

  return (
    <div className="relative">
      <nav
        className={`bg-white shadow-lg h-screen sticky top-0 transition-all duration-300 ease-out border-r border-gray-200 ${
          isExpanded ? 'w-64' : 'w-16'
        } ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-3 pb-32">{/* Extra bottom padding for subscription & logout */}
          {/* New Chatbot Button */}
          <div className="relative group mb-6">
            <Link
              href="/dashboard/new"
              className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center relative overflow-hidden ${
                isExpanded ? 'px-4 py-2.5 justify-center' : 'p-2.5 justify-center'
              }`}
            >
              <Plus className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'mr-2' : ''}`} />
              <span className={`whitespace-nowrap transition-all duration-300 ${
                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                New Chatbot
              </span>
            </Link>
            
            {/* Tooltip for collapsed state */}
            {!isExpanded && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                New Chatbot
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg transition-all duration-300 relative overflow-hidden ${
                      isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    } ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"></div>
                    )}
                    
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isExpanded ? 'mr-3' : ''} ${
                      active ? 'text-blue-600' : ''
                    }`} />
                    
                    <span className={`whitespace-nowrap transition-all duration-300 ${
                      isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>          {/* Bottom Section - Subscription & Logout */}
          <div className="absolute bottom-4 left-0 right-0 px-3 space-y-2">
            {/* Subscription Status */}
            {user && !loading && (
              <div className="relative group">
                {user.subscriptionStatus === 'free' ? (
                  <Link
                    href="/dashboard/settings?tab=billing"
                    className={`flex items-center rounded-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 ${
                      isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                    }`}
                  >
                    <Crown className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'mr-2' : ''}`} />
                    <span className={`whitespace-nowrap transition-all duration-300 text-sm font-medium ${
                      isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      Upgrade to Pro
                    </span>
                  </Link>
                ) : (
                  <div className={`flex items-center rounded-lg transition-all duration-300 ${
                    isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                  } ${
                    isSubscriptionActive(user) 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <Zap className={`h-4 w-4 flex-shrink-0 ${
                      isSubscriptionActive(user) ? 'text-green-600' : 'text-red-600'
                    } ${isExpanded ? 'mr-2' : ''}`} />
                    <span className={`whitespace-nowrap transition-all duration-300 text-xs ${
                      isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                    } ${
                      isSubscriptionActive(user) ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {getSubscriptionDisplayText(user)}
                    </span>
                  </div>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 bottom-0 transform bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {user.subscriptionStatus === 'free' ? 'Upgrade to Pro' : getSubscriptionDisplayText(user)}
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <div className="relative group">
              <button
                onClick={() => logout()}
                className={`w-full flex items-center rounded-lg transition-all duration-300 text-gray-700 hover:bg-red-50 hover:text-red-700 ${
                  isExpanded ? 'px-3 py-2.5' : 'p-2.5 justify-center'
                }`}
              >
                <LogOut className={`h-4 w-4 flex-shrink-0 ${isExpanded ? 'mr-2' : ''}`} />
                <span className={`whitespace-nowrap transition-all duration-300 text-sm ${
                  isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
                }`}>
                  Logout
                </span>
              </button>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 bottom-0 transform bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className={`flex items-center justify-center ${
                isExpanded ? 'px-3 py-2.5' : 'p-2.5'
              }`}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Expansion Indicator (like Claude's arrow) */}
      <div className={`absolute top-1/2 -right-2 transform -translate-y-1/2 transition-all duration-300 ${
        isExpanded ? 'opacity-0 scale-95' : 'opacity-70 scale-100'
      }`}>
        <div className="w-4 h-8 bg-white shadow-md rounded-r-lg border border-l-0 border-gray-200 flex items-center justify-center">
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
