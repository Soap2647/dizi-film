export default function LiveOverlay({ messages }) {
  if (!messages.length) return null;
  return (
    <div className="live-overlay" aria-hidden="true">
      {messages.map(m => (
        <div key={m.id} className="live-msg">
          <span className="live-nick">{m.nickname}</span>
          <span className="live-text">{m.text}</span>
        </div>
      ))}
    </div>
  );
}
