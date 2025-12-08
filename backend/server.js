const express = require('express');
const cors = require('cors');
const { patients, sessions, homeworks } = require('./db');

const app = express();
const port = process.env.PORT || 3001; // allow override to avoid port conflicts

app.use(cors());
app.use(express.json());

app.get('/api/patients', (req, res) => {
  res.json(patients);
});

app.get('/api/sessions', (req, res) => {
  res.json(sessions);
});

app.get('/api/homeworks', (req, res) => {
  res.json(homeworks);
});

app.post('/api/homeworks', (req, res) => {
  const newHomework = { ...req.body, id: Date.now() };
  homeworks.push(newHomework);
  res.status(201).json(newHomework);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
