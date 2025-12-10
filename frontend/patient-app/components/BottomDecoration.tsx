import React from 'react';

const BottomDecoration: React.FC = () => {
  return (
    <div className="relative w-full h-[330px] overflow-hidden pointer-events-none">
      {/* Background Circle */}
      <svg className="absolute bottom-0 w-full" preserveAspectRatio="none" viewBox="0 0 412 314" xmlns="http://www.w3.org/2000/svg">
        <circle cx="206" cy="314" fill="#859B92" r="314"></circle>
      </svg>

      {/* Foreground Graphics */}
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
        
        {/* Dotted Line */}
        <path d="M470.5 314C470.5 243.85 442.633 176.574 393.03 126.97C343.427 77.367 276.15 49.5001 206 49.5" fill="none" stroke="#A28A5B" strokeDasharray="20 20" strokeWidth="12"></path>
        
        {/* Glowing Yellow Element */}
        <g filter="url(#glow)">
          <path d="M206 27C218.703 27 229 37.2975 229 50C229 62.7025 218.703 73 206 73C195.535 73 186.703 66.0101 183.916 56.4443C123.449 61.6269 66.4583 87.9675 23.2129 131.213C-25.2652 179.691 -52.5 245.442 -52.5 314H-64.5C-64.5 242.259 -36.001 173.456 14.7275 122.728C60.169 77.2861 120.114 49.6823 183.682 44.4219C186.175 34.4143 195.221 27 206 27Z" fill="#F2CC41"></path>
        </g>
        
        {/* Small Details */}
        <path d="M205.208 37.2941C205.488 36.7521 206.262 36.7521 206.542 37.2941L208.77 41.6194C208.938 41.9451 209.316 42.1019 209.665 41.9903L214.3 40.5075C214.88 40.3217 215.428 40.8697 215.242 41.4504L213.76 46.0846C213.648 46.4335 213.805 46.8121 214.131 46.9799L218.456 49.2083C218.998 49.4875 218.998 50.2625 218.456 50.5417L214.131 52.7701C213.805 52.9379 213.648 53.3165 213.76 53.6654L215.242 58.2996C215.428 58.8803 214.88 59.4283 214.3 59.2425L209.665 57.7597C209.316 57.6481 208.938 57.8049 208.77 58.1306L206.542 62.4559C206.262 62.9979 205.488 62.9979 205.208 62.4559L202.98 58.1306C202.812 57.8049 202.434 57.6481 202.085 57.7597L197.45 59.2425C196.87 59.4283 196.322 58.8803 196.508 58.2996L197.99 53.6654C198.102 53.3165 197.945 52.9379 197.619 52.7701L193.294 50.5417C192.752 50.2625 192.752 49.4875 193.294 49.2083L197.619 46.9799C197.945 46.8121 198.102 46.4335 197.99 46.0846L196.508 41.4504C196.322 40.8697 196.87 40.3217 197.45 40.5075L202.085 41.9903C202.434 42.1019 202.812 41.9451 202.98 41.6194L205.208 37.2941Z" fill="#A28A5B"></path>
      </svg>
      
      {/* Stats Text */}
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
  );
};

export default BottomDecoration;