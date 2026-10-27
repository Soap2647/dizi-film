<div align="center">

# 🎬♥ Aşkımla Dizi Film Keyfi

**Watch together from anywhere: room-code screen sharing over WebRTC, with live chat, emoji and GIF reactions**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-333333?style=flat-square&logo=webrtc&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-signaling-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs&logoColor=white)

[Features](#-features) · [Architecture](#-architecture) · [Run locally](#-run-locally) · [Deploy](#-deploy) · [Türkçe](#-türkçe)

</div>

---

Two people join the same room with a 6-character code. One shares their screen and both watch in sync
while sending reactions on top of the video. The video stream travels **peer-to-peer**, so the server
only relays signalling messages, needs no database and costs almost nothing to host.

## ✨ Features

- **Room codes**: six characters to pair up, with no accounts.
- **WebRTC P2P screen sharing** (`getDisplayMedia`), so video never passes through the server.
- **Live chat** next to the stream.
- **Emoji and GIF reactions** (Giphy search) floating over the video, with sound effects.
- **Heart rain** and live overlays for the cosy moments.
- **Zero database**: the state lives in memory on a tiny Socket.IO server.

## 🧩 Architecture

```mermaid
sequenceDiagram
    participant A as Browser A (sharer)
    participant S as Signalling server<br/>(Node · Socket.IO)
    participant B as Browser B (viewer)
    A->>S: join(room)
    B->>S: join(room)
    A->>S: offer (SDP)
    S->>B: offer
    B->>S: answer (SDP)
    S->>A: answer
    A-->>B: ICE candidates (via server)
    A==>>B: screen stream · WebRTC P2P (bypasses the server)
    A->>S: reactions / chat
    S->>B: reactions / chat
```

## 🚀 Run locally

```bash
# 1 · Signalling server
cd server
npm install
cp .env.example .env        # PORT and CLIENT_URL (defaults work)
npm run dev

# 2 · Client
cd ../client
npm install
cp .env.example .env        # add VITE_GIPHY_API_KEY (free at developers.giphy.com)
npm run dev                 # http://localhost:5173
```

Open two tabs or two devices to test. Screen sharing works best in Chrome and Edge.

## ☁️ Deploy

| Part | Where | Settings |
|---|---|---|
| Server | Render (free tier) | root `server/`, build `npm install`, start `node index.js`, env `CLIENT_URL` |
| Client | Vercel (free tier) | root `client/`, framework **Vite**, env `VITE_SERVER_URL`, `VITE_GIPHY_API_KEY` |

## 📁 Project structure

```
client/src/
├── components/   Lobby, Room, Chat, EmojiPanel, ReactionOverlay, LiveOverlay, HeartRain
├── hooks/        useWebRTC, useReactionSound
└── socket.js
server/index.js   Express + Socket.IO signalling
```

## 🇹🇷 Türkçe

İki kişinin oda koduyla eşleşip ekran paylaşarak birlikte dizi/film izleyebildiği ücretsiz bir web uygulaması.
Görüntü WebRTC ile doğrudan iki tarayıcı arasında akar, sunucu yalnızca sinyal iletir. Sohbet, emoji ve Giphy
GIF reaksiyonları, kalp yağmuru efekti içerir. Veritabanı ve kullanıcı hesabı gerekmez. Sunucu Render'a, istemci
Vercel'e ücretsiz olarak deploy edilebilir.

---

<div align="center"><sub>Made with ♥ by <a href="https://github.com/Soap2647">Mert Yasin Yılmaz</a></sub></div>
