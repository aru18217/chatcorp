# ChatCorp: secure team chat

ChatCorp is a real-time company chat app built with the MERN stack and Socket.IO. Messages and attachment names are encrypted with **AES-256** before they are saved to the database.

## Features

- **Team channels** for announcements, departments, projects, and casual chat
- **Direct messages** between two people (only those two can join the conversation)
- **Locked meeting rooms** that need a room key, checked on the server
- **File sharing** in any room or direct message (up to 10 MB)
- **AES-256-CBC encryption at rest**: a random IV per message and a server-side key that is never stored in the database
- **Email OTP verification** for new accounts (6 digits, expires after 10 minutes)
- **CAPTCHA** before entering the chat
- **Online/offline presence** and unread message badges
- **Admin tools**: chat activity history and blocking users (blocked users can read but not send)
- **Toro**, a small rule-based help bot on the home page
- Responsive layout for desktop and mobile

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 17, Redux Toolkit (RTK Query), React Router 6, React Bootstrap |
| Realtime | Socket.IO |
| Backend | Node.js, Express, Mongoose, Multer, JSON Web Tokens |
| Database | MongoDB Atlas |
| Security | AES-256-CBC (Node `crypto`), bcrypt password hashing, OTP via EmailJS |

## Getting started

```bash
npm install
cp .env.example .env      # then fill in the values (see below)
npm run server            # backend on http://localhost:5001
npm start                 # frontend on http://localhost:3000 (in a second terminal)
```

Required values in `.env`:

| Variable | What it is |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `ENCRYPTION_KEY` | 64 hex characters. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_SECRET` | Any long random string |
| `ROOM_PASSWORD` | Key for the locked meeting rooms |
| `EMAILJS_*` | Optional. Without them, the OTP is printed in the server console for local testing |

To make an account an admin, set its `role` field to `admin` in MongoDB.

## Testing

```bash
npm run test:server       # unit tests: AES-256, room access rules, OTP, data exposure
```

## How the encryption works

1. The browser sends the message to the server over Socket.IO.
2. The server encrypts the text (and the attachment name) with AES-256-CBC using a key from `ENCRYPTION_KEY` and a fresh random IV.
3. Only the ciphertext and IV are stored in MongoDB. Someone who can read the database alone cannot read the messages.
4. When a member opens a room, the server decrypts the messages and sends them to members of that room only.

This is **encryption at rest**, not end-to-end encryption: the server can decrypt messages. Attachment files themselves are stored as uploaded, under random, unguessable file names.

## Changelog: bug fixes and hardening

**Security**
- Database credentials moved out of the code into `.env`
- The AES key is no longer stored next to each message (which made the encryption ineffective); old messages remain readable
- OTP codes are no longer sent to the browser; they are emailed by the server, tied to an email address, and expire after 10 minutes
- Sign-up can no longer set `role: admin` from the form
- Admin endpoints (history, user list, block) and file uploads now require a logged-in admin or user (JWT)
- Room keys and private-room access are checked on the server, not in the browser
- Sender identity comes from the login session, so messages cannot be sent as someone else
- Blocked users are stopped on the server, not just in the UI
- Password hashes, OTP codes, and other private fields are never returned in API responses or chat history

**Bugs**
- Added the missing Redux `store.js` (the app did not build)
- Routes were registered inside the Socket.IO connection handler, so they were added again on every connection
- Sign-up went straight to the chat without logging in
- Unread badges never updated because the server never sent notifications
- The default room "general" did not exist in the room list
- CAPTCHA "reload" changed the code but not the picture
- Member list used a missing key (`member.id`)
- Messages without a profile picture showed a broken image
- Toro gave no answer for unknown questions; some answers overstated the security (e.g. "end-to-end", "audited")
- Server URLs are configurable instead of hard-coded to `localhost`

**Design**
- New interface: sidebar with channels and direct messages, chat bubbles grouped by sender, date dividers, locked-room screen, redesigned login/sign-up/OTP pages, admin tables, and a mobile layout
