import React from 'react';

const FeatureComparison: React.FC = () => {
  const rows = [
    ['Full control', 'Smart suggestions'],
    ['Step-by-step setup', 'Instant structure drafts'],
    ['Complete customization', 'Optimized hierarchies'],
    ['Your expertise', 'AI insights'],
  ];
  return (
    <div className='bg-white rounded-2xl border border-gray-200 overflow-hidden'>
      <div className='grid grid-cols-2'>
        <div className='p-4 bg-gray-50 border-b border-r'>
          <div className='font-semibold text-gray-900'>Manual Creation</div>
        </div>
        <div className='p-4 bg-gray-50 border-b'>
          <div className='font-semibold text-gray-900'>AI-Assisted</div>
        </div>
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <div className='p-4 border-r text-gray-800'>{r[0]}</div>
            <div className='p-4 text-gray-800'>{r[1]}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FeatureComparison;
