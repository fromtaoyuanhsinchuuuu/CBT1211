import { useEffect } from 'react';
import { Brain } from 'lucide-react';

interface SplashProps {
  onFinish: () => void;
}

export function Splash({ onFinish }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#F2F2F2]">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-[#8BA888] p-6 rounded-2xl">
            <Brain className="size-16 text-white" />
          </div>
        </div>
        <h1 className="text-3xl text-[#5C5552] mb-2">CBT治疗助手</h1>
        <p className="text-[#8B9A9E]">专业心理治疗管理工具</p>
      </div>
    </div>
  );
}
