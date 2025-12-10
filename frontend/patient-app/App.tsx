import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import TaskSubmission from './pages/TaskSubmission';
import TaskRecord from './pages/TaskRecord';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/submission" element={<TaskSubmission />} />
        <Route path="/record" element={<TaskRecord />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;