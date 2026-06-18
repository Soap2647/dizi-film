import { useRef, useCallback } from 'react';

export function useReactionSound() {
  const ctxRef = useRef(null);

  function ac() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  const playKiss = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    const osc = c.createOscillator(); const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.025);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 0.28);
  }, []);

  const playHeartbeat = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    [0, 0.38].forEach(offset => {
      const osc = c.createOscillator(); const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, t + offset);
      osc.frequency.exponentialRampToValueAtTime(42, t + offset + 0.16);
      g.gain.setValueAtTime(0.45, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2);
      osc.connect(g); g.connect(c.destination);
      osc.start(t + offset); osc.stop(t + offset + 0.22);
    });
  }, []);

  const playClap = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    const sr = c.sampleRate;
    const len = Math.floor(sr * 0.14);
    const buf = c.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.35));
    const src = c.createBufferSource(); const g = c.createGain();
    const flt = c.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 1200; flt.Q.value = 0.7;
    g.gain.value = 0.4;
    src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(c.destination);
    src.start(t);
  }, []);

  const playSparkle = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    [880, 1108, 1318, 1760].forEach((freq, i) => {
      const osc = c.createOscillator(); const g = c.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      const dt = t + i * 0.075;
      g.gain.setValueAtTime(0.16, dt);
      g.gain.exponentialRampToValueAtTime(0.001, dt + 0.28);
      osc.connect(g); g.connect(c.destination);
      osc.start(dt); osc.stop(dt + 0.32);
    });
  }, []);

  const playCrackle = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    for (let i = 0; i < 4; i++) {
      const len = Math.floor(c.sampleRate * 0.055);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len);
      const src = c.createBufferSource(); const g = c.createGain();
      const flt = c.createBiquadFilter();
      flt.type = 'lowpass'; flt.frequency.value = 480;
      g.gain.value = 0.28;
      src.buffer = buf; src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start(t + i * 0.08);
    }
  }, []);

  const playPop = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    const osc = c.createOscillator(); const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g); g.connect(c.destination);
    osc.start(t); osc.stop(t + 0.18);
  }, []);

  const playHeartRainSound = useCallback(() => {
    const c = ac(); const t = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => {
      const osc = c.createOscillator(); const g = c.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      const dt = t + i * 0.1;
      g.gain.setValueAtTime(0.14, dt);
      g.gain.exponentialRampToValueAtTime(0.001, dt + 0.5);
      osc.connect(g); g.connect(c.destination);
      osc.start(dt); osc.stop(dt + 0.55);
    });
  }, []);

  const KISS    = new Set(['💋','😘','😗','😙','🥰']);
  const HEART   = new Set(['❤️','💕','💖','💗','💝','💞','💓','💟','🩷','🧡','💛','💜','🖤']);
  const CLAP    = new Set(['👏','🙌','🤜','🤛']);
  const SPARKLE = new Set(['✨','🎉','🥳','🎊','🌟','⭐','💫']);
  const FIRE    = new Set(['🔥']);

  const playForReaction = useCallback((content) => {
    const first = [...(content || '')][0];
    if (!first) return;
    if (KISS.has(first))    return playKiss();
    if (HEART.has(first))   return playHeartbeat();
    if (CLAP.has(first))    return playClap();
    if (SPARKLE.has(first)) return playSparkle();
    if (FIRE.has(first))    return playCrackle();
    playPop();
  }, [playKiss, playHeartbeat, playClap, playSparkle, playCrackle, playPop]);

  return { playForReaction, playHeartRainSound };
}
