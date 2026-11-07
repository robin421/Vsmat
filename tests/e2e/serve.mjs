// Static server for dist/ applying public/_headers (/* block + path blocks) and SPA fallback.
import http from 'http'; import fs from 'fs'; import path from 'path';
const [dist, port] = [process.argv[2], Number(process.argv[3] || 4173)];
const rules = []; let cur = null;
for (const line of fs.readFileSync(path.join(dist, '_headers'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (!/^\s/.test(line)) { cur = { pat: line.trim(), h: {} }; rules.push(cur); }
  else { const i = line.indexOf(':'); cur.h[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
}
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.woff2':'font/woff2' };
http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(dist, p);
  if (!f.startsWith(dist) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dist, 'index.html');
  for (const r of rules) { const pre = r.pat.replace('*', ''); if (r.pat === '/*' || p.startsWith(pre)) for (const [k, v] of Object.entries(r.h)) res.setHeader(k, v); }
  res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
}).listen(port, '127.0.0.1');
