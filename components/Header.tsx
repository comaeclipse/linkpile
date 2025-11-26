import React from 'react';

interface HeaderProps {
  onReset: () => void;
  currentView: 'list' | 'organize';
  onViewChange: (view: 'list' | 'organize') => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset, currentView, onViewChange }) => {
  return (
    <header className="border-b border-gray-200 mb-6 pb-2 flex flex-col md:flex-row md:items-baseline gap-4">
      <h1 className="text-2xl font-bold flex-shrink-0">
        <button onClick={onReset} className="hover:text-delicious-meta transition-colors">
          <span className="text-black">link</span>
          <span className="text-delicious-meta">.</span>
          <span className="text-blue-600">pile</span>
        </button>
      </h1>
      <nav className="text-sm flex flex-wrap gap-x-3 items-center text-black">
        <button 
          onClick={() => onViewChange('list')} 
          className={`hover:underline ${currentView === 'list' ? 'font-bold text-black' : 'text-blue-600'}`}
        >
          list
        </button>
        <span className="text-gray-300">|</span>
        
        <button 
          onClick={() => onViewChange('organize')} 
          className={`hover:underline ${currentView === 'organize' ? 'font-bold text-black' : 'text-blue-600'}`}
        >
          organize
        </button>
        
        <span className="text-gray-300">|</span>
        <a href="#" className="text-gray-500 hover:underline">popular</a>
        <span className="text-gray-300">|</span>
        <a href="#" className="text-gray-500 hover:underline">recent</a>
        <span className="text-gray-300">|</span>
        <div className="ml-auto text-xs text-gray-400">
          logged in as <span className="font-bold text-black">user</span>
        </div>
      </nav>
    </header>
  );
};