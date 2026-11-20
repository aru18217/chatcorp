const router = require('express').Router();
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Message = require('../models/Message');
const { signToken, requireAuth, requireAdmin } = require('../lib/auth');
const { sendOtpEmail } = require('../lib/mailer');
const { publicUser, broadcastMembers } = require('../lib/members');

const PROFILE_DIR = path.join(__dirname, '..', 'uploads', 'profiles');
fs.mkdirSync(PROFILE_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, PROFILE_DIR),
    filename: (req, file, cb) =>
      cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Profile picture must be PNG, JPG, or WEBP'), ok);
  },
});

function sessionPayload(user) {
  return { ...publicUser(user), status: user.status, role: user.role, blocked: user.blocked, newMessages: user.newMessages || {}, token: signToken(user) };
}

// Sign up. Role is always "user": nobody can make themselves admin from the form.
router.post('/', (req, res, next) => {
  upload.single('picture')(req, res, (err) => {
    if (err) return res.status(400).json(err.message);
    next();
  });
}, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password, picture: req.file ? req.file.filename : null, status: 'offline' });
    const code = user.issueOTP();
    await user.save();
    try {
      await sendOtpEmail({ name: user.name, email: user.email, code });
    } catch (mailErr) {
      console.error(mailErr.message);
    }
    res.status(201).json({ needsOtp: true, email: user.email });
  } catch (e) {
    const msg = e.code === 11000 ? 'User already exists' : e.message;
    res.status(400).json(msg);
  }
});

// Login. Unverified accounts get a fresh OTP by email instead of a session.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);

    if (!user.isVerified()) {
      const code = user.issueOTP();
      await user.save();
      try {
        await sendOtpEmail({ name: user.name, email: user.email, code });
      } catch (mailErr) {
        console.error(mailErr.message);
      }
      return res.status(200).json({ needsOtp: true, email: user.email });
    }

    user.status = 'online';
    await user.save();
    broadcastMembers(req.app.get('io'));
    res.status(200).json(sessionPayload(user));
  } catch (e) {
    res.status(400).json(e.message);
  }
});

// Verify OTP: needs both email and code, and the code expires after 10 minutes.
router.post('/otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user || !user.checkOTP(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    user.authentication = 'true';
    user.code = undefined;
    user.codeExpires = undefined;
    await user.save();
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/resend-otp', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  // Same answer whether or not the email exists, so accounts cannot be enumerated.
  if (user && !user.isVerified()) {
    const code = user.issueOTP();
    await user.save();
    try {
      await sendOtpEmail({ name: user.name, email: user.email, code });
    } catch (mailErr) {
      console.error(mailErr.message);
    }
  }
  res.status(200).json({ success: true });
});

router.post('/logout', requireAuth, async (req, res) => {
  try {
    req.user.status = 'offline';
    if (req.body && typeof req.body.newMessages === 'object') req.user.newMessages = req.body.newMessages;
    await req.user.save();
    broadcastMembers(req.app.get('io'));
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json(sessionPayload(req.user));
});

// ---------- Admin ----------
router.get('/history', requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.query;
  try {
    const filter = name ? { 'from.name': { $regex: escapeRegex(name), $options: 'i' } } : {};
    const messages = await Message.find(filter, { from: 1, date: 1, time: 1, to: 1, _id: 0 }).sort({ _id: -1 }).limit(500);
    res.status(200).json(messages.map((m) => ({ from: publicUser(m.from), date: m.date, time: m.time, to: m.to })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/all-users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role status blocked');
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/block/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot block your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.blocked = Boolean(req.body.blocked);
    await user.save();
    broadcastMembers(req.app.get('io'));
    res.status(200).json({ message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
