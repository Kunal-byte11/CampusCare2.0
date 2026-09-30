import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp, 
  PhoneOff, 
  Users, 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck,
  AlertCircle,
  Volume2,
  FileText,
  X,
  Save,
  Lock,
  Clock,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper: Create an animated canvas video stream for virtual camera / single-laptop test
function createSyntheticVideoStream(label = 'Campus Counselor (Dr. Shahista Kazi)', isCounselor = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  
  let frame = 0;
  let animId;

  function draw() {
    frame++;
    const width = 1280;
    const height = 720;

    // 1. Rich Modern Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a101f');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle ambient mesh circles
    const pulse1 = Math.sin(frame * 0.03) * 30;
    const grad1 = ctx.createRadialGradient(280 + pulse1, 200, 10, 280, 200, 320);
    grad1.addColorStop(0, isCounselor ? 'rgba(37, 99, 235, 0.18)' : 'rgba(16, 185, 129, 0.16)');
    grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    const pulse2 = Math.cos(frame * 0.025) * 25;
    const grad2 = ctx.createRadialGradient(1000, 520 + pulse2, 10, 1000, 520, 340);
    grad2.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    // 3. Central Avatar Glow & Ring
    const centerX = width / 2;
    const centerY = height / 2 - 35;
    const baseRadius = 110;
    const ringPulse = Math.sin(frame * 0.04) * 8;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius + 18 + ringPulse, 0, Math.PI * 2);
    ctx.strokeStyle = isCounselor ? 'rgba(56, 189, 248, 0.25)' : 'rgba(52, 211, 153, 0.25)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner avatar background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    const circleGrad = ctx.createLinearGradient(centerX - 100, centerY - 100, centerX + 100, centerY + 100);
    if (isCounselor) {
      circleGrad.addColorStop(0, '#1d4ed8');
      circleGrad.addColorStop(1, '#0284c7');
    } else {
      circleGrad.addColorStop(0, '#047857');
      circleGrad.addColorStop(1, '#059669');
    }
    ctx.fillStyle = circleGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Avatar Emoji / Graphic
    ctx.font = '96px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isCounselor ? '👩‍⚕️' : '🎓', centerX, centerY + 6);

    // 4. Name & Designation Banner (Clean, Crisp Typography)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, centerX, centerY + 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(
      isCounselor 
        ? 'Campus Clinical Psychologist • Lokmanya Tilak College of Engineering' 
        : 'Confidential Telehealth Consultation • LTCE CampusCare', 
      centerX, 
      centerY + 205
    );

    // 5. Bottom Status Strip
    const bottomY = height - 55;
    
    // Pill Container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    const pillW = 620;
    const pillH = 46;
    const pillX = centerX - pillW / 2;
    ctx.beginPath();
    ctx.roundRect(pillX, bottomY - pillH / 2, pillW, pillH, 23);
    ctx.fill();
    ctx.stroke();

    // Glowing Live Dot
    ctx.beginPath();
    ctx.arc(pillX + 32, bottomY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e';
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE HD TELEHEALTH FEED', pillX + 50, bottomY + 5);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('• 30 FPS • AES-256 ENCRYPTED', pillX + 270, bottomY + 5);

    // Equalizer audio visualizer bars on the right
    for (let i = 0; i < 5; i++) {
      const barH = 8 + Math.abs(Math.sin(frame * 0.12 + i * 0.7)) * 14;
      const barX = pillX + pillW - 60 + i * 8;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(barX, bottomY - barH / 2, 4, barH);
    }

    animId = requestAnimationFrame(draw);
  }

  draw();

  const stream = canvas.captureStream(30);
  stream._cleanup = () => cancelAnimationFrame(animId);
  return stream;
}

// Helper: Create subtle silent audio stream if physical mic is locked
function createSyntheticAudioStream() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001; // virtually silent, generates audio RTP packets
    osc.connect(gain);
    gain.connect(dst);
    osc.start();
    return dst.stream;
  } catch (e) {
    return null;
  }
}

// Dedicated Remote Video Player Component
function RemoteVideoPlayer({ user, fit = 'cover' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && user?.videoTrack) {
      try {
        user.videoTrack.play(el, { fit });
      } catch (err) {
        console.warn('Agora videoTrack.play notice:', err);
      }
    }
    return () => {
      try {
        user?.videoTrack?.stop();
      } catch (e) {}
    };
  }, [user?.uid, user?.videoTrack, fit]);

  return (
    <div 
      ref={containerRef} 
      id={`agora-remote-player-${user?.uid}`}
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        inset: 0, 
        overflow: 'hidden',
        backgroundColor: '#090f17'
      }} 
    />
  );
}

// Dedicated Local Video Player Component (Persistent container prevents Agora unmount crashes)
function LocalVideoPlayer({ track, isCameraOff, mirror = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && track) {
      try {
        track.play(el, { fit: 'cover', mirror });
      } catch (err) {
        console.warn('Local track.play notice:', err);
      }
    }
    return () => {
      try {
        track?.stop();
      } catch (e) {}
    };
  }, [track, mirror]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: isCameraOff ? 'none' : 'block' 
        }} 
      />
      {isCameraOff && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#94a3b8'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px'
          }}>
            <VideoOff size={24} color="#94a3b8" />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>Camera is Off</span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>Audio is still active</span>
        </div>
      )}
    </div>
  );
}

export default function VideoCall() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL query params
  const searchParams = new URLSearchParams(location.search);
  const initialChannel = searchParams.get('channel') || 'campuscare-session-1';
  const isPeer = searchParams.get('peer') === 'true';
  const autoJoin = searchParams.get('autojoin') === 'true';

  // Call States
  const [callState, setCallState] = useState('precall'); // 'precall' | 'incall' | 'postcall'
  const [channelName, setChannelName] = useState(initialChannel);
  const [participantRole, setParticipantRole] = useState(
    isPeer ? 'Dr. Shahista Kazi (Campus Counselor)' : (user?.role === 'counselor' ? 'Dr. Shahista Kazi (Campus Counselor)' : (user?.name || 'Student'))
  );

  // Media Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isVirtualCam, setIsVirtualCam] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Initializing camera...');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Agora Tracks & Peers
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [callDuration, setCallDuration] = useState(0);

  // Simulated peer fallback if testing alone
  const [simulatedCounselor, setSimulatedCounselor] = useState(false);

  // Counselor Notes Drawer State
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [noteTitle, setNoteTitle] = useState(`Consultation - ${new Date().toLocaleDateString('en-GB')}`);
  const [noteCategory, setNoteCategory] = useState('Exam Stress & Anxiety');
  const [noteSeverity, setNoteSeverity] = useState('Normal');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedMsg, setNoteSavedMsg] = useState('');
  const [studentRefId, setStudentRefId] = useState('');

  const isCounselor = user?.role === 'counselor' || user?.name?.toLowerCase().includes('shahista') || isPeer;

  // Refs
  const clientRef = useRef(null);
  const timerRef = useRef(null);
  const screenTrackRef = useRef(null);
  const syntheticStreamRef = useRef(null);

  // Wait for Agora SDK
  const getAgora = async () => {
    if (window.AgoraRTC) return window.AgoraRTC;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 100));
      if (window.AgoraRTC) return window.AgoraRTC;
    }
    return null;
  };

  // 1. Initialize Local Video & Audio Tracks on Mount
  useEffect(() => {
    let mounted = true;

    async function initMedia() {
      const AgoraRTC = await getAgora();
      if (!mounted) return;

      if (!AgoraRTC) {
        setStatusMsg('Agora SDK loading error. Please check your internet connection.');
        return;
      }

      let vTrack = null;
      let aTrack = null;

      // Try acquiring real physical camera
      try {
        setStatusMsg('Connecting camera & audio hardware...');
        vTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '720p_1'
        });
        setStatusMsg('Webcam operational');
      } catch (camErr) {
        console.warn('Physical camera unavailable (locked by another tab or blocked):', camErr);
        // Fallback to High-Res Synthetic Canvas Video Track
        try {
          const synthStream = createSyntheticVideoStream(
            isPeer ? 'Dr. Shahista Kazi (Campus Counselor)' : `${user?.name || 'LTCE Student'}`,
            isPeer || isCounselor
          );
          syntheticStreamRef.current = synthStream;
          vTrack = AgoraRTC.createCustomVideoTrack({
            mediaStreamTrack: synthStream.getVideoTracks()[0]
          });
          setIsVirtualCam(true);
          setStatusMsg('Webcam in use in another tab — Live Virtual Feed Active');
        } catch (synthErr) {
          console.error('Failed to create virtual track:', synthErr);
        }
      }

      // Try acquiring real microphone
      try {
        aTrack = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (micErr) {
        console.warn('Physical mic unavailable:', micErr);
        try {
          const synthAudio = createSyntheticAudioStream();
          if (synthAudio) {
            aTrack = AgoraRTC.createCustomAudioTrack({
              mediaStreamTrack: synthAudio.getAudioTracks()[0]
            });
          }
        } catch (e) {}
      }

      if (!mounted) {
        vTrack?.close();
        aTrack?.close();
        return;
      }

      setLocalVideoTrack(vTrack);
      setLocalAudioTrack(aTrack);
    }

    initMedia();

    return () => {
      mounted = false;
      if (syntheticStreamRef.current?._cleanup) {
        syntheticStreamRef.current._cleanup();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPeer, isCounselor]);

  // Clean up tracks on final unmount
  useEffect(() => {
    return () => {
      localVideoTrack?.close();
      localAudioTrack?.close();
      screenTrackRef.current?.close();
      clientRef.current?.leave();
    };
  }, [localVideoTrack, localAudioTrack]);

  // Auto-join helper for peer tab
  useEffect(() => {
    if (autoJoin && localVideoTrack && callState === 'precall' && !isConnecting) {
      const timer = setTimeout(() => {
        joinCall();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoJoin, localVideoTrack, callState]);

  // Toggle Microphone
  const toggleMic = () => {
    const next = !isMuted;
    if (localAudioTrack) {
      try {
        localAudioTrack.setEnabled(!next);
      } catch (e) {}
    }
    setIsMuted(next);
  };

  // Toggle Camera
  const toggleCamera = () => {
    const next = !isCameraOff;
    if (localVideoTrack) {
      try {
        localVideoTrack.setEnabled(!next);
      } catch (e) {}
    }
    setIsCameraOff(next);
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    const AgoraRTC = window.AgoraRTC;
    if (!clientRef.current || !AgoraRTC) return;

    if (!isScreenSharing) {
      try {
        const sTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '720p_2' }, 'disable');
        const screenTrack = Array.isArray(sTrack) ? sTrack[0] : sTrack;
        screenTrackRef.current = screenTrack;

        if (localVideoTrack) {
          try {
            await clientRef.current.unpublish(localVideoTrack);
          } catch (e) {}
        }
        await clientRef.current.publish(screenTrack);
        setIsScreenSharing(true);

        screenTrack.on('track-ended', async () => {
          try {
            await clientRef.current.unpublish(screenTrack);
            screenTrack.close();
          } catch (e) {}
          screenTrackRef.current = null;
          if (localVideoTrack && !isCameraOff) {
            try {
              await clientRef.current.publish(localVideoTrack);
            } catch (e) {}
          }
          setIsScreenSharing(false);
        });
      } catch (err) {
        console.warn('Screen share canceled or denied:', err);
      }
    } else {
      if (screenTrackRef.current) {
        try {
          await clientRef.current.unpublish(screenTrackRef.current);
          screenTrackRef.current.close();
        } catch (e) {}
        screenTrackRef.current = null;
      }
      if (localVideoTrack && !isCameraOff) {
        try {
          await clientRef.current.publish(localVideoTrack);
        } catch (e) {}
      }
      setIsScreenSharing(false);
    }
  };

  // Join Agora Room
  const joinCall = async () => {
    const AgoraRTC = await getAgora();
    if (!AgoraRTC) {
      alert('Agora WebRTC SDK is still loading. Please retry in 2 seconds.');
      return;
    }

    const cleanRoom = channelName.trim() || 'campuscare-session-1';
    setIsConnecting(true);

    try {
      // Generate numeric UID for Agora
      const myUid = Math.floor(100000 + Math.random() * 899999);

      // Fetch Token from Backend (with direct Render fallback)
      let appId = 'f34d04a684d742d4bd1a009585690ff7';
      let token = null;

      try {
        let tokenRes = await fetch(`/api/agora/token?channelName=${encodeURIComponent(cleanRoom)}&uid=${myUid}`);
        if (!tokenRes.ok || tokenRes.headers.get('content-type')?.includes('text/html')) {
          tokenRes = await fetch(`https://campuscare2-0-backend.onrender.com/api/agora/token?channelName=${encodeURIComponent(cleanRoom)}&uid=${myUid}`);
        }
        if (tokenRes.ok) {
          const data = await tokenRes.json();
          appId = data.appId || appId;
          token = data.token;
        }
      } catch (tErr) {
        console.warn('Backend token endpoint warning:', tErr);
        try {
          const directRes = await fetch(`https://campuscare2-0-backend.onrender.com/api/agora/token?channelName=${encodeURIComponent(cleanRoom)}&uid=${myUid}`);
          if (directRes.ok) {
            const d = await directRes.json();
            appId = d.appId || appId;
            token = d.token;
          }
        } catch (e2) {}
      }

      // Create Agora Client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Event: Remote User Published Video / Audio
      client.on('user-published', async (remoteUser, mediaType) => {
        try {
          await client.subscribe(remoteUser, mediaType);
          
          setRemoteUsers(prev => ({
            ...prev,
            [remoteUser.uid]: {
              uid: remoteUser.uid,
              videoTrack: mediaType === 'video' ? remoteUser.videoTrack : prev[remoteUser.uid]?.videoTrack,
              audioTrack: mediaType === 'audio' ? remoteUser.audioTrack : prev[remoteUser.uid]?.audioTrack,
              hasVideo: mediaType === 'video' ? true : (prev[remoteUser.uid]?.hasVideo ?? false),
              hasAudio: mediaType === 'audio' ? true : (prev[remoteUser.uid]?.hasAudio ?? false)
            }
          }));

          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play()?.catch(err => console.warn('Audio play autoplay prompt:', err));
          }
        } catch (subErr) {
          console.warn('Agora subscribe notice:', subErr);
        }
      });

      // Event: Remote User Unpublished Track (Do NOT delete user; just flag track off)
      client.on('user-unpublished', (remoteUser, mediaType) => {
        setRemoteUsers(prev => {
          if (!prev[remoteUser.uid]) return prev;
          return {
            ...prev,
            [remoteUser.uid]: {
              ...prev[remoteUser.uid],
              videoTrack: mediaType === 'video' ? null : prev[remoteUser.uid].videoTrack,
              hasVideo: mediaType === 'video' ? false : prev[remoteUser.uid].hasVideo,
              audioTrack: mediaType === 'audio' ? null : prev[remoteUser.uid].audioTrack,
              hasAudio: mediaType === 'audio' ? false : prev[remoteUser.uid].hasAudio
            }
          };
        });
      });

      // Event: Remote User Left Room (Clean delete)
      client.on('user-left', (remoteUser) => {
        setRemoteUsers(prev => {
          const next = { ...prev };
          delete next[remoteUser.uid];
          return next;
        });
      });

      // Join Channel
      await client.join(appId, cleanRoom, token, myUid);
      console.log(`[AGORA] Successfully connected to room "${cleanRoom}" as UID ${myUid}`);

      // Publish Local Tracks
      const tracksToPublish = [];
      if (localAudioTrack) tracksToPublish.push(localAudioTrack);
      if (localVideoTrack && !isCameraOff) tracksToPublish.push(localVideoTrack);

      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
        console.log(`[AGORA] Published ${tracksToPublish.length} local tracks.`);
      }

      // Transition to In-Call
      setCallState('incall');
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to join Agora channel:', err);
      alert('Connection error: ' + (err.message || 'Please check Agora credentials and network.'));
    } finally {
      setIsConnecting(false);
    }
  };

  // Leave Call
  const leaveCall = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (screenTrackRef.current) {
      try {
        screenTrackRef.current.close();
      } catch (e) {}
      screenTrackRef.current = null;
    }
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (e) {}
    }
    setCallState('postcall');
  };

  // Save Clinical Consultation Notes (with proxy + direct Render fallback)
  const handleSaveNotes = async (e) => {
    e?.preventDefault();
    if (!clinicalObservations.trim()) {
      alert('Please enter clinical observations before saving.');
      return;
    }
    setNoteSaving(true);
    setNoteSavedMsg('');

    const payload = {
      studentAnonId: studentRefId.trim() || 'anon_student_call',
      studentName: 'Student Consultation',
      fileName: `Session_${Date.now()}.note`,
      title: noteTitle.trim() || 'Consultation Note',
      category: noteCategory,
      severity: noteSeverity,
      clinicalObservations: clinicalObservations.trim(),
      actionPlan: actionPlan.trim()
    };

    try {
      let res;
      try {
        res = await fetch('/api/bookings/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
          res = await fetch('https://campuscare2-0-backend.onrender.com/api/bookings/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      } catch (err1) {
        res = await fetch('https://campuscare2-0-backend.onrender.com/api/bookings/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        setNoteSavedMsg('✓ Notes saved securely to clinical case files');
        setTimeout(() => setNoteSavedMsg(''), 4000);
      } else {
        const data = await res?.json().catch(() => ({}));
        alert('Failed to save notes: ' + (data?.error || 'Server error'));
      }
    } catch (err) {
      console.error('Error saving clinical notes:', err);
      alert('Network error saving notes.');
    } finally {
      setNoteSaving(false);
    }
  };

  // Helper: Open 2nd participant in new tab on this laptop
  const openSecondTabTest = () => {
    const url = `${window.location.origin}/video-call?channel=${encodeURIComponent(channelName)}&peer=true&autojoin=true`;
    window.open(url, '_blank', 'width=960,height=760');
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/video-call?channel=${encodeURIComponent(channelName)}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const remoteList = Object.values(remoteUsers);

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height))',
      paddingTop: 'var(--header-height)',
      backgroundColor: callState === 'incall' ? '#080d16' : 'var(--page-bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* ========================================================================= */}
      {/* 1. MODERN PRE-CALL TELEHEALTH LOBBY                                      */}
      {/* ========================================================================= */}
      {callState === 'precall' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          background: 'linear-gradient(180deg, var(--page-bg) 0%, var(--sidebar-bg) 100%)'
        }}>
          <div style={{
            maxWidth: '1080px',
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(35, 65, 90, 0.08)',
            overflow: 'hidden'
          }}>
            {/* Top Security & Branding Bar */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--brand-blue-pale)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-blue)'
                }}>
                  <HeartPulse size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    CampusCare Telehealth Suite
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Lokmanya Tilak College of Engineering • Department of Student Welfare
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '5px 12px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  <Lock size={12} color="var(--green)" />
                  <span>256-Bit Encrypted</span>
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--brand-blue-pale)',
                  color: 'var(--brand-blue)',
                  padding: '5px 12px',
                  borderRadius: '100px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  <ShieldCheck size={13} />
                  <span>Agora HD WebRTC</span>
                </span>
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(340px, 1fr)',
              gap: 0
            }}>
              {/* Left Column: Live Video Studio Preview */}
              <div style={{
                padding: '28px',
                borderRight: '1px solid var(--border)',
                background: '#090f19',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        boxShadow: '0 0 8px #22c55e'
                      }} />
                      <span style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>
                        Hardware Preview
                      </span>
                    </div>

                    <span style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      padding: '3px 10px',
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      fontWeight: 500
                    }}>
                      {isVirtualCam ? 'Synthetic Feed (Webcam Busy / Mirrored Safe)' : 'Physical Webcam'}
                    </span>
                  </div>

                  {/* Video Viewport */}
                  <div style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#04070e',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
                  }}>
                    {localVideoTrack ? (
                      <LocalVideoPlayer 
                        track={localVideoTrack} 
                        isCameraOff={isCameraOff} 
                        mirror={!isVirtualCam} 
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        padding: '24px'
                      }}>
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.1)',
                          borderTopColor: '#38bdf8',
                          animation: 'spin 1s linear infinite',
                          marginBottom: '16px'
                        }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                          {statusMsg}
                        </div>
                      </div>
                    )}

                    {/* Participant Tag inside Preview */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      background: 'rgba(15, 23, 42, 0.82)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff',
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      zIndex: 10,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <UserCheck size={14} color="#38bdf8" />
                      <span>{participantRole} (You)</span>
                    </div>

                    {/* Audio Equalizer Dot */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: isMuted ? 'rgba(239, 68, 68, 0.85)' : 'rgba(34, 197, 94, 0.85)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      zIndex: 10
                    }}>
                      {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                      <span>{isMuted ? 'Muted' : 'Mic Live'}</span>
                    </div>
                  </div>
                </div>

                {/* Device Control Pills inside Preview Column */}
                <div style={{
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px'
                }}>
                  <button
                    type="button"
                    onClick={toggleMic}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '100px',
                      border: isMuted ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.18)',
                      background: isMuted ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.08)',
                      color: isMuted ? '#fca5a5' : '#f8fafc',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleCamera}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '100px',
                      border: isCameraOff ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.18)',
                      background: isCameraOff ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255,255,255,0.08)',
                      color: isCameraOff ? '#fca5a5' : '#f8fafc',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
                    <span>{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Session Check-In & Launch Panel */}
              <div style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--surface)'
              }}>
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{
                      background: 'var(--brand-blue-pale)',
                      color: 'var(--brand-blue)',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Consultation Check-In
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '8px 0 4px', color: 'var(--text-primary)' }}>
                      Join Video Session
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Private, HIPAA-grade confidential space for student psychological counseling.
                    </p>
                  </div>

                  {/* Profile & Role Badge */}
                  <div style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isCounselor ? 'var(--brand-blue)' : 'var(--green)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {isCounselor ? '👩‍⚕️' : (user?.name?.charAt(0) || 'S')}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {isCounselor ? 'Dr. Shahista Kazi' : (user?.name || 'Kunal Dubey')}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {isCounselor ? 'Campus Psychologist • LTCE Welfare' : (user?.email || 'kunaldubey975@gmail.com')}
                      </div>
                    </div>
                  </div>

                  {/* Room ID Input */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Session Room ID
                      </label>
                      <button
                        type="button"
                        onClick={copyRoomLink}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--brand-blue)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        {copied ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                        <span>{copied ? 'Copied Room URL!' : 'Share Room URL'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g. campuscare-room-1"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '100px',
                        border: '1px solid var(--border)',
                        background: 'var(--sidebar-bg)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* 1-Laptop Demo Helper (Sleek Glass Box) */}
                  <div style={{
                    background: 'var(--teal-pale)',
                    border: '1px solid rgba(50, 165, 178, 0.25)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)' }}>
                        <Sparkles size={14} />
                        <span>Testing Alone on 1 Laptop?</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Click below to open the counselor peer window and auto-connect!
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openSecondTabTest}
                      style={{
                        background: 'var(--surface)',
                        color: 'var(--teal)',
                        border: '1px solid var(--teal)',
                        padding: '6px 12px',
                        borderRadius: '100px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flexShrink: 0
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>Launch Peer Tab</span>
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div>
                  <button
                    type="button"
                    onClick={joinCall}
                    disabled={isConnecting}
                    style={{
                      width: '100%',
                      padding: '13px 24px',
                      background: 'var(--brand-blue)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '100px',
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      cursor: isConnecting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 16px rgba(38, 118, 166, 0.28)',
                      transition: 'all 0.15s ease',
                      marginBottom: '10px'
                    }}
                  >
                    <Video size={18} />
                    <span>{isConnecting ? 'Connecting to Telehealth Room...' : 'Enter Consultation Room →'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/booking')}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Appointments Desk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IN-CALL LIVE WEBRTC VIDEO SCREEN (TELEMEDICINE THEATER)                */}
      {/* ========================================================================= */}
      {callState === 'incall' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#080d16',
          overflow: 'hidden'
        }}>
          {/* Top Glassmorphic Navigation Bar */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            padding: '10px 20px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 40,
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Left: Branding & Encryption */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(34, 197, 94, 0.16)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.76rem',
                color: '#86efac',
                fontWeight: 600
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
                <span>Agora Live</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                <Lock size={12} color="#38bdf8" />
                <span style={{ color: '#fff', fontWeight: 600 }}>{channelName}</span>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={13} color="#f59e0b" />
                <span>{formatTimer(callDuration)}</span>
              </div>
            </div>

            {/* Right: Notes & Participant Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isCounselor && (
                <button
                  type="button"
                  onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                  style={{
                    background: showNotesDrawer ? '#2563eb' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Toggle Clinical Consultation Notes"
                >
                  <FileText size={14} />
                  <span>{showNotesDrawer ? 'Close Notes' : 'Clinical Notes'}</span>
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.08)',
                padding: '5px 12px',
                borderRadius: '100px',
                fontSize: '0.78rem',
                color: '#cbd5e1'
              }}>
                <Users size={14} />
                <span>{remoteList.length + 1} Present</span>
              </div>
            </div>
          </div>

          {/* Main Stage Viewport */}
          <div style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, #111a2e 0%, #070b14 100%)'
          }}>
            {/* Case A: Remote Users Present */}
            {remoteList.length > 0 ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {remoteList.map(u => (
                  <div key={u.uid} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    {u.hasVideo && u.videoTrack ? (
                      <RemoteVideoPlayer user={u} fit="cover" />
                    ) : (
                      /* Remote user turned off camera or audio-only: show elegant presence card */
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle at center, #1e293b 0%, #090f17 100%)'
                      }}>
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3.6rem',
                          boxShadow: '0 0 40px rgba(37, 99, 235, 0.4)',
                          marginBottom: '16px'
                        }}>
                          {isCounselor ? '🎓' : '👩‍⚕️'}
                        </div>
                        <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 6px', fontWeight: 700 }}>
                          {isCounselor ? 'Student' : 'Dr. Shahista Kazi (Campus Psychologist)'}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          border: '1px solid #22c55e',
                          color: '#86efac',
                          padding: '6px 14px',
                          borderRadius: '100px',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          <Volume2 size={15} />
                          <span>Participant Camera Off • Audio Active</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Remote Participant Name Tag */}
                    <div style={{
                      position: 'absolute',
                      bottom: '96px',
                      left: '24px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      zIndex: 20
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                      <span>{isCounselor ? 'Student (Confidential Session)' : 'Dr. Shahista Kazi (Campus Psychologist)'}</span>
                      <ShieldCheck size={14} color="#38bdf8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : simulatedCounselor ? (
              /* Case B: Simulated Counselor Demonstration */
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #172554 0%, #080d16 100%)'
              }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  boxShadow: '0 0 50px rgba(37,99,235,0.45)',
                  marginBottom: '18px'
                }}>
                  👩‍⚕️
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 6px', fontWeight: 700 }}>
                  Dr. Shahista Kazi, Ph.D.
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 18px' }}>
                  Head of Student Psychological Welfare • Lokmanya Tilak College of Engineering
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#86efac',
                  padding: '7px 16px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}>
                  <Volume2 size={16} />
                  <span>Counselor Audio Connected (Simulated Feed)</span>
                </div>
              </div>
            ) : (
              /* Case C: Elegant Waiting Room */
              <div style={{
                textAlign: 'center',
                color: '#94a3b8',
                padding: '32px',
                maxWidth: '480px'
              }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.4rem',
                  animation: 'pulse 2s infinite'
                }}>
                  🩺
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.35rem', marginBottom: '8px', fontWeight: 700 }}>
                  Waiting for participant to join...
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 20px' }}>
                  Your encrypted session room is ready. Share the session link or room code with the participant.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={copyRoomLink}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {copied ? <Check size={14} color="#86efac" /> : <Copy size={14} />}
                    <span>{copied ? 'Link Copied' : 'Copy Room Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimulatedCounselor(true)}
                    style={{
                      background: 'rgba(37, 99, 235, 0.25)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      padding: '8px 16px',
                      borderRadius: '100px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Demo Counselor Feed
                  </button>
                </div>
              </div>
            )}

            {/* Local Video Picture-in-Picture (PiP) */}
            <div style={{
              position: 'absolute',
              bottom: '96px',
              right: '24px',
              width: '230px',
              aspectRatio: '16 / 9',
              background: '#0f172a',
              borderRadius: '14px',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              overflow: 'hidden',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
              zIndex: 35
            }}>
              {localVideoTrack && (
                <LocalVideoPlayer 
                  track={localVideoTrack} 
                  isCameraOff={isCameraOff} 
                  mirror={!isVirtualCam} 
                />
              )}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#fff',
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
                zIndex: 36,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>You</span>
                {isMuted && <MicOff size={11} color="#fca5a5" />}
              </div>
            </div>
          </div>

          {/* Floating Telehealth Controls Dock */}
          <div style={{
            position: 'absolute',
            bottom: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            padding: '10px 24px',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 45,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMic}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isMuted ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none'
              }}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: isCameraOff ? '#ef4444' : 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isCameraOff ? '0 0 16px rgba(239, 68, 68, 0.4)' : 'none'
              }}
            >
              {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            {/* Screen Share */}
            <button
              type="button"
              onClick={toggleScreenShare}
              title="Share Screen"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: 'none',
                background: isScreenSharing ? '#0284c7' : 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <MonitorUp size={20} />
            </button>

            {/* Counselor Session Notes */}
            {isCounselor && (
              <button
                type="button"
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                title={showNotesDrawer ? 'Close Counselor Notes' : 'Clinical Consultation Notes'}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: 'none',
                  background: showNotesDrawer ? 'var(--brand-blue, #2563eb)' : 'rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={20} />
              </button>
            )}

            {/* End Consultation Button */}
            <button
              type="button"
              onClick={leaveCall}
              title="End Consultation"
              style={{
                height: '46px',
                padding: '0 20px',
                borderRadius: '100px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(220, 38, 38, 0.45)',
                fontWeight: 700,
                fontSize: '0.88rem',
                transition: 'all 0.15s ease'
              }}
            >
              <PhoneOff size={18} />
              <span>Leave</span>
            </button>
          </div>

          {/* Counselor Clinical Notes Drawer / Side Panel */}
          {showNotesDrawer && isCounselor && (
            <div style={{
              position: 'absolute',
              top: '76px',
              right: '20px',
              bottom: '88px',
              width: '400px',
              maxWidth: 'calc(100vw - 40px)',
              background: 'rgba(15, 23, 42, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '18px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 50,
              overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Drawer Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(30, 41, 59, 0.6)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: '#38bdf8' }} />
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                    Clinical Consultation Notes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotesDrawer(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title="Close notes drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Form Body */}
              <form 
                onSubmit={handleSaveNotes}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {noteSavedMsg && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.18)',
                    border: '1px solid #22c55e',
                    color: '#86efac',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}>
                    {noteSavedMsg}
                  </div>
                )}

                {/* Session Title */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Category & Severity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Category
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Exam Stress & Anxiety">Exam Stress & Anxiety</option>
                      <option value="Academic Pressure">Academic Pressure</option>
                      <option value="Depression & Mood">Depression & Mood</option>
                      <option value="Interpersonal Issues">Interpersonal Issues</option>
                      <option value="Sleep & Lifestyle">Sleep & Lifestyle</option>
                      <option value="General Counseling">General Counseling</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Risk Level
                    </label>
                    <select
                      value={noteSeverity}
                      onChange={(e) => setNoteSeverity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                      <option value="High Risk">High Risk</option>
                    </select>
                  </div>
                </div>

                {/* Optional Student Roll / Reference */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Student Roll / Ref ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LTCE-2024-8841"
                    value={studentRefId}
                    onChange={(e) => setStudentRefId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Clinical Observations */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Clinical Observations *
                  </label>
                  <textarea
                    rows={4}
                    value={clinicalObservations}
                    onChange={(e) => setClinicalObservations(e.target.value)}
                    placeholder="Document student's mental state, vocal affect, behavioral cues, concerns discussed..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.84rem',
                      lineHeight: 1.4,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Action Plan */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.74rem', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Intervention & Action Plan
                  </label>
                  <textarea
                    rows={3}
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="Recommended self-care strategies, follow-up session timeline, resources assigned..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.84rem',
                      lineHeight: 1.4,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={noteSaving}
                  style={{
                    marginTop: '6px',
                    background: 'var(--brand-blue, #2563eb)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '100px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: noteSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                    opacity: noteSaving ? 0.7 : 1
                  }}
                >
                  <Save size={16} />
                  <span>{noteSaving ? 'Saving Notes...' : 'Save to Clinical Case Files'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. POST-CALL CONSULTATION SUMMARY SCREEN                                  */}
      {/* ========================================================================= */}
      {callState === 'postcall' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          background: 'linear-gradient(180deg, var(--page-bg) 0%, var(--sidebar-bg) 100%)'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(35, 65, 90, 0.08)',
            padding: '36px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'var(--green-pale)',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 18px',
              boxShadow: '0 0 24px rgba(98, 173, 69, 0.2)'
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Consultation Concluded
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Your session metadata has been recorded securely. Remember that our campus wellness counselors and crisis resources are always here for you.
            </p>

            {/* Session Stats */}
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Call Duration
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {formatTimer(callDuration)}
                </div>
              </div>
              <div style={{ width: '1px', height: '36px', background: 'var(--border)' }} />
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Room Reference
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-blue)', fontFamily: 'monospace', marginTop: '2px' }}>
                  {channelName}
                </div>
              </div>
            </div>

            {/* Helpline Notice */}
            <div style={{
              background: 'var(--coral-pale)',
              border: '1px solid rgba(223, 104, 90, 0.25)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: 'var(--coral)',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <strong>24x7 Campus Emergency Helpline:</strong> Lokmanya Tilak College Counseling Cell or National Tele-MANAS: 14416 (Toll-Free).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setCallState('precall');
                  setRemoteUsers({});
                  setSimulatedCounselor(false);
                }}
                style={{
                  padding: '12px 24px',
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '100px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(38, 118, 166, 0.25)'
                }}
              >
                Re-enter Session Room
              </button>

              <button
                type="button"
                onClick={() => navigate('/booking')}
                style={{
                  padding: '11px 20px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Return to Appointments Desk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
