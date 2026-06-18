const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.get('/health', (_, res) => res.json({ status: 'ok', rooms: rooms.size }));

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getTime() {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create-room', (callback) => {
    let code;
    do { code = generateRoomCode(); } while (rooms.has(code));
    rooms.set(code, new Set([socket.id]));
    socket.join(code);
    socket.data.roomCode = code;
    console.log(`Room created: ${code}`);
    callback({ success: true, roomCode: code });
  });

  socket.on('join-room', (roomCode, callback) => {
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) return callback({ success: false, error: 'Oda bulunamadı.' });

    // Remove stale socket IDs that are no longer connected
    for (const id of room) {
      if (!io.sockets.sockets.has(id)) room.delete(id);
    }

    if (room.size >= 2) return callback({ success: false, error: 'Oda dolu (max 2 kişi).' });
    room.add(socket.id);
    socket.join(code);
    socket.data.roomCode = code;
    socket.to(code).emit('peer-joined', { peerId: socket.id });
    console.log(`${socket.id} joined room ${code}`);
    callback({ success: true, roomCode: code, hasPeer: true });
  });

  // ── WebRTC signaling ─────────────────────────────────────────────────────
  socket.on('rtc-offer', ({ offer }) => {
    const code = socket.data.roomCode;
    if (code) socket.to(code).emit('rtc-offer', { offer, from: socket.id });
  });
  socket.on('rtc-answer', ({ answer }) => {
    const code = socket.data.roomCode;
    if (code) socket.to(code).emit('rtc-answer', { answer, from: socket.id });
  });
  socket.on('rtc-ice-candidate', ({ candidate }) => {
    const code = socket.data.roomCode;
    if (code) socket.to(code).emit('rtc-ice-candidate', { candidate, from: socket.id });
  });
  socket.on('screen-share-stopped', () => {
    const code = socket.data.roomCode;
    if (code) socket.to(code).emit('screen-share-stopped');
  });

  // ── Reactions (emoji / gif / sticker) ────────────────────────────────────
  socket.on('reaction', (payload) => {
    const code = socket.data.roomCode;
    if (code) io.to(code).emit('reaction', payload);
  });

  // ── Chat ─────────────────────────────────────────────────────────────────
  socket.on('chat-message', ({ text, nickname }) => {
    const code = socket.data.roomCode;
    if (!code || !text?.trim()) return;
    io.to(code).emit('chat-message', {
      text: String(text).slice(0, 500),
      from: socket.id,
      nickname: String(nickname || 'O').slice(0, 20),
      time: getTime(),
    });
  });

  socket.on('typing', ({ isTyping, nickname }) => {
    const code = socket.data.roomCode;
    if (code) socket.to(code).emit('typing', { isTyping, nickname });
  });

  socket.on('heart-rain', () => {
    const code = socket.data.roomCode;
    if (code) io.to(code).emit('heart-rain');
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (code) {
      const room = rooms.get(code);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) { rooms.delete(code); console.log(`Room ${code} deleted`); }
        else socket.to(code).emit('peer-left');
      }
    }
    console.log('Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
