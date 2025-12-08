import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import './AuraNotification.css';

interface AuraNotificationProps {
  visible: boolean;
  type: 'published' | 'withdrawn';
  onUndo?: () => void;
}

export function AuraNotification({ visible, type, onUndo }: AuraNotificationProps) {
  if (!visible) return null;

  const isPublished = type === 'published';

  return (
    <div className={`aura-notification ${visible ? 'visible' : ''}`}>
      <div className="aura-icon">
        <CheckCircle2 className="size-5" strokeWidth={2.5} />
      </div>
      <div className="aura-text">
        <div className="title">{isPublished ? '作业已发布成功' : '已撤回本次发布'}</div>
        <div className="subtitle">
          {isPublished ? '患者将收到新作业的提醒' : '作业已从患者端移除'}
        </div>
      </div>
      {isPublished && onUndo && (
        <div className="aura-action">
          <button className="undo-button" onClick={onUndo}>
            撤回
          </button>
        </div>
      )}
    </div>
  );
}

