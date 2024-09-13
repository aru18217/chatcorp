const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: String,
  file : String,
  from: Object,
  socketid: String,
  time: String,
  date: String,
  to: String,
  iv:String,
  key:String,
  iv_file:String,
  key_file:String,
  encryptionDuration : Number,
})

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message
