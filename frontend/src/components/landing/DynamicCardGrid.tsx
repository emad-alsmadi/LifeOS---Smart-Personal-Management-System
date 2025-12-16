import React from 'react';
import { Brain, Layers3, LayoutGrid, Bot } from 'lucide-react';

const Card: React.FC<{
  title: string;
  desc: string;
  visual?: React.ReactNode;
}> = ({ title, desc, visual }) => {
  return (
    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-full flex flex-col'>
      <div className='flex items-center gap-3 mb-3'>
        <div className='p-2 rounded-lg bg-primary-50 text-primary-700'>
          <Layers3 className='w-5 h-5' />
        </div>
        <div className='text-lg font-semibold text-gray-900'>{title}</div>
      </div>
      <div className='text-gray-700 flex-1'>{desc}</div>
      {visual && <div className='mt-4'>{visual}</div>}
    </div>
  );
};

const DynamicCardGrid: React.FC = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      <Card
        title="Build Your Life's Architecture"
        desc='Create custom structures for any domain – each structure gets its own ecosystem.'
        visual={<LayoutGrid className='w-6 h-6 text-gray-500' />}
      />
      <Card
        title='AI That Understands Your Ambitions'
        desc='DeepSeek-powered AI suggests optimal hierarchies, finds gaps, and recommends plans.'
        visual={<Bot className='w-6 h-6 text-gray-500' />}
      />
      <Card
        title='Isolated Ecosystems per Structure'
        desc='Habits, Calendar, Notes, Projects – all context-specific per structure.'
        visual={<Brain className='w-6 h-6 text-gray-500' />}
      />
      <Card
        title='Your Way: Manual or AI'
        desc='Full manual control or AI-accelerated drafts you can customize.'
        visual={<Layers3 className='w-6 h-6 text-gray-500' />}
      />
    </div>
  );
};

export default DynamicCardGrid;
