// Static file server for the exploration folder + an endpoint that accepts the
// traced logo geometry and writes it to disk.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = 'D:/项目评估系统/co-ai-portal/ai-eval-portal';
const PORT = 8940;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json'
};

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/save-trace') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const out = path.join(ROOT, 'brand-exploration', 'traced.json');
      fs.writeFileSync(out, body, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('saved ' + body.length + ' bytes');
    });
    return;
  }

  const u = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, u === '/' ? '/index.html' : u);
  if (!path.resolve(file).startsWith(path.resolve(ROOT))) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log('listening on ' + PORT));
