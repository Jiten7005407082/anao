// server.js
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- Simple SQLite DB ----
const DB_PATH = path.join(__dirname, 'db.sqlite3');
const db = new sqlite3.Database(DB_PATH);

// create bookings table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT,
    pickup_name TEXT,
    pickup_lat REAL,
    pickup_lon REAL,
    drop_name TEXT,
    drop_lat REAL,
    drop_lon REAL,
    fare INTEGER,
    distance_km REAL,
    duration_min REAL,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// ---- Config ----
const OSRM_BASE = 'https://router.project-osrm.org'; // public demo OSRM server
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

// Fare settings
const BASE_FARE = 20;    // ₹
const PER_KM = 10;       // ₹ per km

// ---- Helper: geocode (Nominatim) ----
async function nominatimSearch(q) {
  const url = `${NOMINATIM_BASE}/search`;
  const res = await axios.get(url, {
    params: { q, format: 'jsonv2', limit: 5, addressdetails: 0 },
    headers: { 'User-Agent': 'mini-jugnoo-demo/1.0 (test@example.com)' }
  });
  return res.data; // array
}

// ---- Helper: route via OSRM ----
async function osrmRoute(pick, drop) {
  // pick/drop are [lon,lat]
  const coords = `${pick[0]},${pick[1]};${drop[0]},${drop[1]}`;
  const url = `${OSRM_BASE}/route/v1/driving/${coords}`;
  const res = await axios.get(url, { params: { overview: 'false', alternatives: false, steps: false }});
  if (!res.data.routes || !res.data.routes.length) throw new Error('No route');
  const r = res.data.routes[0];
  return { distance_m: r.distance, duration_s: r.duration };
}

// ---- API: autocomplete (proxy to Nominatim) ----
app.get('/api/autocomplete', async (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.json([]);
  try {
    const data = await nominatimSearch(q);
    // Map to {display_name, lat, lon}
    const out = data.map(d => ({ id: d.place_id, name: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
    res.json(out);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'geocode error' });
  }
});

// ---- API: estimate fare (client calls with pickup/drop coords or place names) ----
app.post('/api/estimate', async (req, res) => {
  try {
    const { pickup, drop } = req.body; // expect { lat, lon, name } each
    if (!pickup || !drop) return res.status(400).json({ error: 'pickup & drop required' });

    const p = [pickup.lon, pickup.lat];
    const d = [drop.lon, drop.lat];
    const r = await osrmRoute(p, d);
    const km = r.distance_m / 1000;
    const duration_min = Math.round(r.duration_s / 60);
    const fare = Math.max(BASE_FARE, Math.round(BASE_FARE + PER_KM * km));
    res.json({ distance_km: +km.toFixed(3), duration_min, fare });
  } catch (err) {
    console.error('estimate error', err.message);
    res.status(500).json({ error: 'route error' });
  }
});

// ---- API: create booking (book ride) ----
app.post('/api/bookings', async (req, res) => {
  try {
    const { phone, pickup, drop, distance_km, duration_min, fare } = req.body;
    if (!phone || !pickup || !drop) return res.status(400).json({ error: 'missing fields' });

    // Simulate driver assignment
    const driver = {
      id: `DRV${Math.floor(1000 + Math.random() * 9000)}`,
      name: ['Rakesh','Suresh','Priya','Asha'][Math.floor(Math.random()*4)],
      vehicle: 'E-Rickshaw',
      eta_min: Math.max(1, Math.round(Math.random()*6))
    };

    const stmt = db.prepare(`INSERT INTO bookings
      (phone,pickup_name,pickup_lat,pickup_lon,drop_name,drop_lat,drop_lon,fare,distance_km,duration_min,status)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
    stmt.run(
      phone,
      pickup.name,
      pickup.lat,
      pickup.lon,
      drop.name,
      drop.lat,
      drop.lon,
      fare,
      distance_km,
      duration_min,
      'active',
      function(err) {
        if (err) { console.error(err); return res.status(500).json({ error: 'db error' }); }
        const bookingId = this.lastID;
        const payload = { id: bookingId, phone, pickup, drop, fare, distance_km, duration_min, status: 'active', driver };
        // emit to sockets (simple)
        io.emit('booking_created', payload);
        res.json(payload);
      }
    );
    stmt.finalize();
  } catch (err) {
    console.error('book error', err.message);
    res.status(500).json({ error: 'create error' });
  }
});

// ---- API: get active bookings (for monitoring) ----
app.get('/api/bookings/active', (req, res) => {
  db.all(`SELECT * FROM bookings WHERE status='active' ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'db error' });
    res.json(rows);
  });
});

// ---- API: end trip (delete booking) ----
app.post('/api/bookings/:id/end', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid id' });
  db.run(`DELETE FROM bookings WHERE id=?`, [id], function(err) {
    if (err) { console.error(err); return res.status(500).json({ error: 'db error' }); }
    io.emit('booking_ended', { id });
    res.json({ ok: true });
  });
});

// ---- Socket.IO (basic) ----
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// ---- SPA fallback ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- start ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
