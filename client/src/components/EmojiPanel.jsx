import { useState, useRef, useCallback, useEffect } from 'react';
import { STICKER_GROUPS, getUrl } from '../data/animatedEmojis.js';

const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY || '';

const QUICK_EMOJIS = [
  { label: '❤️ Sevgi',    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💕','💞','💓','💗','💖','💘','💝','😍','🥰','😘','💋','🫀'] },
  { label: '😊 Yüz',      emojis: ['😂','🤣','😊','😁','😆','😅','🤭','😄','😃','😀','🥹','😢','😭','😤','😠','🤯','🥳','😎','🤩','🫠'] },
  { label: '👋 El',       emojis: ['👏','🙌','🤝','👍','👎','🤞','✌️','🫶','💪','🙏','🤙','☝️','👇','👈','👉','🫵','🤌','💅','✍️','🤟'] },
  { label: '🎉 Eğlence',  emojis: ['🎉','🎊','🥂','🍿','🎬','🎥','📺','🎭','🎮','🕹️','🎲','🎯','🏆','🥇','⭐','🌟','💫','✨','🔥','💥'] },
];

export default function EmojiPanel({ onSendReaction }) {
  const [tab, setTab] = useState(null); // null | 'emoji' | 'sticker' | 'gif'
  const [emojiGroup, setEmojiGroup] = useState(0);
  const [stickerGroup, setStickerGroup] = useState(0);
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [gifError, setGifError] = useState('');
  const panelRef = useRef(null);
  const searchTimeout = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!tab) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setTab(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tab]);

  const send = useCallback((type, content) => {
    onSendReaction({ type, content });
    setTab(null);
  }, [onSendReaction]);

  const handleGifSearch = (query) => {
    setGifQuery(query);
    setGifError('');
    clearTimeout(searchTimeout.current);
    if (!query.trim()) { setGifs([]); return; }
    searchTimeout.current = setTimeout(async () => {
      if (!GIPHY_KEY) { setGifError('VITE_GIPHY_API_KEY gerekli.'); return; }
      setGifLoading(true);
      try {
        const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`);
        const json = await res.json();
        setGifs(json.data || []);
      } catch { setGifError('GIF aranırken hata oluştu.'); }
      finally { setGifLoading(false); }
    }, 400);
  };

  const toggleTab = (name) => setTab(t => t === name ? null : name);

  return (
    <div className="emoji-panel" ref={panelRef}>

      {/* ── Quick emoji button ── */}
      <button className="btn-icon" onClick={() => toggleTab('emoji')} title="Emoji gönder">😊</button>

      {/* ── Animated sticker button ── */}
      <button className="btn-pill" onClick={() => toggleTab('sticker')} title="Animasyonlu sticker">
        🎭 Sticker
      </button>

      {/* ── GIF search inline ── */}
      <div className="gif-search-wrapper">
        <input
          type="text"
          className="gif-input"
          placeholder="🔍 GIF ara…"
          value={gifQuery}
          onFocus={() => setTab('gif')}
          onChange={(e) => { setTab('gif'); handleGifSearch(e.target.value); }}
          onBlur={() => setTimeout(() => { if (!gifQuery) setTab(null); }, 200)}
        />
      </div>

      {/* ── Popups ── */}

      {tab === 'emoji' && (
        <div className="picker-popup emoji-picker-popup">
          <div className="emoji-tabs">
            {QUICK_EMOJIS.map((g, i) => (
              <button key={g.label} className={`emoji-tab ${emojiGroup === i ? 'active' : ''}`} onClick={() => setEmojiGroup(i)}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="emoji-grid">
            {QUICK_EMOJIS[emojiGroup].emojis.map(emoji => (
              <button key={emoji} className="emoji-btn" onClick={() => send('emoji', emoji)}>{emoji}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'sticker' && (
        <div className="picker-popup sticker-picker-popup">
          <div className="emoji-tabs">
            {STICKER_GROUPS.map((g, i) => (
              <button key={g.label} className={`emoji-tab ${stickerGroup === i ? 'active' : ''}`} onClick={() => setStickerGroup(i)}>
                {g.label}
              </button>
            ))}
          </div>
          <div className="sticker-grid">
            {STICKER_GROUPS[stickerGroup].stickers.map(s => (
              <button
                key={s.hex}
                className="sticker-btn"
                onClick={() => send('sticker', getUrl(s.hex))}
                title={s.label}
              >
                <img
                  src={getUrl(s.hex)}
                  alt={s.label}
                  loading="lazy"
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
                />
                <span style={{ display: 'none', fontSize: '1.8rem' }}>{s.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === 'gif' && gifQuery && (
        <div className="picker-popup gif-results-popup">
          {gifLoading && <p className="gif-status">Aranıyor…</p>}
          {gifError && <p className="gif-status error">{gifError}</p>}
          {!gifLoading && !gifError && gifs.length === 0 && <p className="gif-status">Sonuç yok.</p>}
          <div className="gif-grid">
            {gifs.map(gif => (
              <img
                key={gif.id}
                src={gif.images.fixed_height_small.url}
                alt={gif.title}
                className="gif-thumb"
                onClick={() => { send('gif', gif.images.fixed_height_small.url); setGifQuery(''); setGifs([]); }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
