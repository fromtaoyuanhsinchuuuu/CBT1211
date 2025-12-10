import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFrame } from '../components/MobileFrame';
import { NavigationHeader } from '../components/NavigationHeader';
import { Settings, BookOpen, BarChart2, Star } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';

// Enhanced data set for better visualization
const moodData = [
  { day: 1, val: 30 }, 
  { day: 2, val: 45 },
  { day: 3, val: 40 },
  { day: 4, val: 55 },
  { day: 5, val: 50 }, 
  { day: 7, val: 65 },
  { day: 8, val: 80 },
  { day: 10, val: 40 }, 
  { day: 12, val: 65 },
  { day: 14, val: 90 }, 
  { day: 15, val: 60 }, 
  { day: 16, val: 55 },
  { day: 18, val: 35 },
  { day: 20, val: 45 }, 
  { day: 22, val: 75 },
  { day: 23, val: 85 },
  { day: 25, val: 75 }, 
  { day: 28, val: 55 },
  { day: 29, val: 50 },
  { day: 30, val: 60 }
];

const CalendarGrid = ({ data }: { data: typeof moodData }) => {
    // Configuration for November 2025
    // Nov 1, 2025 is a Saturday. 
    // Sunday=0, Monday=1, ..., Saturday=6.
    const startOffset = 6; 
    const daysInMonth = 30;

    const getMoodStyle = (val: number) => {
        if (val >= 80) return 'bg-[#F2CC41] text-gray-900 font-bold shadow-md scale-110'; // Excellent (Yellow)
        if (val >= 60) return 'bg-[#C5E063] text-gray-800 font-bold'; // Good (Lime)
        if (val >= 40) return 'bg-[#8DA38B] text-white font-medium'; // Okay (Sage)
        return 'bg-[#6B7548] text-white/90'; // Low (Olive)
    };

    return (
        <div className="bg-white/5 rounded-3xl p-4 mb-6 backdrop-blur-sm">
            <div className="grid grid-cols-7 mb-3 border-b border-white/10 pb-2">
                {['日','一','二','三','四','五','六'].map(d => (
                    <div key={d} className="text-center text-white/60 text-xs font-medium">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                {/* Empty slots for days before the 1st */}
                {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const entry = data.find(d => d.day === day);
                    return (
                        <div key={day} className="flex items-center justify-center aspect-square">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300
                                ${entry ? getMoodStyle(entry.val) : 'text-white/50 hover:bg-white/10 cursor-default'}
                            `}>
                                {day}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Simple Legend */}
            <div className="flex justify-center gap-4 mt-4 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#F2CC41]"></div>
                    <span className="text-[10px] text-white/60">开心</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#C5E063]"></div>
                    <span className="text-[10px] text-white/60">平静</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#8DA38B]"></div>
                    <span className="text-[10px] text-white/60">低落</span>
                </div>
            </div>
        </div>
    );
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mood' | 'achievements'>('mood');
  const [activeMoodSection, setActiveMoodSection] = useState<'chart' | 'calendar'>('chart');

  return (
    <MobileFrame>
      <div className="min-h-screen bg-bg-light flex flex-col">
        {/* Top Section */}
        <div className="px-6 pt-4">
             <NavigationHeader className="!px-0 !pt-4" />
             
             {/* User Card */}
             <div className="bg-sage rounded-3xl p-5 mt-2 flex items-start gap-4 shadow-lg relative overflow-hidden">
                {/* Decorative Starburst behind avatar */}
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary rounded-full blur-2xl opacity-20"></div>

                <div className="relative z-10 w-20 h-20 rounded-full border-4 border-bg-light overflow-hidden shrink-0 bg-yellow-100">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 relative z-10">
                    <h2 className="text-2xl font-bold text-gray-800">陈红药</h2>
                    <p className="text-xs text-gray-700 mt-1">女 34岁 119 1688 6480</p>
                    <div className="flex gap-2 mt-3">
                        <span className="bg-bg-light/40 px-3 py-1 rounded-full text-[10px] font-bold text-gray-800">轻度抑郁</span>
                        <span className="bg-bg-light/40 px-3 py-1 rounded-full text-[10px] font-bold text-gray-800">轻度躯体化</span>
                    </div>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="flex items-center gap-3 mt-4 ml-2">
                 <button className="flex items-center gap-2 border border-gray-400 rounded-full px-4 py-1.5 text-xs font-bold text-gray-600 hover:bg-black/5 transition-colors">
                    编辑头像
                 </button>
                 <button className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-black/5 transition-colors">
                    <Settings size={14} />
                 </button>
             </div>
        </div>

        {/* Tabbed Content Area */}
        <div className="flex-1 bg-khaki mt-6 rounded-t-[2.5rem] flex flex-col overflow-hidden relative shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
            
            {/* Tabs */}
            <div className="flex items-center justify-center gap-12 pt-6 pb-4">
                <button 
                    onClick={() => setActiveTab('mood')}
                    className={`flex flex-col items-center gap-1 text-lg font-bold transition-colors ${activeTab === 'mood' ? 'text-white' : 'text-white/40'}`}
                >
                    情绪
                    {activeTab === 'mood' && <div className="w-8 h-1 bg-primary rounded-full shadow-lg"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('achievements')}
                    className={`flex flex-col items-center gap-1 text-lg font-bold transition-colors ${activeTab === 'achievements' ? 'text-white' : 'text-white/40'}`}
                >
                    成就
                    {activeTab === 'achievements' && <div className="w-8 h-1 bg-primary rounded-full shadow-lg"></div>}
                </button>
            </div>

            <div className="w-full h-[1px] bg-white/10 mb-6"></div>

            {/* Tab Content */}
            <div className="flex-1 px-6 pb-20 overflow-y-auto no-scrollbar">
                {activeTab === 'mood' ? (
                    <div className="animate-fade-in pb-4">
                        <div className="flex justify-between items-center text-white mb-6 px-2">
                            <button className="opacity-60 hover:opacity-100 transition-opacity p-1">&lt;</button>
                            <span className="font-medium text-lg tracking-wide">2025年11月</span>
                            <button className="opacity-60 hover:opacity-100 transition-opacity p-1">&gt;</button>
                        </div>

                        {/* Conditional Rendering for Chart and Calendar */}
                        {activeMoodSection === 'chart' ? (
                          <div className="w-full h-40 mb-6 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={moodData}>
                                <defs>
                                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C5E063" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#8DA38B" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <XAxis
                                  dataKey="day"
                                  ticks={[1, 15, 30]}
                                  tick={{ fill: 'white', fontSize: 12 }}
                                  axisLine={{ stroke: 'white' }}
                                  tickLine={{ stroke: 'white' }}
                                />
                                <YAxis
                                  tick={{ fill: 'transparent' }} // Hide Y-axis numbers
                                  axisLine={{ stroke: 'white' }}
                                  tickLine={{ stroke: 'white' }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="val"
                                  stroke="#C5E063"
                                  strokeWidth={3}
                                  fillOpacity={1}
                                  fill="url(#colorVal)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <CalendarGrid data={moodData} />
                        )}

                        {/* Divider Line */}
                        <div className="relative w-full h-[14px] my-6">
                          <svg width="350" height="14" viewBox="0 0 350 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="6.00035" y1="7.92466" x2="343.001" y2="5.99989" stroke="url(#paint0_linear_881_1438)" strokeWidth="12" strokeLinecap="round" />
                            <defs>
                              <linearGradient id="paint0_linear_881_1438" x1="0.0412207" y1="14.4621" x2="350.041" y2="12.4621" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#A28A5B" />
                                <stop offset="0.504808" stopColor="#859B92" />
                                <stop offset="1" stopColor="#ABB579" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>

                        <div className="flex justify-center gap-4 mb-6">
                          <button
                            onClick={() => setActiveMoodSection(activeMoodSection === 'chart' ? 'calendar' : 'chart')}
                            className="px-4 py-2 rounded-full font-bold bg-primary text-gray-900 transition-colors"
                          >
                            {activeMoodSection === 'chart' ? '情绪日历' : '情绪曲线'}
                          </button>
                        </div>

                        <div className="flex justify-end">
                            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs border border-white/20 transition-colors">
                                <BarChart2 size={14} /> 情绪分析报告
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in h-full pb-4">
                        {/* Big Card */}
                        <div className="col-span-1 row-span-2 bg-olive rounded-3xl p-5 flex flex-col justify-between text-white relative overflow-hidden group shadow-lg">
                             <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity transform group-hover:rotate-12 duration-500">
                                <Star size={100} fill="currentColor" />
                             </div>
                             <div className="relative z-10 mt-8">
                                <div className="text-xs opacity-80 mb-2 font-medium tracking-wide">已连续治疗</div>
                                <div className="text-5xl font-bold text-primary tracking-tight">32 <span className="text-base text-white font-normal ml-1">天</span></div>
                             </div>
                        </div>

                        {/* Small Card 1 */}
                        <div className="bg-sage rounded-3xl p-4 flex flex-col justify-between text-white relative shadow-md">
                             <div className="flex items-center justify-between mb-4">
                                <BookOpen size={22} className="opacity-80" />
                             </div>
                             <div>
                                <div className="text-xs opacity-80 mb-1">已完成作业</div>
                                <div className="text-2xl font-bold text-primary">25 <span className="text-base text-white">次</span></div>
                             </div>
                             <button 
                                onClick={() => navigate('/timeline')}
                                className="mt-3 bg-primary text-gray-900 text-[10px] font-bold py-1.5 px-3 rounded-full w-full text-center active:scale-95 transition-transform shadow-sm"
                             >
                                查看我的作业
                             </button>
                        </div>

                        {/* Small Card 2 */}
                        <div className="bg-sage rounded-3xl p-4 flex flex-col justify-between text-white shadow-md">
                             <div className="flex items-center justify-between mb-4">
                                <BarChart2 size={22} className="opacity-80" />
                             </div>
                             <div>
                                <div className="text-xs opacity-80 mb-1">已来访</div>
                                <div className="text-2xl font-bold text-primary">4 <span className="text-base text-white">次</span></div>
                             </div>
                             <button 
                                onClick={() => navigate('/timeline')}
                                className="mt-3 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold py-1.5 px-3 rounded-full w-full text-center active:scale-95 transition-transform"
                             >
                                查看来访记录
                             </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </MobileFrame>
  );
};

export default Profile;