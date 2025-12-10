import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="relative w-full h-40">
      {/* Green Curved Background */}
      <div 
        className="absolute top-0 left-0 w-full h-32 bg-olive-green" 
        style={{ clipPath: 'ellipse(150% 70% at 50% 30%)' }}
      ></div>

      <div className="relative z-10 pt-16 px-4">
        <div className="flex justify-between items-center text-gray-800">
          <span className="material-symbols-outlined text-3xl cursor-pointer">arrow_back</span>
          
          {/* Central Title/Logo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-[124px] h-[124px]">
            <svg 
              className="absolute" 
              fill="none" 
              height="124" 
              viewBox="0 0 124 124" 
              width="124" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M124 61.6482C124 72.8687 120.346 84.819 111.451 92.4284C102.556 100.038 90.7282 104.288 78.4907 104.288C72.8596 104.288 66.9015 106.184 62 110.596C57.0985 106.184 51.1404 104.288 45.5093 104.288C33.2718 104.288 21.4443 100.038 12.5492 92.4284C3.65406 84.819 0 72.8687 0 61.6482C0 50.4278 3.65406 38.4775 12.5492 30.8681C21.4443 23.2587 33.2718 19.0088 45.5093 19.0088C51.1404 19.0088 57.0985 17.1132 62 12.7011C66.9015 17.1132 72.8596 19.0088 78.4907 19.0088C90.7282 19.0088 102.556 23.2587 111.451 30.8681C120.346 38.4775 124 50.4278 124 61.6482Z" 
                fill="#ABB579"
              />
            </svg>
            <span className="relative text-[#333333] text-[16px] tracking-[.01em] pt-[62px] font-bold">
              我的作业
            </span>
          </div>
          
          <span className="material-symbols-outlined text-3xl cursor-pointer">person</span>
        </div>
      </div>
    </header>
  );
};

export default Header;