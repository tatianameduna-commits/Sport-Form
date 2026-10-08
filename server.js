const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ssac-admin';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'submissions.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    company_name     TEXT    NOT NULL,
    website          TEXT    NOT NULL,
    founded_year     INTEGER,
    headquarters     TEXT,
    contact_name     TEXT    NOT NULL,
    contact_title    TEXT,
    contact_email    TEXT    NOT NULL,
    contact_phone    TEXT,
    linkedin         TEXT,
    media_focus      TEXT    NOT NULL,
    one_liner        TEXT    NOT NULL,
    description      TEXT    NOT NULL,
    audience_reach   TEXT,
    funding_stage    TEXT    NOT NULL,
    money_raised     INTEGER NOT NULL,
    last_round_date  TEXT,
    lead_investors   TEXT,
    team_size        TEXT,
    revenue_stage    TEXT,
    pitch_deck_url   TEXT,
    attended_before  TEXT,
    participation    TEXT,
    notes            TEXT
  );
`);

const FIELDS = [
  'company_name', 'website', 'founded_year', 'headquarters',
  'contact_name', 'contact_title', 'contact_email', 'contact_phone', 'linkedin',
  'media_focus', 'one_liner', 'description', 'audience_reach',
  'funding_stage', 'money_raised', 'last_round_date', 'lead_investors',
  'team_size', 'revenue_stage', 'pitch_deck_url',
  'attended_before', 'participation', 'notes',
];
const REQUIRED = [
  'company_name', 'website', 'contact_name', 'contact_email',
  'media_focus', 'one_liner', 'description', 'funding_stage', 'money_raised',
];

const insert = db.prepare(`
  INSERT INTO submissions (${FIELDS.join(', ')})
  VALUES (${FIELDS.map((f) => '@' + f).join(', ')})
`);

function clean(body) {
  const row = {};
  for (const f of FIELDS) {
    let v = body[f];
    if (Array.isArray(v)) v = v.join(', ');
    v = v == null ? '' : String(v).trim().slice(0, 5000);
    row[f] = v === '' ? null : v;
  }
  if (row.money_raised != null) {
    const n = Number(String(row.money_raised).replace(/[$,\s]/g, ''));
    row.money_raised = Number.isFinite(n) && n >= 0 ? Math.round(n) : NaN;
  }
  if (row.founded_year != null) {
    const y = parseInt(row.founded_year, 10);
    row.founded_year = Number.isFinite(y) ? y : null;
  }
  return row;
}

function validate(row) {
  const errors = [];
  for (const f of REQUIRED) if (row[f] == null) errors.push(`${f} is required`);
  if (Number.isNaN(row.money_raised)) errors.push('money_raised must be a dollar amount');
  if (row.contact_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.contact_email)) {
    errors.push('contact_email is not a valid email');
  }
  return errors;
}

function requireAdmin(req, res, next) {
  const [scheme, encoded] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Basic' && encoded) {
    const pass = Buffer.from(encoded, 'base64').toString().split(':').slice(1).join(':');
    const a = Buffer.from(pass);
    const b = Buffer.from(ADMIN_PASSWORD);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="SSAC Startup Admin"').status(401).send('Authentication required');
}

function csvCell(v) {
  if (v == null) return '';
  const s = String(v);
  // Neutralize spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return '"' + safe.replace(/"/g, '""') + '"';
}

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.post('/api/submissions', (req, res) => {
  const row = clean(req.body || {});
  const errors = validate(row);
  if (errors.length) return res.status(400).json({ ok: false, errors });
  const result = insert.run(row);
  res.status(201).json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/api/submissions', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC, id DESC').all();
  const stats = db.prepare(`
    SELECT COUNT(*) AS count,
           COALESCE(SUM(money_raised), 0) AS total_raised,
           COALESCE(AVG(money_raised), 0) AS avg_raised
    FROM submissions
  `).get();
  res.json({ rows, stats });
});

app.delete('/api/submissions/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: result.changes > 0 });
});

app.get('/api/submissions.csv', requireAdmin, (req, res) => {
  const cols = ['id', 'created_at', ...FIELDS];
  const rows = db.prepare('SELECT * FROM submissions ORDER BY id').all();
  const lines = [cols.join(',')].concat(rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')));
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="ssac-media-startups.csv"');
  res.send(lines.join('\n'));
});

app.use(express.static(path.join(__dirname, 'public'), { index: 'index.html' }));

app.listen(PORT, () => {
  console.log(`SSAC startup form running at http://localhost:${PORT}`);
  console.log(`Admin dashboard at http://localhost:${PORT}/admin`);
});
