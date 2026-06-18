import { useState, useEffect } from 'react';
import socket from './socket.js';
import Lobby from './components/Lobby.jsx';
import Room from './components/Room.jsx';

const THEME_KEY = 'askimla_theme';

export default function App() {
  const [phase, setPhase] = useState('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [role, setRole] = useState('');
  const [myNickname, setMyNickname] = useState('');
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => {
      setSocketConnected(false);
      setPhase('lobby');
      setRoomCode('');
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => { socket.off('connect', onConnect); socket.off('disconnect', onDisconnect); };
  }, []);

  const handleJoined = (code, r, nick, _hasPeer) => {
    setRoomCode(code);
    setRole(r);
    setMyNickname(nick);
    setPhase('room');
  };

  const handleLeave = () => {
    socket.disconnect();
    socket.connect();
    setPhase('lobby');
    setRoomCode('');
    setRole('');
    setMyNickname('');
  };

  if (!socketConnected && phase === 'lobby') {
    return (
      <div className="connecting-screen">
        <div className="spinner" />
        <p>Sunucuya bağlanıyor…</p>
      </div>
    );
  }

  return phase === 'lobby' ? (
    <Lobby onJoined={handleJoined} />
  ) : (
    <Room
      roomCode={roomCode}
      role={role}
      myNickname={myNickname}
      onLeave={handleLeave}
      theme={theme}
      onThemeChange={setTheme}
    />
  );
}
