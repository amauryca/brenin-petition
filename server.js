const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const dataFile = path.join(__dirname, 'data.json');

// Initialize data file
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ totalClicks: 0, ips: {} }, null, 2));
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Static files
  if (pathname === '/' || pathname === '/index.html') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (pathname === '/IMG_5620.jpg') {
    fs.readFile(path.join(__dirname, 'IMG_5620.jpg'), (err, data) => {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    });
    return;
  }

  // API endpoints
  if (pathname === '/api/clicks') {
    const clientIp = getClientIp(req);
    const today = new Date().toDateString();
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    if (req.method === 'GET') {
      const hasClickedToday = data.ips[clientIp]?.lastClickDate === today;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ totalClicks: data.totalClicks, hasClickedToday }));
      return;
    }

    if (req.method === 'POST') {
      if (!data.ips[clientIp]) data.ips[clientIp] = { lastClickDate: null };
      
      if (data.ips[clientIp].lastClickDate === today) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Already clicked today' }));
        return;
      }

      data.totalClicks++;
      data.ips[clientIp].lastClickDate = today;
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ totalClicks: data.totalClicks }));
      return;
    }
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
