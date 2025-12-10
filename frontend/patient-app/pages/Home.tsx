import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, PanInfo } from 'framer-motion';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const [canOpen, setCanOpen] = useState(false); // only true after long-press
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const MIN_Y = 0;
  const MAX_Y = 250;

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canOpen) return; // ignore quick taps/drag without long-press
    if (info.offset.y > 50 || info.velocity.y > 200) {
      setIsOpen(true);
      controls.start({ y: MAX_Y, transition: { type: "spring", stiffness: 300, damping: 30 } });
    } else {
      setIsOpen(false);
      controls.start({ y: MIN_Y, transition: { type: "spring", stiffness: 300, damping: 30 } });
    }
  };

  const handlePressStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setCanOpen(true);
    }, 400); // long-press threshold
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    // allow single drag after a long-press; reset after drag end is processed
    setTimeout(() => setCanOpen(false), 100);
  };

  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  return (
    <div className="flex justify-center min-h-screen bg-[#E9EAE3] font-sans overflow-hidden">
      <div className="relative w-full max-w-[412px] h-[892px] max-h-screen overflow-hidden shadow-2xl bg-[#E9EAE3]">
        
        {/* Layer 1: Header */}
        <header className="relative z-30 w-full h-40">
          <div 
            className="absolute top-0 left-0 w-full h-32 bg-[#859B92]" 
            style={{ clipPath: 'ellipse(150% 70% at 50% 30%)' }}
          ></div>
          <div className="relative z-10 pt-10 px-4">
            <div className="flex justify-between items-center text-gray-800">
              <span className="material-symbols-outlined text-3xl cursor-pointer" onClick={() => navigate(-1)}>arrow_back</span>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-[124px] h-[124px]">
                <svg className="absolute" fill="none" height="124" viewBox="0 0 124 124" width="124" xmlns="http://www.w3.org/2000/svg">
                  <path d="M124 61.6482C124 72.8687 120.346 84.819 111.451 92.4284C102.556 100.038 90.7282 104.288 78.4907 104.288C72.8596 104.288 66.9015 106.184 62 110.596C57.0985 106.184 51.1404 104.288 45.5093 104.288C33.2718 104.288 21.4443 100.038 12.5492 92.4284C3.65406 84.819 0 72.8687 0 61.6482C0 50.4278 3.65406 38.4775 12.5492 30.8681C21.4443 23.2587 33.2718 19.0088 45.5093 19.0088C51.1404 19.0088 57.0985 17.1132 62 12.7011C66.9015 17.1132 72.8596 19.0088 78.4907 19.0088C90.7282 19.0088 102.556 23.2587 111.451 30.8681C120.346 38.4775 124 50.4278 124 61.6482Z" fill="#ABB579"/>
                </svg>
                <span 
                  className="relative text-[#333333] text-[16px] tracking-[.01em] pt-[62px] font-bold cursor-pointer"
                  onClick={() => navigate('/timeline')}
                >
                  我的作业
                </span>
              </div>
              <span className="material-symbols-outlined text-3xl cursor-pointer" onClick={() => navigate('/profile')}>person</span>
            </div>
          </div>
        </header>

        {/* Layer 2: Calendar */}
        <div className="absolute top-40 left-0 w-full z-0">
          <div className="px-6 py-4 text-center text-gray-700">
            <div className="grid grid-cols-7 gap-y-3">
              {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                <div key={i} className="font-medium text-gray-500">{d}</div>
              ))}
              {Array.from({ length: 30 }, (_, idx) => {
                const day = idx + 1;
                const isToday = day === 4; // 保留原先示意顯示
                const isNextVisit = day === 7; // 保留原先示意的重點日
                if (isToday) {
                  return (
                    <div key={day} className="flex items-center justify-center">
                      <div className="bg-[#F2CC41] w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold shadow-sm">{day}</div>
                    </div>
                  );
                }
                if (isNextVisit) {
                  return (
                    <div key={day} className="flex items-center justify-center">
                      <div className="relative w-9 h-9 flex items-center justify-center">
                        <div className="absolute bg-[#F2CC41] w-full h-full burst-shape opacity-40"></div>
                        <span className="relative text-black font-bold">{day}</span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={day} className="font-semibold pt-1 text-gray-600">
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layer 3: Task Sheet (Draggable) */}
        <motion.div 
          animate={controls}
          drag="y"
          dragConstraints={{ top: 0, bottom: MAX_Y }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onPointerDown={handlePressStart}
          onPointerUp={handlePressEnd}
          onPointerCancel={handlePressEnd}
          className="absolute top-[280px] left-0 w-full z-10 flex flex-col h-[600px]"
        >
          <div className="flex-grow bg-[#A28A5B] rounded-t-[40px] pt-4 pb-32 px-4 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="w-10 h-1 bg-white/20 mx-auto rounded-full mb-3 cursor-grab active:cursor-grabbing"></div>
            
            <div className="text-center mb-6 select-none">
              <p className="text-white text-lg font-semibold">今天 11月4日</p>
              <p className="text-white/80 text-sm">距离下次来访还有3天</p>
            </div>

            <div className="space-y-4">
              {/* Today's Task Card */}
              <div 
                onClick={() => navigate('/submission')} 
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform duration-200 cursor-pointer"
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-[#A28A5B] sun-icon mr-2"></div>
                    <h3 className="font-bold text-gray-800 text-sm">今日作业</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    在晚餐后与全家人进行一次十分钟的日常分享聊天, 并通过日记的形式记录下来。
                  </p>
                </div>
                <div className="w-16 h-16 relative flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-gray-200" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
                    <path className="text-[#F2CC41]" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3" transform="rotate(-90 18 18)"></path>
                  </svg>
                  <span className="absolute text-sm font-semibold text-gray-800">75%</span>
                </div>
              </div>

              {/* Consultation Record Card */}
              <div 
                onClick={() => navigate('/timeline')} 
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform duration-200 cursor-pointer"
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-[#A28A5B] sun-icon mr-2"></div>
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
            
            {!isOpen && (
              <div className="mt-6 text-center text-white/40 text-xs animate-pulse">
                下滑隐藏列表
              </div>
            )}
          </div>
        </motion.div>

        {/* Layer 4: Bottom Decoration */}
        <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-none">
          <div className="relative w-full h-[330px] overflow-hidden">
            <svg className="absolute bottom-0 w-full" preserveAspectRatio="none" viewBox="0 0 412 314" xmlns="http://www.w3.org/2000/svg">
              <circle cx="206" cy="314" fill="#859B92" r="314"></circle>
            </svg>
            <svg className="absolute bottom-0 w-full h-[330px]" preserveAspectRatio="xMidYMax slice" viewBox="0 0 412 330" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter height="200%" id="glow" width="200%" x="-50%" y="-50%">
                  <feGaussianBlur result="coloredBlur" stdDeviation="5"></feGaussianBlur>
                  <feMerge>
                    <feMergeNode in="coloredBlur"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                  </feMerge>
                </filter>
              </defs>
              <path d="M470.5 314C470.5 243.85 442.633 176.574 393.03 126.97C343.427 77.367 276.15 49.5001 206 49.5" fill="none" stroke="#A28A5B" strokeDasharray="20 20" strokeWidth="12"></path>
              <g filter="url(#glow)">
                <path d="M206 27C218.703 27 229 37.2975 229 50C229 62.7025 218.703 73 206 73C195.535 73 186.703 66.0101 183.916 56.4443C123.449 61.6269 66.4583 87.9675 23.2129 131.213C-25.2652 179.691 -52.5 245.442 -52.5 314H-64.5C-64.5 242.259 -36.001 173.456 14.7275 122.728C60.169 77.2861 120.114 49.6823 183.682 44.4219C186.175 34.4143 195.221 27 206 27Z" fill="#F2CC41"></path>
              </g>
              <path d="M205.208 37.2941C205.488 36.7521 206.262 36.7521 206.542 37.2941L208.77 41.6194C208.938 41.9451 209.316 42.1019 209.665 41.9903L214.3 40.5075C214.88 40.3217 215.428 40.8697 215.242 41.4504L213.76 46.0846C213.648 46.4335 213.805 46.8121 214.131 46.9799L218.456 49.2083C218.998 49.4875 218.998 50.2625 218.456 50.5417L214.131 52.7701C213.805 52.9379 213.648 53.3165 213.76 53.6654L215.242 58.2996C215.428 58.8803 214.88 59.4283 214.3 59.2425L209.665 57.7597C209.316 57.6481 208.938 57.8049 208.77 58.1306L206.542 62.4559C206.262 62.9979 205.488 62.9979 205.208 62.4559L202.98 58.1306C202.812 57.8049 202.434 57.6481 202.085 57.7597L197.45 59.2425C196.87 59.4283 196.322 58.8803 196.508 58.2996L197.99 53.6654C198.102 53.3165 197.945 52.9379 197.619 52.7701L193.294 50.5417C192.752 50.2625 192.752 49.4875 193.294 49.2083L197.619 46.9799C197.945 46.8121 198.102 46.4335 197.99 46.0846L196.508 41.4504C196.322 40.8697 196.87 40.3217 197.45 40.5075L202.085 41.9903C202.434 42.1019 202.812 41.9451 202.98 41.6194L205.208 37.2941Z" fill="#A28A5B"></path>
            </svg>
            <div className="absolute bottom-0 w-full h-[330px] p-6 pb-28 text-center flex flex-col justify-end">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2 tracking-wide">治疗进度 : 75%</h2>
                <div className="space-y-1 text-white/90 text-sm font-light">
                  <p>已来访4次</p>
                  <p>已完成作业25次</p>
                  <p>已连续治疗32天</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 5: Start Button */}
        <div className="absolute bottom-0 left-0 w-full z-30">
          <div className="w-full px-4 pb-8 pt-4 max-w-sm mx-auto">
            <button 
              onClick={() => navigate('/submission')}
              className="w-full bg-[#F2CC41] text-black font-bold py-4 rounded-full text-lg flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              开始作业
              <span className="material-symbols-outlined ml-2 font-semibold">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;