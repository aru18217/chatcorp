const crypto = require('crypto');

const ROOMS = [
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
  'Room Meeting 1C',
];

const LOCKED_ROOMS = ['Room Meeting 1A', 'Room Meeting 1B', 'Room Meeting 1C'];

// The room key lives on the server only (ROOM_PASSWORD in .env).
function roomPassword() {
  if (!process.env.ROOM_PASSWORD) {
    console.warn('ROOM_PASSWORD is not set; meeting rooms use the demo key "12345".');
  }
  return process.env.ROOM_PASSWORD || '12345';
}

function isLockedRoom(room) {
  return LOCKED_ROOMS.includes(room);
}

function checkRoomPassword(room, password) {
  if (!isLockedRoom(room)) return true;
  const a = Buffer.from(String(password || ''));
  const b = Buffer.from(roomPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Private rooms are named "<idA>-<idB>"; only those two users may join.
function canAccessPrivateRoom(room, userId) {
  const parts = String(room).split('-');
  return parts.length === 2 && parts.includes(String(userId));
}

module.exports = { ROOMS, LOCKED_ROOMS, isLockedRoom, checkRoomPassword, canAccessPrivateRoom };
