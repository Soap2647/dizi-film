import { useState, useEffect, useRef, useCallback } from 'react';
import socket from '../socket.js';

export default function Chat({ myId, myNickname, peerConnected }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [peerTyping, setPeerTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleTyping = ({ isTyping }) => {
      setPeerTyping(isTyping);
    };

    socket.on('chat-message', handleMessage);
    socket.on('typing', handleTyping);
    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('typing', handleTyping);
    };
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  const emitTyping = useCallback((isTyping) => {
    socket.emit('typing', { isTyping, nickname: myNickname });
    isTypingRef.current = isTyping;
  }, [myNickname]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!isTypingRef.current) emitTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    socket.emit('chat-message', { text: trimmed, nickname: myNickname });
    setText('');
    clearTimeout(typingTimeout.current);
    emitTyping(false);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>💬 Sohbet</span>
        {!peerConnected && <span className="chat-offline">bekleniyor…</span>}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <span>🫶</span>
            <p>Henüz mesaj yok.</p>
            <p>Bir şeyler yaz!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.from === myId;
          return (
            <div key={i} className={`chat-msg ${isMe ? 'mine' : 'theirs'}`}>
              <div className="msg-bubble">
                <p className="msg-text">{msg.text}</p>
              </div>
              <span className="msg-time">{msg.time}</span>
            </div>
          );
        })}
        {peerTyping && (
          <div className="chat-msg theirs">
            <div className="msg-bubble typing-bubble">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend}>
        <input
          className="chat-input"
          value={text}
          onChange={handleTextChange}
          placeholder={peerConnected ? 'Bir şeyler yaz…' : 'Karşı taraf bekleniyor…'}
          disabled={!peerConnected}
          maxLength={500}
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-send"
          disabled={!peerConnected || !text.trim()}
          aria-label="Gönder"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
