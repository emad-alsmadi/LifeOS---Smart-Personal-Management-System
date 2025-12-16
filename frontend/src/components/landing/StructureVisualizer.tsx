import React from 'react';
import { motion } from 'framer-motion';

export interface StructureVisualizerProps {
  levels: string[];
  compact?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
}

const colors = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-indigo-500 to-cyan-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
];

const StructureVisualizer: React.FC<StructureVisualizerProps> = ({
  levels,
  compact = false,
  dir = 'auto',
}) => {
  const items = (levels || []).slice(0, 6);
  return (
    <div
      className={compact ? 'w-full' : 'w-full'}
      dir={dir}
    >
      <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-6'}`}>
        <div
          className={`flex flex-wrap items-center justify-center ${
            compact ? 'gap-3' : 'gap-6'
          }`}
        >
          {items.map((lv, i) => (
            <React.Fragment key={`${lv}-${i}`}>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`px-4 py-2 rounded-xl bg-gradient-to-br ${
                  colors[i % colors.length]
                } text-white shadow-md`}
              >
                <span className='font-semibold whitespace-nowrap'>{lv}</span>
              </motion.div>
              {i < items.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 + 0.1 }}
                  className='w-6 h-6 text-gray-400 flex items-center justify-center'
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M5 12h14' />
                    <path d='M12 5l7 7-7 7' />
                  </svg>
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
        {!compact && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className='grid grid-cols-3 gap-3 max-w-xl mx-auto'
          >
            {items.map((lv, i) => (
              <div
                key={`meta-${lv}-${i}`}
                className='text-xs text-gray-600 bg-white rounded-lg border border-gray-200 px-3 py-2 text-center'
              >
                {i === 0
                  ? 'Top-level scope'
                  : i === items.length - 1
                  ? 'Action unit'
                  : 'Intermediate layer'}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StructureVisualizer;
