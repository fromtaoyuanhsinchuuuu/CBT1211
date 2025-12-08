import { ArrowLeft, Clock, Brain, Sparkles, MessageSquare, Calendar, Star } from 'lucide-react';
import { useState } from 'react';
import { Patient, Session } from './HomeworkCenter';
import './SessionRecords.css';

interface SessionRecordsProps {
  patient: Patient;
  onBack: () => void;
  onSessionSelect: (session: Session) => void;
}

// 自定义图标组件（与PatientList保持一致）
const LeafIcon = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <path d="M12 22c-2 0-3-2-3-4s1-4 3-4c3 0 4 2 4 4s-1 4-4 4zM12 14V2"/>
  </svg>
);

export function SessionRecords({ patient, onBack, onSessionSelect }: SessionRecordsProps) {
  const [sortBy, setSortBy] = useState<'time' | 'duration' | 'starred'>('time');

  const sessions: Session[] = [
    {
      id: '1',
      date: '2023-10-26',
      duration: '50',
      emotions: ['焦虑', '低落'],
      analyzed: true,
      starred: true,
      aiSummary: 'AI分析发现与家庭关系的潜在关联，并标记了两个关键突破时刻。',
    },
    {
      id: '2',
      date: '2023-10-19',
      duration: '65',
      emotions: ['压力', '困惑'],
      analyzed: true,
      starred: false,
      aiSummary: 'AI已分析此会话，识别出与工作相关的关键情绪节点和认知模式。',
    },
    {
      id: '3',
      date: '2023-09-15',
      duration: '80',
      emotions: ['自我怀疑'],
      analyzed: true,
      starred: false,
      aiSummary: '本次会话深入探讨了工作压力源，AI识别出三种负面自动思维模式。',
    },
  ];

  // 排序逻辑
  const sortedSessions = [...sessions].sort((a, b) => {
    switch (sortBy) {
      case 'duration':
        return parseInt(b.duration || '0') - parseInt(a.duration || '0');
      case 'starred':
        return (b.starred ? 1 : 0) - (a.starred ? 1 : 0);
      case 'time':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <div className="session-records-page">
      <div className="page-content">
        {/* Header */}
        <header className="page-header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft width={28} height={28} strokeWidth={2.5} />
          </button>
          <h1 className="page-title">为 {patient.name} 选择记录</h1>
        </header>

        {/* Patient Profile Header */}
        <div className="patient-profile-header">
          <div className="patient-avatar">
            <LeafIcon />
          </div>
          <div className="patient-details">
            <div className="profile-identity">
              <div className="name">{patient.name}</div>
              <div className="patient-info-list">
                <div className="info-row">
                  <span className="info-label">性别</span>
                  <span className="info-value">女</span>
                </div>
                <div className="info-row">
                  <span className="info-label">年龄</span>
                  <span className="info-value">34</span>
                </div>
                <div className="info-row">
                  <span className="info-label">电话</span>
                  <span className="info-value">119 1688 6480</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Container */}
        <div className="stats-container">
          <div className="stat-item">
            <MessageSquare width={16} height={16} strokeWidth={2} />
            <span>共 {sessions.length} 次会话</span>
          </div>
          <div className="stat-item">
            <Calendar width={16} height={16} strokeWidth={2} />
            <span>疗程第 5 周</span>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="sorting-controls">
          <button
            className={`sort-button ${sortBy === 'time' ? 'active' : ''}`}
            onClick={() => setSortBy('time')}
          >
            <Clock width={16} height={16} strokeWidth={2} />
            <span>按时间</span>
          </button>
          <button
            className={`sort-button ${sortBy === 'duration' ? 'active' : ''}`}
            onClick={() => setSortBy('duration')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="17" y2="12"/>
              <line x1="3" y1="18" x2="9" y2="18"/>
            </svg>
            <span>按时长</span>
          </button>
          <button
            className={`sort-button ${sortBy === 'starred' ? 'active' : ''}`}
            onClick={() => setSortBy('starred')}
          >
            <Star width={16} height={16} strokeWidth={2} />
            <span>按星标</span>
          </button>
        </div>

        {/* Record List */}
        <ul className="record-list">
          {sortedSessions.map((session) => (
            <li key={session.id} className="record-item">
              <div className="record-main">
                <div className="record-icon">
                  <Star
                    width={24}
                    height={24}
                    fill={session.starred ? 'currentColor' : 'none'}
                    strokeWidth={session.starred ? 0 : 1.5}
                  />
                </div>
                <div className="record-info">
                  <div className="title">{formatDate(session.date)} 会话</div>
                  <div className="meta">
                    <Clock width={16} height={16} strokeWidth={2} />
                    <span>时长: {session.duration}分钟</span>
                  </div>
                </div>
              </div>

              {session.emotions && session.emotions.length > 0 && (
                <div className="emotion-tags">
                  {session.emotions.map((emotion, index) => (
                    <span key={index} className="tag">{emotion}</span>
                  ))}
                </div>
              )}

              {session.analyzed && session.aiSummary && (
                <p className="ai-summary">
                  <Brain width={18} height={18} strokeWidth={2} />
                  <span>{session.aiSummary}</span>
                </p>
              )}

              <button
                className="use-record-button"
                onClick={() => onSessionSelect(session)}
              >
                <Sparkles width={20} height={20} strokeWidth={2.2} />
                <span>使用此记录</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
