// client.js
const socket = io();

// Simple helpers
const $ = id => document.getElementById(id);

let map = L.map('map').setView([26.85,80.95], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);

let pickupMarker = null, dropMarker = null, routeLayer = null;
let pickup = null, drop = null, currentBooking = null;

async function nominatim(q){
  if(!q) return [];
  const url = `/api/autocomplete?q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url);
    return await res.json();
  } catch(e) {
    console.warn('nominatim proxy failed', e);
    return [];
  }
}

// Simple autocomplete: pick first suggestion when user leaves field
async function attachAuto(id, setter){
  const el = $(id);
  el.addEventListener('blur', async ()=> {
    const q = el.value.trim();
    if(!q) return;
    const list = await nominatim(q);
    if(list && list.length) {
      const choice = list[0];
      setter({ name: choice.name, lat: choice.lat, lon: choice.lon });
      el.value = choice.name;
      return;
    } else {
      // no suggestion: try parse as coords
      const m = q.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
      if(m){
        setter({ name: q, lat: parseFloat(m[1]), lon: parseFloat(m[2]) });
      }
    }
  });
}

attachAuto('pickup', val => { pickup = val; setPickupMarker(); });
attachAuto('drop', val => { drop = val; setDropMarker(); });

function setPickupMarker(){
  if(pickupMarker) map.removeLayer(pickupMarker);
  if(!pickup) return;
  pickupMarker = L.marker([pickup.lat, pickup.lon]).addTo(map).bindPopup('Pickup').openPopup();
  map.setView([pickup.lat, pickup.lon], 13);
}
function setDropMarker(){
  if(dropMarker) map.removeLayer(dropMarker);
  if(!drop) return;
  dropMarker = L.marker([drop.lat, drop.lon]).addTo(map).bindPopup('Drop').openPopup();
  if(!pickup) map.setView([drop.lat, drop.lon], 13);
}

document.getElementById('useLocation').addEventListener('click', ()=>{
  if(!navigator.geolocation) return alert('Geolocation not supported.');
  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude, lon = pos.coords.longitude;
    pickup = { name: 'Current location', lat, lon };
    $('pickup').value = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    setPickupMarker();
  }, err => alert('Could not get location: ' + err.message));
});

// Search route (estimate)
document.getElementById('searchRoute').addEventListener('click', async ()=>{
  if(!pickup || !drop) return alert('Select pickup and drop (type and leave field to auto-select).');
  try {
    const res = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({ pickup, drop })
    });
    const data = await res.json();
    if(data.error) return alert(data.error);
    $('estimateBox').textContent = `Distance ${data.distance_km} km · ETA ${data.duration_min} min · Fare ₹${data.fare}`;
    $('bookRide').style.display = 'block';
    drawRouteOnMap(pickup, drop);
    // store last estimate
    window._lastEstimate = data;
  } catch (e) {
    alert('Estimate failed');
    console.error(e);
  }
});

// Book ride
document.getElementById('bookRide').addEventListener('click', async ()=>{
  const phone = $('phone').value.trim();
  if(!phone) return alert('Enter phone number');
  if(!window._lastEstimate) return alert('Estimate first');
  const payload = {
    phone,
    pickup,
    drop,
    distance_km: window._lastEstimate.distance_km,
    duration_min: window._lastEstimate.duration_min,
    fare: window._lastEstimate.fare
  };
  const res = await fetch('/api/bookings', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
  const data = await res.json();
  if(data.error) return alert(data.error);
  currentBooking = data;
  showActiveTrip(data);
  // hide booking UI
  document.getElementById('bookRide').style.display='none';
  $('estimateBox').textContent = 'Booked — driver assigned';
});

// End trip: request server to delete booking
async function endTrip(){
  if(!currentBooking || !currentBooking.id) return;
  await fetch(`/api/bookings/${currentBooking.id}/end`, { method:'POST' });
  currentBooking = null;
  clearActiveTrip();
}

function showActiveTrip(b){
  const box = $('activeBox');
  box.style.display = 'block';
  box.innerHTML = `
    <b>Active Trip</b><br>
    Phone: ${b.phone}<br>
    From: ${b.pickup.name}<br>
    To: ${b.drop.name}<br>
    Fare: ₹${b.fare}<br>
    Distance: ${b.distance_km} km<br>
    Driver: ${b.driver.name} (${b.driver.id}), ETA ${b.driver.eta_min} min<br>
    <button id="endNow">End Trip</button>
  `;
  $('endNow').addEventListener('click', () => {
    endTrip();
  });
}

function clearActiveTrip(){
  $('activeBox').style.display = 'none';
  $('estimateBox').textContent = 'No estimate';
  // remove markers/route
  if(pickupMarker) { map.removeLayer(pickupMarker); pickupMarker=null; }
  if(dropMarker) { map.removeLayer(dropMarker); dropMarker=null; }
  if(routeLayer) { map.removeLayer(routeLayer); routeLayer=null; }
  pickup = drop = null;
  $('pickup').value = '';
  $('drop').value = '';
  $('phone').value = '';
}

// draw simple route using OSRM route geometry (we used overview=false in server; here request geometry)
async function drawRouteOnMap(pick, d){
  try {
    const coords = `${pick.lon},${pick.lat};${d.lon},${d.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();
    if(!json.routes || !json.routes.length) return;
    const geo = json.routes[0].geometry;
    if(routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.geoJSON(geo).addTo(map);
    // Fit bounds
    const bounds = routeLayer.getBounds();
    map.fitBounds(bounds, { padding: [30,30] });
  } catch(e) {
    console.warn('draw route failed', e);
  }
}

// Socket listeners for multi-user demo
socket.on('booking_created', (data) => {
  console.log('booking_created', data);
  // optionally show notifications for other users
});
socket.on('booking_ended', (data) => {
  console.log('booking_ended', data);
});
