require('dotenv').config({ quiet: true });
const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const Message = require('./models/Message');
const User = require('./models/User');
const { encrypt, safeDecrypt } = require('./lib/crypto');
const { userFromToken, requireAuth } = require('./lib/auth');
const { publicUser, getMembers } = require('./lib/members');
const { ROOMS, isLockedRoom, checkRoomPassword, canAccessPrivateRoom } = require('./lib/rooms');

// Fail fast if required secrets are missing.
for (const name of ['MONGODB_URI', 'ENCRYPTION_KEY', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`${name} is not set. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}
if (!/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY)) {
  console.error('ENCRYPTION_KEY must be 64 hex characters (32 bytes).');
  process.exit(1);
}

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const DOCS_DIR = path.join(__dirname, 'uploads', 'documents');
fs.mkdirSync(DOCS_DIR, { recursive: true });

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: CLIENT_URL }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/users', userRoutes);
require('./connection');

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});
app.set('io', io);

// ---------- File upload (attachments) ----------
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, DOCS_DIR),
    // Random prefix so file URLs cannot be guessed.
    filename: (req, file, cb) =>
      cb(null, `${crypto.randomBytes(12).toString('hex')}-${path.basename(file.originalname).replace(/[^\w.\- ]/g, '_')}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

app.post('/send', requireAuth, (req, res) => {
  if (req.user.blocked) return res.status(403).json({ message: 'Your account is blocked' });
  upload.single('pdf')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    res.status(200).json({ filename: req.file.filename });
  });
});

app.get('/rooms', (req, res) => {
  res.json(ROOMS.map((name) => ({ name, locked: isLockedRoom(name) })));
});

app.get('/health', (req, res) => res.json({ ok: true }));

// ---------- Messages ----------
function decryptMessage(m) {
  const content = safeDecrypt(m.content, m.iv, m.key);
  const file = m.file ? safeDecrypt(m.file, m.iv_file, m.key_file) : null;
  return {
    _id: String(m._id),
    content: content === null ? '[message could not be decrypted]' : content,
    file,
    from: publicUser(m.from),
    time: m.time,
    date: m.date,
    to: m.to,
  };
}

function dateKey(d) {
  // dates are stored as MM/DD/YYYY
  const [mm, dd, yyyy] = String(d).split('/');
  return `${yyyy}${mm}${dd}`;
}

async function getRoomMessages(room) {
  const docs = await Message.find({ to: room }).sort({ _id: 1 }).limit(1000).lean();
  const groups = new Map();
  for (const doc of docs) {
    if (!groups.has(doc.date)) groups.set(doc.date, []);
    groups.get(doc.date).push(decryptMessage(doc));
  }
  return [...groups.entries()]
    .map(([date, messagesByDate]) => ({ _id: date, messagesByDate }))
    .sort((a, b) => (dateKey(a._id) < dateKey(b._id) ? -1 : 1));
}

// ---------- Socket.io ----------
io.use(async (socket, next) => {
  const user = await userFromToken(socket.handshake.auth?.token);
  if (!user || !user.isVerified()) return next(new Error('unauthorized'));
  socket.data.userId = String(user._id);
  next();
});

io.on('connection', (socket) => {
  const currentUser = () => User.findById(socket.data.userId);

  socket.on('new-user', async () => {
    io.emit('new-user', await getMembers());
  });

  socket.on('join-room', async (newRoom, previousRoom, password, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const isPublic = ROOMS.includes(newRoom);
      if (!isPublic && !canAccessPrivateRoom(newRoom, socket.data.userId)) {
        return reply({ ok: false, error: 'You do not have access to this conversation.' });
      }
      if (isLockedRoom(newRoom) && !checkRoomPassword(newRoom, password)) {
        return reply({ ok: false, locked: true, error: 'Wrong room key. Access denied.' });
      }
      if (previousRoom && previousRoom !== newRoom) socket.leave(previousRoom);
      socket.join(newRoom);
      // Send the history in the acknowledgement so it can't race with the reply.
      reply({ ok: true, messages: await getRoomMessages(newRoom) });
    } catch (e) {
      console.error('join-room failed:', e);
      reply({ ok: false, error: 'Could not join the room.' });
    }
  });

  socket.on('message-room', async (room, content, time, date, filename, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    try {
      const user = await currentUser();
      if (!user) return reply({ ok: false, error: 'Please login again.' });
      if (user.blocked) return reply({ ok: false, error: 'Your account is blocked.' });
      if (!socket.rooms.has(room)) return reply({ ok: false, error: 'Join the room first.' });

      const text = String(content || '').trim().slice(0, 5000);
      let safeFile = null;
      if (filename) {
        safeFile = path.basename(String(filename));
        if (!fs.existsSync(path.join(DOCS_DIR, safeFile))) safeFile = null;
      }
      if (!text && !safeFile) return reply({ ok: false, error: 'Empty message.' });

      const start = process.hrtime.bigint();
      const enc = encrypt(text);
      const encFile = safeFile ? encrypt(safeFile) : null;
      const encryptionDuration = Number(process.hrtime.bigint() - start);

      await Message.create({
        content: enc.encryptedData,
        iv: enc.iv,
        file: encFile ? encFile.encryptedData : undefined,
        iv_file: encFile ? encFile.iv : undefined,
        from: publicUser(user),
        time,
        date,
        to: room,
        encryptionDuration,
      });

      io.to(room).emit('room-messages', await getRoomMessages(room));
      socket.broadcast.emit('notifications', room);
      reply({ ok: true });
    } catch (e) {
      console.error('message-room failed:', e);
      reply({ ok: false, error: 'Message could not be sent.' });
    }
  });

  // Mark the user offline when their last open tab disconnects.
  socket.on('disconnect', async () => {
    try {
      const stillConnected = [...io.sockets.sockets.values()].some(
        (s) => s.id !== socket.id && s.data.userId === socket.data.userId
      );
      if (!stillConnected) {
        await User.updateOne({ _id: socket.data.userId }, { status: 'offline' });
        io.emit('new-user', await getMembers());
      }
    } catch (e) {
      console.error('disconnect cleanup failed:', e.message);
    }
  });
});

// Mark the user online when they connect.
io.on('connection', async (socket) => {
  try {
    await User.updateOne({ _id: socket.data.userId }, { status: 'online' });
    io.emit('new-user', await getMembers());
  } catch (e) {
    console.error('connect status update failed:', e.message);
  }
});

server.listen(PORT, () => {
  console.log('listening to port', PORT);
});
