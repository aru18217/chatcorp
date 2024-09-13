const express = require('express');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path'); 
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const Message = require('./models/Message');
const cors = require('cors');
const crypto = require('crypto');

const rooms = [
  'General Announcement', 
  'Department Channels', 
  'Project-Based Rooms', 
  'Team Rooms', 
  'Casual Chat', 
  'Support Channels', 
  'Event Planning', 
  'Training and Resources', 
  'Feedback and Suggestions', 
  'Client Communication', 
  'Room Meeting 1A', 
  'Room Meeting 1B', 
  'Room Meeting 1C'
];

const lockedRooms = {
  'Room Meeting 1A': '12345',
  'Room Meeting 1B': '12345',
  'Room Meeting 1C': '12345'
};



const algorithm = 'aes-256-cbc'; //AES-256

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/documents'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/users', userRoutes);
require('./connection');

const server = require('http').createServer(app);
const PORT = 5001;
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = crypto.randomBytes(32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted, key: key.toString('hex') };
}

function decrypt(encryptedData, iv, key) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function isRoomAuthorized(room, password) {
  const roomPassword = lockedRooms[room];
  return roomPassword && roomPassword === password;
}

async function getLastMessagesFromRoom(room) {
  try {
    let roomMessages = await Message.aggregate([
      { $match: { to: room } },
      { $group: { _id: '$date', messagesByDate: { $push: '$$ROOT' } } }
    ]);

    roomMessages = roomMessages.map(dateGroup => {
      const decryptedMessagesByDate = dateGroup.messagesByDate.map(message => {
        let decryptedMessage = message.content;
        if (message.content && message.iv && message.key) {
          try {
            decryptedMessage = decrypt(message.content, message.iv, message.key);
          } catch (e) {
            console.error('Error decrypting text:', e);
          }
        }
        return { ...message, content: decryptedMessage };
      });
      return { _id: dateGroup._id, messagesByDate: decryptedMessagesByDate };
    });

    return roomMessages;
  } catch (error) {
    console.error('Error getting last messages from room:', error);
    throw error;
  }
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1];
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1;
  });
}

io.on('connection', (socket) => {
  socket.on('new-user', async () => {
    const members = await User.find();
    io.emit('new-user', members);
  });

  socket.on('join-room', async (newRoom, previousRoom, password) => {
    if (lockedRooms[newRoom] && !isRoomAuthorized(newRoom, password)) {
      socket.emit('unauthorized', 'Password salah atau Anda tidak memiliki akses ke ruangan ini.');
      return;
    }

    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages);
  });

  socket.on('message-room', async (room, content, sender, time, date, filename, iv, key) => {
    const encryptionTimeStart = process.hrtime();

    const { iv: contentIv, encryptedData: encryptedContent, key: contentKey } = encrypt(content);
    const newMessage = await Message.create({
      content: encryptedContent,
      iv: contentIv,
      key: contentKey,
      from: sender,
      time,
      date,
      to: room,
      file: filename,
      iv_file: iv,
      key_file: key,
    });

    const encryptionTimeEnd = process.hrtime(encryptionTimeStart);
    const encryptionDuration = encryptionTimeEnd[0] * 1e9 + encryptionTimeEnd[1];
    newMessage.encryptionDuration = encryptionDuration;

    await newMessage.save();

    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);

    roomMessages = roomMessages.map((message) => {
      if (message.file) {
        const decryptedFilename = decrypt({
          encryptedData: message.file,
          iv: message.iv_file,
          key: message.key_file,
        });
        message.file = decryptedFilename;
      }
      return message;
    });

    io.to(room).emit('room-messages', roomMessages);
  });

  app.post('/send', upload.single('pdf'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { iv, encryptedData, key } = encrypt(req.file.filename);

    res.status(200).json({
      filename: req.file.filename,
      encryptedFilename: encryptedData,
      iv,
      key
    });
  });

  app.post('/sendText', (req, res) => {
    const { content } = req.body;

    if (!content) {
      return res.status(400).send('No content provided.');
    }

    const { iv, encryptedData, key } = encrypt(content);

    res.status(200).json({
      originalContent: content,
      encryptedContent: encryptedData,
      iv,
      key
    });
  });

  app.delete('/logout', async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send();
    }
  });

});

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

server.listen(PORT, () => {
  console.log('listening to port', PORT);
});
