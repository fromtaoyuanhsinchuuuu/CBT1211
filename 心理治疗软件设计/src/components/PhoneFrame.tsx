import React from 'react';
import './PhoneFrame.css';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="phone-frame-wrapper">
      <div className="phone-frame">
        <div className="phone-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

