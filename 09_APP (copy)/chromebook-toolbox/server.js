const express = require('express');
const expressWs = require('express-ws');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pty = require('node-pty');

const app = express();
expressWs(app);

app.use(express.static('public'));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ status: 'uploaded', filename: req.file.originalname });
});

// Save note endpoint
app.post('/save-note', (req, res) => {
  const filePath = `notes/note-${Date.now()}.txt`;
  fs.writeFileSync(filePath, req.body.note);
  res.json({ status: 'saved', path: filePath });
});

// Save audio recording endpoint
app.post('/save-audio', upload.single('audio'), (req, res) => {
  const dest = path.join('uploads/audio', `recording-${Date.now()}.webm`);
  fs.renameSync(req.file.path, dest);
  res.json({ status: 'audio saved', file: dest });
});

// WebSocket terminal endpoint
app.ws('/terminal', (ws) => {
  const shell = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });

  shell.on('data', (data) => ws.send(data));
  ws.on('message', (msg) => shell.write(msg));
  ws.on('close', () => shell.kill());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Toolbox v2 running at http://localhost:${PORT}`);
});
