import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserMenu from '../ui/UserMenu';

export interface HeaderProps {
  user: { name?: string; email?: string } | null;
  onOpenMobileSidebar: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenMobileSidebar, onSettings, onLogout }) => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-2xl border-b border-gray-200/60 sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="md:hidden p-3 rounded-xl text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
              onClick={onOpenMobileSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center space-x-4 group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="p-3 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500"
              >
                <Target className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-gray-700 bg-clip-text text-transparent group-hover:from-primary-600 group-hover:to-primary-800 transition-all duration-500">
                LifeOS
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <UserMenu
              user={user}
              onSettings={onSettings}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
