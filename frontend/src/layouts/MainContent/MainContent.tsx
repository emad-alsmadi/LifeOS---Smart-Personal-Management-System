import React from 'react';
import { motion } from 'framer-motion';

export interface MainContentProps {
  children: React.ReactNode;
  collapsed: boolean;
  role?: 'user' | 'admin' | string | null;
}

const MainContent: React.FC<MainContentProps> = ({ children, collapsed, role }) => {
  return (
    <div
      className={`flex flex-col flex-1 overflow-hidden ${
        role !== 'admin' ? (collapsed ? 'md:ml-20' : 'md:ml-64') : ''
      }`}
    >
      <main className="flex-1 relative overflow-y-auto focus:outline-none pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container-corporate section-corporate"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default MainContent;
