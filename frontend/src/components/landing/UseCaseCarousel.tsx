import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UseCaseItem {
  title: string;
  summary: string;
  ai: string;
  integrated: string;
}

export interface UseCaseCarouselProps {
  items: UseCaseItem[];
  intervalMs?: number;
}

const UseCaseCarousel: React.FC<UseCaseCarouselProps> = ({
  items,
  intervalMs = 4000,
}) => {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [items.length, intervalMs]);

  const current = items[index];

  return (
    <div className='relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='text-sm text-gray-500'>
          {index + 1} / {items.length}
        </div>
        <div className='flex gap-2'>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full ${
                i === index ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      <AnimatePresence mode='wait'>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35 }}
          className='space-y-3'
        >
          <div className='text-xl font-semibold text-gray-900'>
            {current.title}
          </div>
          <div className='text-gray-700'>{current.summary}</div>
          <div className='text-sm'>
            <span className='font-semibold text-gray-900'>AI Suggests: </span>
            <span className='text-gray-700'>{current.ai}</span>
          </div>
          <div className='text-sm'>
            <span className='font-semibold text-gray-900'>Integrated: </span>
            <span className='text-gray-700'>{current.integrated}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UseCaseCarousel;
