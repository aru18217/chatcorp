const User = require('../models/User');

// The only user fields other people may see.
function publicUser(u) {
  if (!u) return null;
  return { _id: u._id ? String(u._id) : undefined, name: u.name, email: u.email, picture: u.picture || null };
}

async function getMembers() {
  const users = await User.find({}, 'name email picture status blocked');
  return users.map((u) => ({ ...publicUser(u), status: u.status, blocked: u.blocked }));
}

async function broadcastMembers(io) {
  if (!io) return;
  try {
    io.emit('new-user', await getMembers());
  } catch (e) {
    console.error('Failed to broadcast members:', e.message);
  }
}

module.exports = { publicUser, getMembers, broadcastMembers };
