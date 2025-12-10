import React from 'react';
import { Signal, Wifi, BatteryFull } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#e0e2db]">
      <div className={`w-full max-w-[412px] h-[892px] max-h-[892px] bg-bg-light relative shadow-2xl overflow-hidden flex flex-col ${className}`}>
        {/* Status Bar */}
        <div className="h-12 w-full flex justify-between items-center px-6 pt-2 z-50 text-gray-800 absolute top-0 left-0 bg-transparent">
          <span className="text-sm font-semibold">9:30</span>
           {/* Notch simulation */}
           <div className="absolute left-1/2 top-0 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl"></div>
          <div className="flex items-center gap-1.5">
            <Signal size={16} fill="currentColor" />
            <Wifi size={16} />
            <BatteryFull size={16} fill="currentColor" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-0 pt-12">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-0 left-0 w-full h-8 flex justify-center items-center z-50 pointer-events-none">
          <div className="w-32 h-1 bg-black/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};