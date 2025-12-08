import React, { useState } from 'react';
import '../styles/PatientList.css';

// ... (keep the SVG icon components)

const PatientList = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patient-list-container">
      <header className="patient-list-header">
        <h1 className="patient-list-title">患者列表</h1>
        <div className="patient-list-actions">
          <div className="search-bar">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="搜索患者"
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-patient-btn">
            <PlusIcon className="add-patient-icon" />
            <span>添加新患者</span>
          </button>
        </div>
      </header>
      <main className="patient-list-content">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="patient-card" onClick={() => onSelectPatient(patient)}>
            {/* ... (rest of the patient card JSX) */}
          </div>
        ))}
      </main>
    </div>
  );
};

// ... (keep the rest of the existing code in PatientList.tsx)

export default PatientList;
