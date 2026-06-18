export default function ReactionOverlay({ reactions }) {
  return (
    <div className="reaction-overlay" aria-hidden="true">
      {reactions.map((r) => (
        <ReactionItem key={r.id} reaction={r} />
      ))}
    </div>
  );
}

function ReactionItem({ reaction }) {
  const { type, content, x, y } = reaction;
  const style = { left: `${x}%`, top: `${y}%` };

  return (
    <div className="reaction-item" style={style}>
      {type === 'emoji' ? (
        <span className="reaction-emoji">{content}</span>
      ) : (
        /* sticker and gif both render as animated image */
        <img
          src={content}
          alt="reaction"
          className={type === 'sticker' ? 'reaction-sticker' : 'reaction-gif'}
          loading="lazy"
        />
      )}
    </div>
  );
}
