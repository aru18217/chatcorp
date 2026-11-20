const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: String,      // AES-256 encrypted (hex)
  iv: String,           // IV for content
  file: String,         // AES-256 encrypted stored filename (hex)
  iv_file: String,      // IV for file
  // Legacy fields: the old version saved a random key next to each message.
  // New messages do not use them; they are only read to keep old history readable.
  key: String,
  key_file: String,
  from: Object,
  socketid: String,
  time: String,
  date: String,
  to: String,
  encryptionDuration: Number,
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
