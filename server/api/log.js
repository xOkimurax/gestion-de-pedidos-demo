// Simple logging endpoint
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const router = express.Router();

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure log directory exists
const logDir = join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

router.post('/log', (req, res) => {
  const { level, message, timestamp, url, userAgent } = req.body;
  
  // Format the log entry
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${url}] [${userAgent}] ${message}\n`;
  
  // Write to a log file
  const logFile = join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
      return res.status(500).json({ error: 'Failed to write log' });
    }
    
    // Also output to console for immediate visibility
    console.log(logEntry);
    
    res.status(200).json({ success: true });
  });
});

export default router;