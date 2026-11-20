const mongoose = require('mongoose');
const crypto = require('crypto');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Can't be blank"],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    index: true,
    validate: [isEmail, "invalid email"]
  },
  password: {
    type: String,
    required: [true, "Can't be blank"],
    minlength: [6, 'Password must be at least 6 characters']
  },
  picture: {
    type: String,
  },
  newMessages: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    default: 'online'
  },
  // Kept as String for compatibility with existing data ("true" / "false").
  authentication: {
    type: String,
    default: 'false'
  },
  code: {
    type: String,
  },
  codeExpires: {
    type: Date,
  },
  role: {
    type: String,
    default: 'user'
  },
  blocked: {
    type: Boolean,
    default: false
  }
}, { minimize: false });

UserSchema.statics.generateOTP = function () {
  return crypto.randomInt(100000, 1000000).toString();
};

UserSchema.methods.isVerified = function () {
  return String(this.authentication) === 'true';
};

UserSchema.methods.issueOTP = function () {
  this.code = this.constructor.generateOTP();
  this.codeExpires = new Date(Date.now() + OTP_TTL_MS);
  return this.code;
};

UserSchema.methods.checkOTP = function (otp) {
  if (!this.code || !this.codeExpires) return false;
  if (this.codeExpires.getTime() < Date.now()) return false;
  const a = Buffer.from(String(otp));
  const b = Buffer.from(String(this.code));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

UserSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

// Never send password hashes or OTP codes to the client.
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.code;
  delete userObject.codeExpires;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new Error('invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('invalid email or password');
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
