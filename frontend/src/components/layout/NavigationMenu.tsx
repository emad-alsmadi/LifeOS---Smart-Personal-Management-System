import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from '../ui/tooltip';
import { NavigationItem } from '../../AppLayout/components/hooks/useAuthLayout';
import { motion } from 'framer-motion';

export interface NavigationMenuProps {
  items: NavigationItem[];
  collapsed: boolean;
  isActive: (href: string) => boolean;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  collapsed,
  isActive,
}) => {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Tooltip
            key={item.name}
            content={collapsed ? item.name : undefined}
            placement='right'
          >
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={item.href}
                className={`
                  group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium
                  ${collapsed ? 'justify-center' : 'justify-start'}
                  ${
                    active
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100/80 hover:text-primary-600'
                  }
                `}
              >
                <Icon
                  className={`flex-shrink-0 w-5 h-5 transition-all duration-300 ${
                    collapsed ? '' : 'mr-3'
                  } ${
                    active
                      ? 'text-primary-600'
                      : 'text-gray-500 group-hover:text-primary-600'
                  }`}
                />
                {!collapsed && (
                  <span className='flex-1 font-semibold'>{item.name}</span>
                )}
              </Link>
            </motion.div>
          </Tooltip>
        );
      })}
    </>
  );
};

export default NavigationMenu;
