import { useRef, useState, useCallback, useEffect } from 'react';
import socket from '../socket.js';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

export function useWebRTC() {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isSharing, setIsSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [shareError, setShareError] = useState(null);

  const createPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
    }
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('rtc-ice-candidate', { candidate: e.candidate });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setRemoteStream(null);
      }
    };

    peerRef.current = pc;
    return pc;
  }, []);

  // Start screen sharing (caller side)
  const startScreenShare = useCallback(async () => {
    setShareError(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setShareError('Ekran paylaşımı izni reddedildi.');
      } else {
        setShareError('Ekran paylaşımı başlatılamadı: ' + err.message);
      }
      return;
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    setIsSharing(true);

    const pc = createPeer();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // When user stops via browser's native button
    stream.getVideoTracks()[0].onended = () => {
      stopScreenShare();
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('rtc-offer', { offer });
    } catch (err) {
      setShareError('Bağlantı teklifi oluşturulamadı: ' + err.message);
    }
  }, [createPeer]);

  const stopScreenShare = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setIsSharing(false);
    setLocalStream(null);
    socket.emit('screen-share-stopped');
  }, []);

  // Listen for incoming WebRTC signals
  useEffect(() => {
    const handleOffer = async ({ offer }) => {
      const pc = createPeer();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('rtc-answer', { answer });
    };

    const handleAnswer = async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIce = async ({ candidate }) => {
      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (_) {
          // Ignore stale candidates
        }
      }
    };

    const handleShareStopped = () => {
      setRemoteStream(null);
    };

    socket.on('rtc-offer', handleOffer);
    socket.on('rtc-answer', handleAnswer);
    socket.on('rtc-ice-candidate', handleIce);
    socket.on('screen-share-stopped', handleShareStopped);

    return () => {
      socket.off('rtc-offer', handleOffer);
      socket.off('rtc-answer', handleAnswer);
      socket.off('rtc-ice-candidate', handleIce);
      socket.off('screen-share-stopped', handleShareStopped);
    };
  }, [createPeer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScreenShare();
    };
  }, [stopScreenShare]);

  return { isSharing, localStream, remoteStream, shareError, startScreenShare, stopScreenShare };
}
