import {
  ArrowLeft,
  TrendingUp,
  User,
  FileText,
  Activity,
  Phone,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Patient, Homework } from './HomeworkCenter';
import { useState } from 'react';
import './PatientDashboard.css';

interface PatientDashboardProps {
  patient: Patient;
  onBack: () => void;
  onViewHomework: (homework: Homework) => void;
}

export function PatientDashboard({ patient, onBack, onViewHomework }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const completionRate = 75;
  const cbtScore = [
    { date: '10-10', score: 45 },
    { date: '10-17', score: 42 },
    { date: '10-24', score: 38 },
  ];

  const currentHomework: Homework[] = [
    {
      id: '1',
      title: '思维记录表',
      description: '',
      aiGenerated: '',
      therapistNotes: '',
      publishDate: '2023-10-26',
      status: 'submitted',
    },
    {
      id: '2',
      title: '行为激活计划',
      description: '',
      aiGenerated: '',
      therapistNotes: '',
      publishDate: '2023-10-25',
      status: 'pending',
    },
  ];

  const historicalHomework: Homework[] = [
    {
      id: '3',
      title: '放松训练',
      description: '',
      aiGenerated: '',
      therapistNotes: '',
      publishDate: '2023-10-20',
      status: 'completed',
    },
    {
      id: '4',
      title: '认知重构',
      description: '',
      aiGenerated: '',
      therapistNotes: '',
      publishDate: '2023-10-15',
      status: 'completed',
    },
  ];

  const getStatusConfig = (status: Homework['status']) => {
    switch (status) {
      case 'pending':
        return { text: '待批阅', color: '#859B92', icon: CheckCircle2 };
      case 'submitted':
        return { text: '待提交', color: '#F2CC41', icon: Clock };
      case 'completed':
        return { text: '已完成', color: '#ABB579', icon: Activity };
      case 'overdue':
        return { text: '已逾期', color: '#A28A5B', icon: Activity };
    }
  };

  const renderHomeworkItem = (homework: Homework, index: number) => {
    const statusConfig = getStatusConfig(homework.status);
    if (!statusConfig) return null;

    const iconColors = ['#859B92', '#ABB579', '#A28A5B', '#F2CC41'];
    const iconColor = iconColors[index % iconColors.length];
    const StatusIcon = statusConfig.icon;

    return (
      <button
        key={homework.id}
        className="homework-card"
        onClick={() => onViewHomework(homework)}
      >
        <div className="homework-icon-container" style={{ backgroundColor: `${iconColor}20` }}>
          <FileText size={22} color={iconColor} strokeWidth={1.8} />
        </div>
        <div className="homework-content">
          <div className="homework-title">{homework.title}</div>
          <div className="homework-date">{homework.publishDate}</div>
        </div>
        <div className="status-badge" style={{ backgroundColor: statusConfig.color }}>
          <StatusIcon size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
          <span className="status-text">{statusConfig.text}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="homework-dashboard-page">
      <div className="page-scroller">
        {/* Header */}
        <header className="dashboard-header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft size={24} strokeWidth={1.5} />
          </button>
          <h1 className="header-title">作业情况</h1>
          <div className="header-placeholder" />
        </header>

        {/* Patient Card */}
        <section className="patient-card">
          <div className="patient-icon-container">
            <div className="patient-icon">
              <User size={42} color="#FFFFFF" strokeWidth={1.5} />
            </div>
          </div>
          <div className="patient-info">
            <div className="patient-name-row">
              <span className="patient-name">{patient.name}</span>
            </div>
            <div className="patient-details">
              <div className="detail-item">
                <div className="detail-icon-container detail-icon-gender">
                  <Users size={16} color="#FFFFFF" strokeWidth={2} />
                </div>
                <div className="detail-text-container">
                  <span className="detail-label">性别</span>
                  <span className="detail-value">未知</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon-container detail-icon-age">
                  <Calendar size={16} color="#FFFFFF" strokeWidth={2} />
                </div>
                <div className="detail-text-container">
                  <span className="detail-label">年龄</span>
                  <span className="detail-value">-</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon-container detail-icon-phone">
                  <Phone size={16} color="#FFFFFF" strokeWidth={2} />
                </div>
                <div className="detail-text-container">
                  <span className="detail-label">电话</span>
                  <span className="detail-value">-</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="stats-container">
          {/* Completion Rate */}
          <div className="stat-card left-card">
            <div className="stat-header">
              <div className="icon-badge icon-badge-primary">
                <Activity size={18} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span className="stat-title">总体完成率</span>
            </div>
            <div className="progress-circle-container">
              <div className="progress-circle">
                <span className="progress-text">{completionRate}</span>
                <span className="progress-unit">%</span>
              </div>
            </div>
          </div>

          {/* CBT Score Trend */}
          <div className="stat-card right-card">
            <div className="stat-header">
              <div className="icon-badge icon-badge-secondary">
                <TrendingUp size={18} color="#FFFFFF" strokeWidth={2.5} />
              </div>
              <span className="stat-title">CBT指标趋势</span>
            </div>
            <div className="trend-container">
              {cbtScore.map((data, index) => {
                const maxScore = 50;
                const height = (data.score / maxScore) * 90;
                const trendColors = ['#ABB579', '#A28A5B', '#F2CC41'];
                const barColor = trendColors[index % trendColors.length];
                return (
                  <div key={index} className="trend-bar-wrapper">
                    <div
                      className="trend-bar"
                      style={{ height: `${height}px`, backgroundColor: barColor }}
                      title={`${data.score}`}
                    />
                    <span className="trend-label">{data.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="tab-container">
          <button
            className={`tab ${activeTab === 'current' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('current')}
          >
            <span className={`tab-text ${activeTab === 'current' ? 'active-tab-text' : ''}`}>
              当前作业
            </span>
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className={`tab-text ${activeTab === 'history' ? 'active-tab-text' : ''}`}>
              历史作业
            </span>
          </button>
        </section>

        {/* Homework List */}
        <section className="homework-list">
          {(activeTab === 'current' ? currentHomework : historicalHomework).map((homework, index) =>
            renderHomeworkItem(homework, index)
          )}
        </section>
      </div>
    </div>
  );
}
