import React, { useState } from 'react';
import '../styles/SessionRecords.css';

const SessionRecords = ({ sessions, patient }) => {
  const [sortOrder, setSortOrder] = useState('desc');

  if (!patient) {
    return <div>请选择一个患者以查看会话记录。</div>;
  }

  const patientSessions = sessions.filter(s => s.patientId === patient.id);

  const sortedSessions = [...patientSessions].sort((a, b) => {
    if (sortOrder === 'desc') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  return (
    <div className="session-records-container">
      {/* ... (build the JSX for SessionRecords based on the provided CSS and mock data) */}
      <h2>{patient.name}的会话记录</h2>
      {sortedSessions.map(session => (
        <div key={session.id} className="session-card">
          <p>日期: {session.date}</p>
          <p>时长: {session.duration}分钟</p>
          <p>笔记: {session.notes}</p>
        </div>
      ))}
    </div>
  );
};

export default SessionRecords;
