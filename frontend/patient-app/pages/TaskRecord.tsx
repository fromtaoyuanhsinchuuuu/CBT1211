import React from 'react';
import { MobileFrame } from '../components/MobileFrame';
import { NavigationHeader } from '../components/NavigationHeader';

const TaskRecord: React.FC = () => {
  return (
    <MobileFrame>
      <div className="min-h-screen bg-bg-light flex flex-col">
        <NavigationHeader className="mb-4" />
        
        {/* Header Visual */}
        <div className="flex flex-col items-center justify-center -mt-8 mb-8 relative">
             <div className="relative w-24 h-24 flex items-center justify-center">
               <svg viewBox="0 0 100 100" className="absolute w-full h-full text-sage fill-current">
                 <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
               </svg>
               <div className="relative z-10 flex flex-col items-center pt-2">
                   <span className="font-bold text-lg text-gray-800">10.31</span>
                   <span className="font-bold text-lg text-gray-800">作业</span>
               </div>
             </div>
             <p className="px-10 text-center text-sm text-gray-600 leading-relaxed mt-4">
                在晚餐后与全家人进行一次十分钟的日常分享聊天，并通过日记的形式记录下来。
             </p>
        </div>

        {/* Content Card (Khaki) */}
        <div className="flex-1 bg-khaki rounded-t-[2rem] p-8 flex flex-col relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <h2 className="text-white text-lg font-medium mb-1">我的作业</h2>
            <p className="text-white/60 text-xs mb-6">今天</p>
            
            {/* Lined Text Display */}
            <div className="space-y-6 mb-8">
                 {/* Creating lines */}
                 {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="w-full h-[1px] bg-white/30"></div>
                 ))}
            </div>

            {/* Submitted Image */}
            <div className="mt-auto">
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white/10">
                    <img 
                        src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop" 
                        alt="Family Dinner" 
                        className="w-full h-48 object-cover"
                    />
                </div>
            </div>
        </div>

      </div>
    </MobileFrame>
  );
};

export default TaskRecord;