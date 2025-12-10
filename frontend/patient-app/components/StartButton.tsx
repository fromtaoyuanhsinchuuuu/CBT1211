import React from 'react';

const StartButton: React.FC = () => {
  return (
    <div className="w-full px-4 pb-8 pt-4 absolute bottom-0 left-1/2 -translate-x-1/2 max-w-sm pointer-events-auto">
      <button className="w-full bg-ginger-yellow text-black font-bold py-4 rounded-full text-lg flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]">
        开始作业
        <span className="material-symbols-outlined ml-2 font-semibold">arrow_forward</span>
      </button>
    </div>
  );
};

export default StartButton;