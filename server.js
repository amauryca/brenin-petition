const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const dataFile = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ totalClicks: 0, ips: {} }, null, 2));
}

// Get user's IP address
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
         req.socket.remoteAddress || 
         'unknown';
}

// Get current click count
app.get('/api/clicks', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const clientIp = getClientIp(req);
    const today = new Date().toDateString();
    
    const hasClickedToday = data.ips[clientIp]?.lastClickDate === today;
    
    res.json({
      totalClicks: data.totalClicks,
      hasClickedToday: hasClickedToday,
      clientIp: clientIp
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Record a click
app.post('/api/clicks', (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const today = new Date().toDateString();
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    // Initialize IP record if it doesn't exist
    if (!data.ips[clientIp]) {
      data.ips[clientIp] = { lastClickDate: null };
    }
    
    // Check if this IP already clicked today
    if (data.ips[clientIp].lastClickDate === today) {
      return res.status(403).json({ error: 'This IP has already clicked today' });
    }
    
    // Increment counter and update IP record
    data.totalClicks++;
    data.ips[clientIp].lastClickDate = today;
    
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.json({
      totalClicks: data.totalClicks,
      clientIp: clientIp,
      message: 'Click recorded'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record click' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
