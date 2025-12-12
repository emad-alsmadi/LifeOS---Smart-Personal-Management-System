import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  content?: string;
  children: ReactNode;
  placement?: 'right' | 'left' | 'top' | 'bottom';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'right' }) => {
  const [visible, setVisible] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 whitespace-nowrap px-2 py-1 rounded bg-gray-900 text-white text-xs shadow-lg
            ${placement === 'right' ? 'left-full ml-2 top-1/2 -translate-y-1/2' : ''}
            ${placement === 'left' ? 'right-full mr-2 top-1/2 -translate-y-1/2' : ''}
            ${placement === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : ''}
            ${placement === 'bottom' ? 'top-full mt-2 left-1/2 -translate-x-1/2' : ''}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 