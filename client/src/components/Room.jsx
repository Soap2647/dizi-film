import { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../socket.js';
import { useWebRTC } from '../hooks/useWebRTC.js';
import { useReactionSound } from '../hooks/useReactionSound.js';
import EmojiPanel from './EmojiPanel.jsx';
import ReactionOverlay from './ReactionOverlay.jsx';
import LiveOverlay from './LiveOverlay.jsx';
import HeartRain from './HeartRain.jsx';
import Chat from './Chat.jsx';

let reactionIdCounter = 0;
let liveIdCounter = 0;

const EMOJI_COLORS = {
  heart:     '#ff6b9d',
  laugh:     '#fbbf24',
  fire:      '#f97316',
  celebrate: '#c084fc',
  sad:       '#60a5fa',
};

const EMOJI_COLOR_MAP = {
  '❤️':'heart','💕':'heart','💖':'heart','💗':'heart','💝':'heart',
  '🥰':'heart','😘':'heart','💋':'heart','🧡':'heart','💜':'heart',
  '🩷':'heart','💞':'heart','💓':'heart',
  '😂':'laugh','🤣':'laugh','😆':'laugh','😹':'laugh',
  '🔥':'fire',
  '🎉':'celebrate','🥳':'celebrate','🎊':'celebrate',
  '✨':'celebrate','🌟':'celebrate','⭐':'celebrate',
  '😢':'sad','😭':'sad',
};

export default function Room({ roomCode, role, myNickname, onLeave, theme, onThemeChange }) {
  const { isSharing, remoteStream, shareError, startScreenShare, stopScreenShare } = useWebRTC();
  const { playForReaction, playHeartRainSound } = useReactionSound();
  const videoRef     = useRef(null);
  const videoAreaRef = useRef(null);

  const [peerConnected,   setPeerConnected]   = useState(role === 'joiner');
  const [reactions,       setReactions]       = useState([]);
  const [liveMessages,    setLiveMessages]    = useState([]);
  const [liveMode,        setLiveMode]        = useState(false);
  const [heartRainKey,    setHeartRainKey]    = useState(0);
  const [heartRainActive, setHeartRainActive] = useState(false);
  const [flashStyle,      setFlashStyle]      = useState({});
  const [copied,          setCopied]          = useState(false);
  const [isFullscreen,    setIsFullscreen]    = useState(false);

  // Attach remote stream
  useEffect(() => {
    if (videoRef.current && remoteStream) videoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  // Peer presence
  useEffect(() => {
    const onJoined = () => setPeerConnected(true);
    const onLeft   = () => {
      setPeerConnected(false);
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    socket.on('peer-joined', onJoined);
    socket.on('peer-left',   onLeft);
    return () => { socket.off('peer-joined', onJoined); socket.off('peer-left', onLeft); };
  }, []);

  // Reactions: overlay + sound + screen edge flash
  useEffect(() => {
    const handler = (payload) => {
      const id = ++reactionIdCounter;
      setReactions(prev => [...prev, { ...payload, id }]);
      setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 3000);

      playForReaction(payload.content);

      if (payload.type === 'emoji') {
        const first = [...(payload.content || '')][0];
        const group = EMOJI_COLOR_MAP[first];
        if (group) {
          const color = EMOJI_COLORS[group];
          setFlashStyle({ boxShadow: `inset 0 0 0 4px ${color}, 0 0 55px ${color}70` });
          setTimeout(() => setFlashStyle({}), 700);
        }
      }
    };
    socket.on('reaction', handler);
    return () => socket.off('reaction', handler);
  }, [playForReaction]);

  // Heart rain
  useEffect(() => {
    const handler = () => {
      playHeartRainSound();
      setHeartRainKey(k => k + 1);
      setHeartRainActive(true);
      setTimeout(() => setHeartRainActive(false), 5000);
    };
    socket.on('heart-rain', handler);
    return () => socket.off('heart-rain', handler);
  }, [playHeartRainSound]);

  // Live overlay: collect incoming chat messages
  useEffect(() => {
    const handler = ({ text, nickname }) => {
      const id = ++liveIdCounter;
      setLiveMessages(prev => [...prev.slice(-4), { id, text, nickname }]);
      setTimeout(() => setLiveMessages(prev => prev.filter(m => m.id !== id)), 4000);
    };
    socket.on('chat-message', handler);
    return () => socket.off('chat-message', handler);
  }, []);

  // Fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const sendReaction = useCallback(({ type, content }) => {
    const x = 10 + Math.random() * 80;
    const y = 40 + Math.random() * 40;
    socket.emit('reaction', { type, content, x, y });
  }, []);

  const sendHeartRain = useCallback(() => {
    socket.emit('heart-rain');
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const toggleFullscreen = () => {
    const el = videoAreaRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const showLiveOverlay = liveMode || isFullscreen;

  const THEMES = [
    { id: 'dark',  icon: '🌙', label: 'Koyu' },
    { id: 'light', icon: '☀️', label: 'Açık' },
    { id: 'love',  icon: '❤️', label: 'Aşk' },
  ];

  return (
    <div className="room-layout">
      {/* ── Header ── */}
      <header className="room-header">
        <span className="room-logo">♥ Aşkımla</span>

        <div className="room-code-display">
          <span>Oda:</span>
          <strong>{roomCode}</strong>
          <button className="btn-copy" onClick={copyCode} title="Kodu kopyala">
            {copied ? '✓' : '⎘'}
          </button>
        </div>

        <div className="header-status">
          <span className={`peer-dot ${peerConnected ? 'online' : 'offline'}`} />
          <span className="peer-label">
            {peerConnected ? 'Bağlı' : 'Bekleniyor…'}
          </span>
        </div>

        <div className="theme-switcher">
          {THEMES.map(t => (
            <button
              key={t.id}
              className={`theme-btn ${theme === t.id ? 'active' : ''}`}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <button className="btn btn-ghost" onClick={onLeave}>Çık</button>
      </header>

      {/* ── Main: video + chat ── */}
      <div className="room-body">

        {/* Video column */}
        <div className="video-column">
          <div
            className="video-area"
            ref={videoAreaRef}
            onDoubleClick={toggleFullscreen}
            style={flashStyle}
          >
            {remoteStream ? (
              <video ref={videoRef} className="remote-video" autoPlay playsInline />
            ) : isSharing ? (
              <div className="video-placeholder sharing">
                <div className="placeholder-icon">📡</div>
                <p>Ekranın paylaşılıyor…</p>
                <p className="placeholder-sub">Karşı taraf bağlantıyı kuruyor</p>
              </div>
            ) : (
              <div className="video-placeholder idle">
                <div className="placeholder-icon">🖥️</div>
                <p>Ekran paylaşımı bekleniyor</p>
                {!peerConnected && (
                  <p className="placeholder-sub">Oda kodunu paylaşarak karşı tarafı davet et</p>
                )}
              </div>
            )}

            <ReactionOverlay reactions={reactions} />

            {heartRainActive && <HeartRain key={heartRainKey} />}

            {showLiveOverlay && <LiveOverlay messages={liveMessages} />}

            {remoteStream && !isFullscreen && (
              <div className="fullscreen-hint">⛶ Tam ekran için çift tıkla</div>
            )}
          </div>

          {shareError && <div className="share-error">⚠️ {shareError}</div>}

          <div className="video-controls">
            {!isSharing ? (
              <button
                className="btn btn-share"
                onClick={startScreenShare}
                disabled={!peerConnected}
                title={!peerConnected ? 'Karşı tarafın bağlanmasını bekle' : undefined}
              >
                🖥️ Ekranımı Paylaş
              </button>
            ) : (
              <button className="btn btn-stop" onClick={stopScreenShare}>
                ⏹ Paylaşımı Durdur
              </button>
            )}

            <button
              className={`btn btn-ghost btn-live${liveMode ? ' live-on' : ''}`}
              onClick={() => setLiveMode(m => !m)}
              title="Mesajları video üzerinde göster (Instagram Canlı stili)"
            >
              {liveMode ? '📺 Canlı' : '📺'}
            </button>
          </div>

          <div className="reaction-bar">
            <EmojiPanel onSendReaction={sendReaction} />
            <button
              className="btn-heart-rain"
              onClick={sendHeartRain}
              title="Kalp yağmuru gönder 💝"
            >
              💝
            </button>
          </div>
        </div>

        {/* Chat column */}
        <Chat myId={socket.id} myNickname={myNickname} peerConnected={peerConnected} />
      </div>
    </div>
  );
}
