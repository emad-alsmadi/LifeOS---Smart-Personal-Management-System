import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface Props {
  show: boolean;
  message: string;
}

const SuccessToast: React.FC<Props> = ({ show, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: -100, scale: 0.8, x: 100 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className='fixed top-6 right-6 z-50 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white px-8 py-6 rounded-2xl shadow-2xl border border-green-300/50 backdrop-blur-sm'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl'></div>
          <div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl'></div>

          <div className='relative flex items-center gap-4'>
            <motion.div
              className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <CheckCircle className='w-8 h-8 text-white' />
            </motion.div>

            <div className='flex-1'>
              <motion.div
                className='font-bold text-xl mb-1'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Task Completed! 🎉
              </motion.div>
              <motion.div
                className='text-green-100 text-sm font-medium'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                "{message}" has been marked as completed
              </motion.div>
              <motion.div
                className='text-green-200 text-xs mt-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Great job staying productive! 💪
              </motion.div>
            </div>

            <motion.div
              className='flex flex-col items-center gap-1'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className='w-2 h-2 bg-white/60 rounded-full animate-pulse'></div>
              <div
                className='w-1 h-1 bg-white/40 rounded-full animate-pulse'
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className='w-1 h-1 bg-white/20 rounded-full animate-pulse'
                style={{ animationDelay: '0.4s' }}
              ></div>
            </motion.div>
          </div>

          <motion.div
            className='absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl'
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessToast;
