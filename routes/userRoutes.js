const router = require('express').Router();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');  
const User = require('../models/User');
const Message = require('../models/Message');

const app = express();
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// creating user
router.post('/', upload.single('picture'), async (req, res) => {
  const { name, email, password, role, blocked } = req.body;
  const picture = req.file ? req.file.filename : null;
  try {
    const otpCode = User.generateOTP();
    const user = await User.create({ name, email, password, picture, code: otpCode, role, blocked }); 
    res.status(201).json(user);
  } catch (e) {
    let msg;
    if (e.code == 11000) {
      msg = "User already exists";
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg);
  }
});


// login user
router.post('/login', async(req, res)=> {
  try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    user.status = 'online';
    await user.save();

    console.log(user)

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      code: user.code,
      status: user.status,
      authentication: user.authentication,
      role: user.role,
      blocked: user.blocked
    });
  } catch (e) {
      res.status(400).json(e.message)
  }
})

router.post('/otp', async (req, res) => {
  const { otp } = req.body;

  try {
      const user = await User.findOne({ code: otp });

      if (!user) {
          return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      // Update the authentication field to true
      user.authentication = true;
      await user.save();

      res.status(200).json({ success: true });
  } catch (e) {
      res.status(500).json({ success: false, message: "Server error" });
  }
});

// Ambil history chat dengan filter by name (jika diberikan)
router.get('/history', async (req, res) => {
  const { name } = req.query;
  
  try {
      const filter = name ? { "from.name": name } : {};
      const messages = await Message.find(filter, { "from": 1, "date": 1, "time": 1, "_id": 0 });
      res.status(200).json(messages);
  } catch (e) {
      res.status(500).json({ error: e.message });
  }
});


router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role status blocked');
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/block/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { blocked } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blocked = blocked;
    await user.save();

    res.status(200).json({ message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router
