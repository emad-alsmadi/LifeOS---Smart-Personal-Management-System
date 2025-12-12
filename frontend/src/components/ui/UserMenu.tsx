import React from 'react';
import { Settings, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface UserMenuProps {
  user: { name?: string; email?: string } | null;
  onSettings: () => void;
  onLogout: () => void;
  TriggerWrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSettings, onLogout }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 backdrop-blur-sm border border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
          </div>
          <div className="hidden sm:block">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3 bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-2xl">
        <DropdownMenuLabel className="text-lg font-semibold text-gray-900 px-2 py-2">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200/60" />
        <DropdownMenuItem onClick={onSettings} className="p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 cursor-pointer">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Settings</p>
            <p className="text-sm text-gray-500">Manage your preferences</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200/60" />
        <DropdownMenuItem onClick={onLogout} className="p-3 rounded-xl hover:bg-red-50/80 transition-all duration-200 cursor-pointer">
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-600">Log out</p>
            <p className="text-sm text-red-500">Sign out of your account</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
