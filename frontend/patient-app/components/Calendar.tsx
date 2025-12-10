import React from 'react';

const Calendar: React.FC = () => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  
  return (
    <div className="px-6 py-4 text-center text-gray-700">
      <div className="grid grid-cols-7 gap-y-3">
        {days.map((d, i) => (
          <div key={i} className="font-medium text-gray-500">{d}</div>
        ))}
        
        <div className="font-semibold pt-1 text-gray-400">2</div>
        <div className="font-semibold pt-1 text-gray-400">3</div>
        
        <div className="flex items-center justify-center">
          <div className="bg-ginger-yellow w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold shadow-sm" style={{ borderRadius: '0.6rem' }}>
            4
          </div>
        </div>
        
        <div className="font-semibold pt-1 text-gray-600">5</div>
        <div className="font-semibold pt-1 text-gray-600">6</div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute bg-ginger-yellow w-full h-full burst-shape opacity-40"></div>
            <span className="relative text-black font-bold">7</span>
          </div>
        </div>
        
        <div className="font-semibold pt-1 text-gray-600">8</div>
      </div>
    </div>
  );
};

export default Calendar;