import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFrame } from '../components/MobileFrame';
import { NavigationHeader } from '../components/NavigationHeader';

const TimelineItem = ({ dateRange, desc, items, isActive = false }: any) => {
    const navigate = useNavigate();
    
    return (
        <div className="relative pl-8 pb-12 last:pb-0">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-2 bottom-0 w-[2px] bg-khaki"></div>
            {/* Dot */}
            <div className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-bg-light ${isActive ? 'bg-olive' : 'bg-sage'}`}></div>

            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    {dateRange.start} <span className="text-olive mx-1">至</span> {dateRange.end}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {desc}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {items.map((item: any, idx: number) => (
                    <div 
                        key={idx}
                        onClick={() => item.isCompleted && navigate('/record')}
                        className={`
                            rounded-xl p-3 flex flex-col items-center justify-center aspect-[4/3] cursor-pointer active:scale-95 transition-transform
                            ${item.isHighlight ? 'bg-primary' : (item.isDashed ? 'border-2 border-dashed border-gray-400 bg-transparent' : 'bg-sage')}
                        `}
                    >
                        <span className={`text-sm font-semibold mb-1 ${item.isHighlight ? 'text-khaki' : (item.isDashed ? 'text-khaki' : 'text-white')}`}>
                            {item.date}
                        </span>
                        <span className={`text-xs ${item.isHighlight ? 'text-khaki' : (item.isDashed ? 'text-khaki' : 'text-white')}`}>
                            作业
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Timeline: React.FC = () => {
  const data = [
    {
        dateRange: { start: '10.31', end: '11.6' },
        desc: '在晚餐后与全家人进行一次十分钟的日常分享聊天, 并通过日记的形式记录下来。',
        isActive: true,
        items: [
            { date: '10.31', isCompleted: true },
            { date: '11.1', isCompleted: true },
            { date: '11.2', isCompleted: true },
            { date: '11.3', isCompleted: true },
            { date: '11.4', isHighlight: true, isCompleted: false }, // Today
        ]
    },
    {
        dateRange: { start: '10.24', end: '10.30' },
        desc: '在睡前花几分钟整理今天一整天发生的事, 并记录下自己此刻的想法。',
        isActive: false,
        items: [
            { date: '10.24', isCompleted: true },
            { date: '10.25', isCompleted: true },
            { date: '10.26', isCompleted: true },
            { date: '10.27', isCompleted: true },
            { date: '10.28', isDashed: true, isCompleted: false }, // Missed
            { date: '10.29', isCompleted: true },
            { date: '10.30', isCompleted: true },
        ]
    },
    {
        dateRange: { start: '10.17', end: '10.23' },
        desc: '在睡前花五分钟整理今天一整天发生的事, 并记录下自己此刻的想法。',
        isActive: false,
        items: [
            { date: '10.17', isCompleted: true },
            { date: '10.18', isDashed: true, isCompleted: false },
            { date: '10.19', isDashed: true, isCompleted: false },
            { date: '10.20', isCompleted: true },
        ]
    }
  ];

  return (
    <MobileFrame>
      <div className="min-h-screen bg-bg-light flex flex-col">
        {/* Custom Header Layout for Timeline */}
        <div className="relative pt-6 pb-3">
            <NavigationHeader className="absolute top-0 left-0 w-full z-20" />
            
            <div className="flex justify-center pt-8 pb-4">
                <div className="relative w-32 h-14 flex items-center justify-center">
                    {/* Flat Starburst Background */}
                    <svg viewBox="0 0 120 50" className="absolute w-full h-full text-olive fill-current opacity-80">
                        <path d="M60 0 L75 15 L115 15 L90 25 L100 45 L60 35 L20 45 L30 25 L5 15 L45 15 Z" />
                    </svg>
                    <span className="relative z-10 text-white font-bold text-lg pt-1 tracking-wide">我的作业</span>
                </div>
            </div>
        </div>

        <div className="flex-1 px-6 py-2 overflow-y-auto no-scrollbar">
            {/* Top Connector Line */}
            <div className="relative h-6 w-full mb-2">
                <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-khaki"></div>
            </div>

            {data.map((group, idx) => (
                <TimelineItem key={idx} {...group} />
            ))}
        </div>
      </div>
    </MobileFrame>
  );
};

export default Timeline;