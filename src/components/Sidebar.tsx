import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  History,
  Sliders,
  LogOut,
  X
} from 'lucide-react';
import { ActivePage } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
}) => {
  const { currentUser, logout, stats } = useInventory();

  const navItems = [
    {
      id: 'dashboard' as ActivePage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products' as ActivePage,
      label: 'Products',
      icon: Package,
      badge: stats.totalProducts,
    },
    {
      id: 'stock' as ActivePage,
      label: 'Stock',
      icon: ArrowUpDown,
      badge: stats.lowStockCount > 0 ? stats.lowStockCount : null,
      badgeVariant: stats.lowStockCount > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'movements' as ActivePage,
      label: 'Movements',
      icon: History,
      badge: null,
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#f4f1e8] border-r border-[#e6e1d3] flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top header & navigation */}
        <div className="flex flex-col flex-1 p-4">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Logo size="md" />

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-[#6c756f] hover:text-[#17211d] hover:bg-[#eae5d7] md:hidden"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Section: MANAGE */}
          <div className="px-2 mb-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#858f88] uppercase">
              Manage
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-white text-[#0f5b43] shadow-xs border border-[#e4ded0]/80'
                      : 'text-[#48534d] hover:text-[#17211d] hover:bg-[#eae5d8]/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0f5b43]' : 'text-[#68736d]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                        item.badgeVariant === 'warning'
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#e7e2d4] text-[#4d5952]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#48534d] hover:text-[#17211d] hover:bg-[#eae5d8]/70 transition-colors text-left"
            >
              <Sliders className="w-4 h-4 text-[#68736d]" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-[#e6e1d3] bg-[#f0ece1]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#17211d] text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                {currentUser?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-semibold text-[#17211d] truncate">
                  {currentUser?.username || 'admin'}
                </span>
                <span className="block text-[10px] text-[#78827b] truncate">Store Manager</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="flex items-center gap-1 p-1.5 rounded-md text-xs font-medium text-[#6c7770] hover:text-[#b91c1c] hover:bg-[#fae8e8]/70 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[11px]">Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
