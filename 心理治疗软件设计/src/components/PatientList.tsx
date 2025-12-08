import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Patient } from './HomeworkCenter';
import './PatientList.css';

interface PatientListProps {
  onBack: () => void;
  onPatientSelect: (patient: Patient) => void;
  title: string;
}

// 自定义图标组件
const LeafIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <path d="M12 22c-2 0-3-2-3-4s1-4 3-4c3 0 4 2 4 4s-1 4-4 4zM12 14V2"/>
  </svg>
);

const SunIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="m4.93 4.93 1.41 1.41"/>
    <path d="m17.66 17.66 1.41 1.41"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="m6.34 17.66-1.41 1.41"/>
    <path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

const MountainIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
  </svg>
);

const WavesIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <path d="M3 12c.7-4.5 4.1-8 9-8 .9 0 1.8.1 2.6.4m1.3 1.1A8.9 8.9 0 0121 12M3 12c-1.4 0-2.6.4-3.5 1.1M21 12c1.4 0 2.6.4 3.5 1.1M6 16.5c1-1 2-1.5 3.5-1.5s2.5.5 3.5 1.5c1-1 2-1.5 3.5-1.5s2.5.5 3.5 1.5"/>
  </svg>
);

// 图标映射
const avatarIcons = [
  LeafIcon,
  SunIcon,
  MountainIcon,
  WavesIcon,
  LeafIcon, // 如果超过4个患者，循环使用
];

export function PatientList({ onBack, onPatientSelect, title }: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const patients: Patient[] = [
    { id: '1', name: '张三', lastSession: '2023-10-26', avatar: '张' },
    { id: '2', name: '李四', lastSession: '2023-10-25', avatar: '李' },
    { id: '3', name: '王五', lastSession: '2023-10-24', avatar: '王' },
    { id: '4', name: '赵六', lastSession: '2023-10-23', avatar: '赵' },
    { id: '5', name: '陈七', lastSession: '2023-10-22', avatar: '陈' },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="patient-list-page">
      <div className="page-content">
        {/* Header */}
        <header className="header">
          <button onClick={onBack} className="back-button">
            <ArrowLeft width={28} height={28} strokeWidth={2.5} />
          </button>
          <div className="header-title-container">
            <h1 className="title">{title}</h1>
          </div>
        </header>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <Search width={20} height={20} strokeWidth={2} />
            <input
              type="text"
              placeholder="搜索患者姓名"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Patient List */}
        <ul className="patient-list">
          {filteredPatients.map((patient, index) => {
            const AvatarIcon = avatarIcons[index % avatarIcons.length];
            return (
              <li
                key={patient.id}
                className="patient-item"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="patient-avatar">
                  <AvatarIcon />
                </div>
                <div className="patient-info">
                  <div className="name">{patient.name}</div>
                  <div className="last-session">上次咨询: {patient.lastSession}</div>
                </div>
                <div className="arrow-icon">
                  <ChevronRight width={24} height={24} strokeWidth={2} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
