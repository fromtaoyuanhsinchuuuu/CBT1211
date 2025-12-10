import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFrame } from '../components/MobileFrame';
import { NavigationHeader } from '../components/NavigationHeader';
import { Plus } from 'lucide-react';
import { submitHomework } from '../services/api';

const TaskSubmission: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('請先填寫作業內容');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await submitHomework({
        patientId: 1, // TODO: 接上登入後改為實際患者 ID
        title: '今日作業',
        description: '患者端提交',
        content,
      });
      setSuccess(true);
      setContent('');
    } catch (e: any) {
      setError(e?.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen bg-bg-light flex flex-col">
        <NavigationHeader className="mb-2" />
        
        {/* Header Visual */}
        <div className="flex flex-col items-center justify-center -mt-6 mb-6 relative">
             {/* Starburst */}
             <div className="relative w-32 h-32 flex items-center justify-center">
               <svg viewBox="0 0 100 100" className="absolute w-full h-full text-primary fill-current animate-pulse-slow">
                 <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
               </svg>
               <h1 className="relative z-10 text-xl font-bold text-gray-800 pt-2">今日作业</h1>
             </div>
             <p className="px-10 text-center text-sm text-gray-600 leading-relaxed mt-2">
                在晚餐后与全家人进行一次十分钟的日常分享聊天，并通过日记的形式记录下来。
             </p>
        </div>

        {/* Input Area (Khaki Card) */}
        <div className="flex-1 bg-khaki rounded-t-[2.5rem] p-8 flex flex-col relative shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <h2 className="text-white text-lg font-medium mb-4">我的作业</h2>
            
            {/* Lined Paper Effect Input */}
            <div className="flex-1 space-y-8 relative">
                <textarea 
                    className="w-full bg-transparent border-none text-white placeholder-white/50 text-base focus:ring-0 resize-none leading-[3rem] p-0"
                    placeholder="点击输入文字"
                    style={{ 
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 47px, rgba(255,255,255,0.3) 48px)',
                        lineHeight: '48px',
                        backgroundAttachment: 'local'
                    }}
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* Image Upload Placeholder */}
            <div className="bg-bg-light rounded-2xl h-32 mt-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors">
                <Plus size={40} className="text-khaki" />
                <span className="text-xs text-gray-400 mt-2">点击上传图片</span>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-4 mt-8">
                <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-primary text-gray-800 font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                >
                {submitting ? '提交中...' : '提交作业'}
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-sage text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                    保存进度
                </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-200">{error}</p>}
            {success && <p className="mt-4 text-sm text-white">已提交至後端！</p>}
        </div>

      </div>
    </MobileFrame>
  );
};

export default TaskSubmission;