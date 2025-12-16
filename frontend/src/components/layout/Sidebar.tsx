import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import {
  ChevronLeft,
  ChevronDown,
  FolderOpen,
  Plus,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavigationItem, Structure } from '../../hooks/useAuthLayout';
import NavigationMenu from './NavigationMenu';
import Tooltip from '../ui/tooltip';

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavigationItem[];
  isActive: (href: string) => boolean;
  structures: Structure[];
  expandedStructureId: string | null;
  onToggleExpand: (id: string) => void;
  selectedStructureId: string | null;
  onSelectStructure: (id: string | null) => void;
  isDefaultStructure: (s: Structure) => boolean;
  slugify: (s: string) => string;
  onOpenCreate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  navigation,
  isActive,
  structures,
  expandedStructureId,
  onToggleExpand,
  selectedStructureId,
  onSelectStructure,
  isDefaultStructure,
  slugify,
  onOpenCreate,
}) => {
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
            <span className='text-lg font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent'>
              Menu
            </span>
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

            {/* Structures under Action Zone */}

            <Tooltip placement='right'>
              {' '}
              <div className='overflow-hidden'>
                <button
                  className={`
                  group flex items-center mb-2 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium
                  ${collapsed ? 'justify-cente' : 'justify-start'}
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600'
                  }
                `}
                  onClick={() => setHierarchyExpanded((v) => !v)}
                >
                  <div className='flex justify-between items-center w-full gap-[65px]'>
                    {' '}
                    <div className='flex items-center justify-between w-full gap-2'>
                      <Layers className='w-4 h-4 text-primary-600' />
                      {!collapsed && <span>Hierarchy</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          hierarchyExpanded ? 'rotate-180' : ''
                        }flex-shrink-0 w-5 h-5 transition-all duration-300 ${
                          collapsed ? '' : 'mr-3'
                        } ${
                          isActive
                            ? 'text-primary-600'
                            : 'text-gray-500 group-hover:text-primary-600'
                        }`}
                      />
                    )}
                  </div>
                </button>
                {hierarchyExpanded && !collapsed && (
                  <div className='px-2 pb-3 space-y-2'>
                    {structures.map((s) => (
                      <div
                        key={s.id}
                        className='border border-gray-200 rounded-xl overflow-hidden'
                      >
                        <button
                          className={`w-full flex items-center justify-between px-3 py-3 text-sm font-semibold hover:bg-gray-50 ${
                            selectedStructureId === s.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectStructure(s.id);
                            }}
                            className='flex items-center gap-[2px]'
                          >
                            <FolderOpen className='w-4 h-4 text-primary-600' />
                            <span>{s.name}</span>
                          </button>
                          <button
                            onClick={() => {
                              onToggleExpand(s.id);
                            }}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform hover:scale-150
                                 ${
                                   expandedStructureId === s.id
                                     ? 'rotate-180'
                                     : ''
                                 }`}
                            />
                          </button>
                        </button>
                        {expandedStructureId === s.id && (
                          <div className='px-4 pb-3'>
                            {s.levels.map((lvl, idx) => {
                              const defaultRoutes = [
                                '/goals',
                                '/objectives',
                                '/projects',
                                '/tasks',
                              ];
                              const to =
                                isDefaultStructure(s) &&
                                idx < defaultRoutes.length
                                  ? defaultRoutes[idx]
                                  : `/s/${s.id}/${slugify(lvl)}`;
                              return (
                                <Link
                                  key={idx}
                                  to={to}
                                  className='flex items-center gap-2 py-1 text-sm text-gray-700 hover:text-primary-700'
                                >
                                  <span className='w-5 h-5 rounded bg-primary-100 text-primary-700 flex items-center justify-center text-xs'>
                                    {idx + 1}
                                  </span>
                                  <span>{lvl}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={onOpenCreate}
                      className='w-full flex items-center justify-center gap-2 bg-primary-600 text-white hover:bg-primary-700'
                    >
                      <Plus className='w-4 h-4' />
                      <span>Create Structure</span>
                    </Button>
                  </div>
                )}
              </div>
            </Tooltip>

            {/* Remaining navigation excluding default pages */}
            <NavigationMenu
              items={navigation
                .filter((n) => n.name !== 'Action Zone')
                .filter(
                  (n) =>
                    !['Goals', 'Objectives', 'Projects', 'Tasks'].includes(
                      n.name
                    )
                )}
              collapsed={collapsed}
              isActive={isActive}
            />
          </nav>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
