import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

const TaskSheet: React.FC = () => {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);

  // Vertical constraints
  const MIN_Y = 0; // Top position (default, just below calendar)
  const MAX_Y = 250; // Bottom position (tucked behind green area)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down significantly or velocity is downwards
    if (info.offset.y > 50 || info.velocity.y > 200) {
      setIsOpen(true);
      controls.start({ y: MAX_Y, transition: { type: "spring", stiffness: 300, damping: 30 } });
    } else {
      setIsOpen(false);
      controls.start({ y: MIN_Y, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  const toggleSheet = () => {
    if (isOpen) {
      controls.start({ y: MIN_Y });
    } else {
      controls.start({ y: MAX_Y });
    }
    setIsOpen(!isOpen);
  };

  return (
    <motion.div 
      animate={controls}
      drag="y"
      dragConstraints={{ top: 0, bottom: MAX_Y }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      // Absolute positioning relative to the container. 
      // Top 280px places it below the calendar initially.
      className="absolute top-[280px] left-0 w-full z-10 flex flex-col h-[600px]"
    >
      <div 
        className="flex-grow bg-warm-brown rounded-t-[40px] pt-4 pb-32 px-4 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        onClick={toggleSheet} // Optional: click header to toggle
      >
        {/* Drag Handle */}
        <div className="w-10 h-1 bg-white/20 mx-auto rounded-full mb-3 cursor-grab active:cursor-grabbing"></div>
        
        {/* Header Text */}
        <div className="text-center mb-6 select-none">
          <p className="text-white text-lg font-semibold">今天 11月4日</p>
          <p className="text-white/80 text-sm">距离下次来访还有3天</p>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform duration-200">
            <div className="flex-1 mr-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-warm-brown sun-icon mr-2"></div>
                <h3 className="font-bold text-gray-800 text-sm">今日作业</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                在晚餐后与全家人进行一次十分钟的日常分享聊天, 并通过日记的形式记录下来。
              </p>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
                <path className="text-ginger-yellow" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3" transform="rotate(-90 18 18)"></path>
              </svg>
              <span className="absolute text-sm font-semibold text-gray-800">75%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform duration-200">
            <div className="flex-1 mr-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-warm-brown sun-icon mr-2"></div>
                <h3 className="font-bold text-gray-800 text-sm">会诊记录</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                与治疗师探讨了上一周的居家感受和与母亲的关系变化。
              </p>
            </div>
            <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0 bg-gray-200 rounded-full">
              <span className="absolute text-sm font-semibold text-gray-800">10.31</span>
            </div>
          </div>

        </div>
        
        {/* Instruction hint when closed */}
        {!isOpen && (
            <div className="mt-6 text-center text-white/40 text-xs animate-pulse">
                下滑隐藏列表
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskSheet;