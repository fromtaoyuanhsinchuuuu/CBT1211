import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import SessionRecords from './SessionRecords';

const HomeworkCenter = () => {
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/patients').then(res => res.json()),
      fetch('http://localhost:3001/api/sessions').then(res => res.json()),
      fetch('http://localhost:3001/api/homeworks').then(res => res.json()),
    ])
    .then(([patientsData, sessionsData, homeworksData]) => {
      setPatients(patientsData);
      setSessions(sessionsData);
      setHomeworks(homeworksData);
    })
    .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <PatientList patients={patients} onSelectPatient={setSelectedPatient} />
      <SessionRecords sessions={sessions} patient={selectedPatient} />
      {/* Other components will be added here */}
    </div>
  );
};

export default HomeworkCenter;
