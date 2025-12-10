import React from 'react';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  title?: string;
  showProfile?: boolean;
  onBack?: () => void;
  className?: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ 
  title, 
  showProfile = false, 
  onBack,
  className = ""
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`relative flex items-center justify-between px-4 pt-14 pb-2 z-20 ${className}`}>
      <button onClick={handleBack} className="p-2 rounded-full hover:bg-black/5 transition-colors">
        <ArrowLeft size={28} className="text-gray-800" />
      </button>
      
      {title && (
        <div className="absolute left-1/2 top-1/2 pt-6 -translate-x-1/2 -translate-y-1/2 font-bold text-lg text-gray-800">
          {title}
        </div>
      )}

      {showProfile ? (
        <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-black/5 transition-colors">
          <UserIcon size={28} className="text-gray-800" />
        </button>
      ) : (
        <div className="w-11" /> // Spacer to balance layout
      )}
    </div>
  );
};