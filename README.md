# Aşkımla Dizi Film Keyfi 🎬♥

İki kişinin oda kodu ile eşleşip ekran paylaşımı yapabildiği, emoji ve GIF reaksiyonu gönderebildiği ücretsiz web uygulaması.

## Özellikler

- Oda kodu (6 karakter) ile eşleşme
- WebRTC P2P ekran paylaşımı (sunucu bandwith kullanmaz)
- Anlık emoji gönderme (emoji-picker-react)
- Giphy ile GIF arama ve gönderme
- Floating overlay animasyonu ile reaksiyonlar
- Sıfır veritabanı, sıfır kullanıcı hesabı

## Yerel Çalıştırma

### 1. Server

```bash
cd server
npm install
cp .env.example .env
# .env içinde PORT ve CLIENT_URL'yi düzenle (varsayılan tamam)
npm run dev
```

### 2. Client

```bash
cd client
npm install
cp .env.example .env
# .env içine Giphy API key'ini ekle:
#   VITE_GIPHY_API_KEY=xxxxxxxxxxxx
# Giphy ücretsiz key: https://developers.giphy.com/
npm run dev
```

Tarayıcıda: **http://localhost:5173**

> Not: Ekran paylaşımı yalnızca Chrome / Edge'de sorunsuz çalışır.  
> İki sekme / iki cihaz açarak test edebilirsin.

---

## Deploy

### Server → Render.com (Free Tier)

1. [render.com](https://render.com) → **New Web Service**
2. GitHub repo'nu bağla, root dizin: `server/`
3. Build: `npm install` | Start: `node index.js`
4. Environment variables:
   - `PORT` → Render otomatik atar
   - `CLIENT_URL` → Vercel URL'in (örn. `https://askimla.vercel.app`)

### Client → Vercel (Free Tier)

1. [vercel.com](https://vercel.com) → **New Project**
2. Root dizin: `client/`
3. Framework: **Vite**
4. Environment variables:
   - `VITE_SERVER_URL` → Render servis URL'in (örn. `https://askimla-server.onrender.com`)
   - `VITE_GIPHY_API_KEY` → Giphy API key'in

---

## Mimari

```
Browser A ──┐                    ┌── Browser B
            │  Socket.io signals  │
            └──── Server ─────────┘
                (Render, free)
            
Browser A ◄──────────────────── Browser B
         WebRTC P2P ekran verisi
         (sunucudan geçmez!)
```

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18 + Vite |
| Sinyal sunucusu | Node.js + Socket.io |
| Ekran paylaşımı | WebRTC (getDisplayMedia) |
| Emoji | emoji-picker-react |
| GIF | Giphy API (ücretsiz) |
| Deploy (server) | Render.com free tier |
| Deploy (client) | Vercel free tier |
