// imports
import express from 'express';
import * as networkDao from './network-dao.js';

// init express
const app = express();
const port = 3001;

app.get('/api/test', (req, res) => {
  res.json({ message: 'API server is working' });
});

app.get('/api/stations', async (req, res) => {
  try {
    const stations = await networkDao.getStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/lines', async (req, res) => {
  try {
    const lines = await networkDao.getLines();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/segments', async (req, res) => {
  try {
    const segments = await networkDao.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/line-stations', async (req, res) => {
  try {
    const lineStations = await networkDao.getLineStations();
    res.json(lineStations);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/network/full', async (req, res) => {
  try {
    const stations = await networkDao.getStations();
    const lines = await networkDao.getLines();
    const segments = await networkDao.getSegments();
    const lineStations = await networkDao.getLineStations();

    res.json({
      stations: stations,
      lines: lines,
      segments: segments,
      lineStations: lineStations
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});