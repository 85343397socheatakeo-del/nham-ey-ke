const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const SAMPLES_DIR = path.join(__dirname, 'samples');
const INBOX_FILE = path.join(__dirname, 'inbox_store.json');
const DATA_FILE = path.join(__dirname, 'recipes_store.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8'
};

// Initial Inbox Seed
function getInboxStore() {
  if (fs.existsSync(INBOX_FILE)) {
    try {
      const data = fs.readFileSync(INBOX_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading inbox store:', e);
    }
  }

  const seed = [
    {
      id: "msg-1",
      sender: "រៀមច្បង សុខា (DMC Year 4)",
      avatarColor: "#E63946",
      subject: {
        kh: "គន្លឹះទិញម្ហូបនៅផ្សារជិតសាលា",
        en: "Tips for Market Shopping Near Campus"
      },
      preview: {
        kh: "សួស្តីប្អូនៗ! ទៅផ្សារម៉ោង ៦ល្ងាច បន្លែ និងសាច់លក់បញ្ចុះតម្លៃច្រើន...",
        en: "Hello junior students! Visiting the market around 6:00 PM gets you great vegetable discounts..."
      },
      body: {
        kh: "សួស្តីប្អូនៗនិស្សិតទាំងអស់គ្នា! សម្រាប់អ្នកដែលនៅបន្ទប់ជួលជិតសាលា បើចង់សន្សំលុយ ចូរទៅផ្សារចន្លោះម៉ោង ៥:៣០ ដល់ ៦:៣០ ល្ងាច។ មីងៗលក់បន្លែ និងត្រី តែងតែលក់ថែម ឬលក់ឡាយឡុងក្នុងតម្លៃត្រឹមពាក់កណ្តាល ជួយឱ្យយើងសន្សំបានច្រើនសម្រាប់ទិញសៀវភៅរៀន!",
        en: "Hello fellow university students! If you are staying in a rented dorm room near campus and want to save budget, try hitting local markets between 5:30 PM and 6:30 PM. Vendors often discount fresh herbs, greens, and produce at half price before closing up!"
      },
      date: "2026-10-21 17:30",
      unread: true
    },
    {
      id: "msg-2",
      sender: "ក្រុមការងារ ញ៉ាំអីគេ (Nham Ey Ke Team)",
      avatarColor: "#2A9D8F",
      subject: {
        kh: "ស្វាគមន៍មកកាន់ Prototype V1!",
        en: "Welcome to Prototype Version 1!"
      },
      preview: {
        kh: "សូមស្វាគមន៍និស្សិតទាំងអស់គ្នា! អ្នកអាចស្វែងរកមុខម្ហូប និងផ្ញើសំណួរមកកាន់ពួកយើង...",
        en: "Welcome university students! You can search recipes and submit your cooking questions right here..."
      },
      body: {
        kh: "សូមស្វាគមន៍មកកាន់កំណែ Prototype ទី ១ នៃគេហទំព័រ «ញ៉ាំអីគេ? Nham Ey Ke»។ គោលបំណងរបស់យើងគឺចង់ជួយនិស្សិតសាកលវិទ្យាល័យកម្ពុជាឱ្យចេះធ្វើម្ហូបញ៉ាំដោយខ្លួនឯង កាត់បន្ថយការញ៉ាំមីកញ្ចប់ ឬអាហារកែច្នៃ Ultra-processed foods និងទទួលបានសុខភាពល្អ!",
        en: "Welcome to Version 1 prototype of 'Nham Ey Ke?'! Our mission is to empower Cambodian university students to cook delicious, budget-conscious real food, reducing reliance on instant noodles and ultra-processed takeout."
      },
      date: "2026-10-21 12:00",
      unread: false
    }
  ];
  saveInboxStore(seed);
  return seed;
}

function saveInboxStore(msgs) {
  try {
    fs.writeFileSync(INBOX_FILE, JSON.stringify(msgs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving inbox store:', e);
  }
}

// Recipes and App Data Store
function getDataStore() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading recipes store:', e);
    }
  }

  // Fallback to data.js exported object
  try {
    const rawCode = fs.readFileSync(path.join(PUBLIC_DIR, 'data.js'), 'utf-8');
    const sandbox = { module: {}, window: {} };
    const fn = new Function('module', 'window', rawCode + '\nreturn NHAM_DATA;');
    const defaultData = fn(sandbox.module, sandbox.window);
    saveDataStore(defaultData);
    return defaultData;
  } catch (e) {
    console.error('Error parsing default data:', e);
    return null;
  }
}

function saveDataStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving recipes store:', e);
  }
}

// Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint: /api/inbox (GET)
  if (pathname === '/api/inbox' && req.method === 'GET') {
    const msgs = getInboxStore();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(msgs));
    return;
  }

  // API Endpoint: /api/inbox (POST)
  if (pathname === '/api/inbox' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newMsg = JSON.parse(body);
        const msgs = getInboxStore();
        msgs.unshift(newMsg);
        saveInboxStore(msgs);
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: newMsg }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // API Endpoint: /api/data (GET)
  if (pathname === '/api/data' && req.method === 'GET') {
    const data = getDataStore();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
    return;
  }

  // API Endpoint: /api/data (POST) - Saves modified recipes and app info
  if (pathname === '/api/data' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updatedData = JSON.parse(body);
        saveDataStore(updatedData);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Data updated successfully' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // API Endpoint: /api/reset-data (POST) - Restores default data
  if (pathname === '/api/reset-data' && req.method === 'POST') {
    try {
      if (fs.existsSync(DATA_FILE)) {
        fs.unlinkSync(DATA_FILE);
      }
      const defaultData = getDataStore();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, data: defaultData }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API Endpoint: /api/upload-image (POST) - Upload custom photo
  if (pathname === '/api/upload-image' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { filename, base64 } = payload;
        if (!filename || !base64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing filename or base64 data' }));
          return;
        }

        const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        fs.writeFileSync(path.join(PUBLIC_DIR, 'samples', cleanName), buffer);
        fs.writeFileSync(path.join(SAMPLES_DIR, cleanName), buffer);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: `/samples/${cleanName}` }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let relativePath = pathname === '/' ? '/index.html' : pathname;
  let targetPath = path.join(PUBLIC_DIR, relativePath);

  // Fallback to samples directory if requested
  if (pathname.startsWith('/samples/')) {
    const sampleRel = pathname.replace('/samples/', '');
    const sampleCandidate = path.join(SAMPLES_DIR, sampleRel);
    if (fs.existsSync(sampleCandidate)) {
      targetPath = sampleCandidate;
    }
  }

  // Security check: prevent directory traversal
  const normalizedPath = path.normalize(targetPath);
  if (!normalizedPath.startsWith(PUBLIC_DIR) && !normalizedPath.startsWith(SAMPLES_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Check file exists
  fs.stat(targetPath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (pathname.indexOf('.') === -1) {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        fs.readFile(indexPath, (readErr, content) => {
          if (readErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🍲 NHAM EY KE (ញ៉ាំអីគេ) - Prototype Version 1`);
  console.log(`🚀 Running at: http://localhost:${PORT}`);
  console.log(`✏️ Live In-App Editing Enabled on http://localhost:${PORT}`);
  console.log(`📱 Optimized for University Students & Phone Viewports`);
  console.log(`=======================================================`);
});
