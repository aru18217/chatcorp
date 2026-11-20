// Run with: npm run test:server
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.JWT_SECRET = 'test-secret';
process.env.ROOM_PASSWORD = 'meeting-key';

const { encrypt, decrypt, safeDecrypt } = require('../lib/crypto');
const { checkRoomPassword, canAccessPrivateRoom, isLockedRoom } = require('../lib/rooms');
const { publicUser } = require('../lib/members');
const User = require('../models/User');

test('AES-256: encrypt then decrypt returns the original text', () => {
  const { iv, encryptedData } = encrypt('Halo tim, meeting jam 3 ya');
  assert.notStrictEqual(encryptedData, 'Halo tim, meeting jam 3 ya');
  assert.strictEqual(decrypt(encryptedData, iv), 'Halo tim, meeting jam 3 ya');
});

test('AES-256: each message gets a different IV and ciphertext', () => {
  const a = encrypt('same text');
  const b = encrypt('same text');
  assert.notStrictEqual(a.iv, b.iv);
  assert.notStrictEqual(a.encryptedData, b.encryptedData);
});

test('AES-256: encrypted output does not contain the key', () => {
  const out = encrypt('x');
  assert.deepStrictEqual(Object.keys(out).sort(), ['encryptedData', 'iv']);
});

test('AES-256: legacy messages saved with their own key can still be read', () => {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv('aes-256-cbc', key, iv);
  const data = c.update('old message', 'utf8', 'hex') + c.final('hex');
  assert.strictEqual(decrypt(data, iv.toString('hex'), key.toString('hex')), 'old message');
});

test('AES-256: tampered data returns null instead of crashing', () => {
  const { iv } = encrypt('hello');
  assert.strictEqual(safeDecrypt('00ff', iv), null);
});

test('Rooms: meeting rooms need the server-side key', () => {
  assert.ok(isLockedRoom('Room Meeting 1A'));
  assert.ok(!checkRoomPassword('Room Meeting 1A', '12345'));
  assert.ok(checkRoomPassword('Room Meeting 1A', 'meeting-key'));
  assert.ok(checkRoomPassword('Casual Chat', undefined));
});

test('Rooms: private rooms only allow their two members', () => {
  assert.ok(canAccessPrivateRoom('bbb-aaa', 'aaa'));
  assert.ok(canAccessPrivateRoom('bbb-aaa', 'bbb'));
  assert.ok(!canAccessPrivateRoom('bbb-aaa', 'ccc'));
  assert.ok(!canAccessPrivateRoom('General Announcement', 'aaa'));
});

test('OTP: correct code works, wrong or expired code fails', () => {
  const u = new User({ name: 'A', email: 'a@example.com', password: 'secret1' });
  const code = u.issueOTP();
  assert.match(code, /^\d{6}$/);
  assert.ok(u.checkOTP(code));
  assert.ok(!u.checkOTP('000000') || code === '000000');
  u.codeExpires = new Date(Date.now() - 1000);
  assert.ok(!u.checkOTP(code));
});

test('User JSON never exposes password or OTP', () => {
  const u = new User({ name: 'A', email: 'a@example.com', password: 'secret1' });
  u.issueOTP();
  const json = u.toJSON();
  assert.strictEqual(json.password, undefined);
  assert.strictEqual(json.code, undefined);
});

test('publicUser strips sensitive fields from old message senders', () => {
  const legacySender = { _id: '1', name: 'A', email: 'a@x.com', picture: 'p.png', code: 123456, password: 'hash', newMessages: {} };
  assert.deepStrictEqual(publicUser(legacySender), { _id: '1', name: 'A', email: 'a@x.com', picture: 'p.png' });
});
