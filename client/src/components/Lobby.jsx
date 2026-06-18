import { useState } from 'react';
import socket from '../socket.js';

export default function Lobby({ onJoined }) {
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateNick = () => {
    const n = nickname.trim();
    if (!n) { setError('Takma adın olmadan olmaz 💕'); return null; }
    return n;
  };

  const handleCreate = () => {
    const nick = validateNick();
    if (!nick) return;
    setLoading(true);
    setError('');
    socket.emit('create-room', (res) => {
      setLoading(false);
      if (res.success) onJoined(res.roomCode, 'creator', nick, false);
      else setError('Oda oluşturulamadı, tekrar dene.');
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const nick = validateNick();
    if (!nick) return;
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) { setError('Geçerli bir oda kodu gir.'); return; }
    setLoading(true);
    setError('');
    socket.emit('join-room', code, (res) => {
      setLoading(false);
      if (res.success) onJoined(res.roomCode, 'joiner', nick, res.hasPeer);
      else setError(res.error || 'Odaya katılınamadı.');
    });
  };

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h1 className="lobby-title"><span className="heart">♥</span> Aşkımla Dizi Film Keyfi</h1>
        <p className="lobby-subtitle">Ekranını paylaş, birlikte izle, reaksiyonlarını gönder</p>

        <div className="lobby-nick-row">
          <input
            type="text"
            className="nick-input"
            placeholder="Takma adın… (örn: Mia ❤️)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            autoComplete="off"
          />
        </div>

        <div className="lobby-actions">
          <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? 'Oluşturuluyor…' : '✦ Oda Oluştur'}
          </button>

          <div className="divider"><span>veya mevcut odaya katıl</span></div>

          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              className="code-input"
              placeholder="Oda kodu (örn: AB3X7K)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Odaya Katıl →
            </button>
          </form>

          {error && <p className="error-msg">{error}</p>}
        </div>
      </div>
    </div>
  );
}
