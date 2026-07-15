import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../logs');
const AUDIT_FILE = path.join(LOG_DIR, 'audit.jsonl');

/**
 * Middleware that logs important mutating requests to an audit log.
 * Only records POST/PATCH/DELETE with authenticated users.
 */
export const auditLog = (req, res, next) => {
  const method = req.method;
  if (!['POST', 'PATCH', 'DELETE'].includes(method)) return next();

  res.on('finish', () => {
    if (!req.user) return;
    const entry = {
      userId: req.user._id,
      method,
      path: req.path,
      status: res.statusCode,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };
    try {
      if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
      fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n');
    } catch { /* best effort */ }
  });

  next();
};
