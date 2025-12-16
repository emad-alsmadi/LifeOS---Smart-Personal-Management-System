import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Calendar,
  NotebookText,
  ListChecks,
  LayoutGrid,
  ChevronRight,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NavigationItem, Structure } from '../../hooks/useAuthLayout';
import NavigationMenu from '@components/layout/NavigationMenu';

export interface SubSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  structure: Structure;
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  slugify: (s: string) => string;
  onBack: () => void;
}

const SubSidebar: React.FC<SubSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  structure,
  navigation,
  isActive,
  slugify,
  onBack,
}) => {
  const base = `/s/${structure.id}`;
  const items = [
    // { name: 'Action Zone', href: `${base}`, icon: LayoutGrid },
    { name: 'Calendar', href: `${base}/calendar`, icon: Calendar },
    { name: 'Habits', href: `${base}/habits`, icon: ListChecks },
    { name: 'Notes', href: `${base}/notes`, icon: NotebookText },
  ];

  const userId = useMemo(() => {
    try {
      const raw = localStorage.getItem('auth:user');
      const u = raw ? JSON.parse(raw) : null;
      return u?._id || null;
    } catch {
      return null;
    }
  }, []);
  const notesKey = useMemo(
    () => (userId ? `scoped:${userId}:${structure.id}:notes` : null),
    [userId, structure.id]
  );
  const eventsKey = useMemo(
    () => (userId ? `scoped:${userId}:${structure.id}:calendar:events` : null),
    [userId, structure.id]
  );
  const habitsKey = useMemo(
    () => (userId ? `scoped:${userId}:${structure.id}:habits` : null),
    [userId, structure.id]
  );
  const [counts, setCounts] = useState({ notes: 0, events: 0, habits: 0 });
  useEffect(() => {
    try {
      const n = notesKey
        ? (JSON.parse(localStorage.getItem(notesKey) || '[]') as any[]).length
        : 0;
      const e = eventsKey
        ? (JSON.parse(localStorage.getItem(eventsKey) || '[]') as any[]).length
        : 0;
      const h = habitsKey
        ? (JSON.parse(localStorage.getItem(habitsKey) || '[]') as any[]).length
        : 0;
      setCounts({ notes: n, events: e, habits: h });
    } catch {
      setCounts({ notes: 0, events: 0, habits: 0 });
    }
  }, [notesKey, eventsKey, habitsKey]);

  const [hierarchyExpanded, setHierarchyExpanded] = useState(true);
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`hidden md:flex md:flex-shrink-0 transition-all duration-500 ease-in-out fixed top-0 left-0 h-screen z-40 ${
        collapsed ? 'w-20' : 'w-64'
      } bg-white/95 backdrop-blur-2xl border-r border-gray-200/60 shadow-xl`}
      style={{ top: '96px' }}
    >
      <div className='flex flex-col h-full w-full'>
        <div className='flex items-center justify-between px-4 py-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm'>
          {!collapsed && (
            <div className='flex items-center gap-2'>
              <button
                className='p-2 rounded-xl hover:bg-gray-100 border border-gray-200'
                onClick={onBack}
                aria-label='Back to main menu'
              >
                <ChevronLeft className='h-5 w-5' />
              </button>
              <span className='text-lg font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent'>
                {structure.name}
              </span>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className='group relative p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 border border-gray-200 hover:border-gray-300'
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <ChevronLeft
              className={`h-5 w-5 transition-all duration-500 ease-in-out ${
                collapsed ? 'rotate-180' : ''
              } relative z-10`}
            />
            <div className='absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse' />
          </motion.button>
        </div>

        <div className='flex flex-col flex-grow pt-4 pb-6 overflow-y-auto'>
          <nav className='flex-1 px-3 space-y-2'>
            {/* Action Zone item first */}
            <NavigationMenu
              items={navigation.filter((n) => n.name === 'Action Zone')}
              collapsed={collapsed}
              isActive={isActive}
            />
            {/* calendar & Habits & Notes */}
            {/* Section: Structure utilities */}
            <div className={`mt-2 ${collapsed ? 'px-0' : 'px-2'} space-y-1`}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${
                      collapsed ? 'justify-center' : 'justify-between'
                    } px-3 py-3 text-sm font-semibold hover:bg-gray-50 rounded-xl border border-transparent 
                    ${
                      isActive(item.href)
                        ? 'bg-primary-100 border-primary-300'
                        : ''
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      <Icon className='w-4 h-4 text-primary-600' />
                      {!collapsed && <span>{item.name}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight className='w-4 h-4 text-gray-400' />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Section: Levels of current structure */}
            {base && (
              <div className={`mt-2 ${collapsed ? 'px-0' : 'px-2'} space-y-2`}>
                <div className='border border-gray-200 rounded-xl overflow-hidden'>
                  <button
                    className={`w-full flex items-center ${
                      collapsed ? 'justify-center' : 'justify-between'
                    } px-3 py-3 text-sm font-semibold hover:bg-gray-50`}
                    onClick={() => setHierarchyExpanded((v) => !v)}
                  >
                    <div className='flex items-center gap-2'>
                      <Layers className='w-4 h-4 text-primary-600' />
                      {!collapsed && <span>Hierarchy</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          hierarchyExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  {hierarchyExpanded && !collapsed && (
                    <div className='px-2 pb-3 space-y-2'>
                      {!structure.levels && (
                        <div className='text-sm text-gray-500 px-2'>
                          No structure yet
                        </div>
                      )}
                      {structure.levels.map((lvl: string, idx: number) => (
                        <Link
                          key={idx}
                          to={`${base}/${slugify(lvl)}`}
                          className={`flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 rounded-lg ${
                            isActive(`${base}/${slugify(lvl)}`)
                              ? 'bg-primary-50'
                              : ''
                          }`}
                        >
                          <div className='flex items-center gap-2'>
                            <span className='w-5 h-5 rounded bg-primary-100 text-primary-700 flex items-center justify-center text-xs'>
                              {idx + 1}
                            </span>
                            <span>{lvl}</span>
                          </div>
                          <ChevronRight className='w-4 h-4 text-gray-400' />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </motion.aside>
  );
};

export default SubSidebar;
