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
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Helper: Create an animated canvas video stream for virtual camera / single-laptop test
function createSyntheticVideoStream(label = 'Campus Counselor (Dr. Shahista Kazi)') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  
  let frame = 0;
  let animId;

  function draw() {
    frame++;
    // Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Glowing Circle behind avatar
    const pulse = Math.sin(frame * 0.05) * 8;
    ctx.beginPath();
    ctx.arc(320, 200, 75 + pulse, 0, Math.PI * 2);
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    // Avatar emoji
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👩‍🏫', 320, 200);

    // Name banner
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(label, 320, 310);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Lokmanya Tilak College of Engineering • Mental Wellness', 320, 340);

    // Live Badge
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(235, 385, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LIVE VIRTUAL FEED • WEBRTC CONNECTED', 250, 390);

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
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const dst = ctx.createMediaStreamDestination();
  const gain = ctx.createGain();
  gain.gain.value = 0.0001; // virtually silent, generates audio RTP packets
  osc.connect(gain);
  gain.connect(dst);
  osc.start();
  return dst.stream;
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

// Dedicated Local Video Player Component
function LocalVideoPlayer({ track, isCameraOff, mirror = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && track && !isCameraOff) {
      try {
        track.play(el, { fit: 'cover', mirror });
      } catch (err) {
        console.warn('Local track.play notice:', err);
      }
    }
  }, [track, isCameraOff, mirror]);

  if (isCameraOff) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e293b',
        color: '#94a3b8'
      }}>
        <VideoOff size={32} style={{ marginBottom: '6px' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Camera Off</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }} 
    />
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

  // Call States
  const [callState, setCallState] = useState('precall'); // 'precall' | 'incall' | 'postcall'
  const [channelName, setChannelName] = useState(initialChannel);
  const [participantRole, setParticipantRole] = useState(
    isPeer ? 'Counselor (Ms. Shahista Kazi)' : (user?.role === 'counselor' ? 'Counselor' : (user?.name || 'Student'))
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

  const handleSaveNotes = async (e) => {
    e?.preventDefault();
    if (!clinicalObservations.trim()) {
      alert('Please enter clinical observations before saving.');
      return;
    }
    setNoteSaving(true);
    setNoteSavedMsg('');

    try {
      const res = await fetch('/api/bookings/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnonId: studentRefId.trim() || 'anon_student_call',
          studentName: 'Student Consultation',
          fileName: `Session_${Date.now()}.note`,
          title: noteTitle.trim() || 'Consultation Note',
          category: noteCategory,
          severity: noteSeverity,
          clinicalObservations: clinicalObservations.trim(),
          actionPlan: actionPlan.trim()
        })
      });

      if (res.ok) {
        setNoteSavedMsg('✓ Notes saved securely to clinical case files');
        setTimeout(() => setNoteSavedMsg(''), 4000);
      } else {
        const data = await res.json();
        alert('Failed to save notes: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      console.error('Error saving clinical notes:', err);
      alert('Network error saving notes.');
    } finally {
      setNoteSaving(false);
    }
  };

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
        setStatusMsg('Agora SDK loading error. Please check internet connection.');
        return;
      }

      let vTrack = null;
      let aTrack = null;

      // Try acquiring real physical camera
      try {
        setStatusMsg('Requesting camera & microphone...');
        vTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '720p_1'
        });
        setStatusMsg('Camera ready');
      } catch (camErr) {
        console.warn('Physical camera unavailable (likely locked by another tab or blocked):', camErr);
        // Fallback to Synthetic Canvas Video Track
        try {
          const synthStream = createSyntheticVideoStream(
            isPeer ? 'Campus Counselor (Dr. Shahista Kazi)' : `${user?.name || 'LTCE Student'} (Virtual Feed)`
          );
          syntheticStreamRef.current = synthStream;
          vTrack = AgoraRTC.createCustomVideoTrack({
            mediaStreamTrack: synthStream.getVideoTracks()[0]
          });
          setIsVirtualCam(true);
          setStatusMsg('Physical webcam busy in other tab — using Live Virtual Video Feed');
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
  }, [isPeer]);

  // Clean up tracks on final unmount
  useEffect(() => {
    return () => {
      localVideoTrack?.close();
      localAudioTrack?.close();
      screenTrackRef.current?.close();
      clientRef.current?.leave();
    };
  }, [localVideoTrack, localAudioTrack]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localAudioTrack) {
      const next = !isMuted;
      localAudioTrack.setEnabled(!next);
      setIsMuted(next);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localVideoTrack) {
      const next = !isCameraOff;
      localVideoTrack.setEnabled(!next);
      setIsCameraOff(next);
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    const AgoraRTC = window.AgoraRTC;
    if (!clientRef.current || !AgoraRTC) return;

    if (!isScreenSharing) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '720p_2' });
        screenTrackRef.current = screenTrack;

        if (localVideoTrack) {
          await clientRef.current.unpublish(localVideoTrack);
        }
        await clientRef.current.publish(screenTrack);
        setIsScreenSharing(true);

        screenTrack.on('track-ended', async () => {
          await clientRef.current.unpublish(screenTrack);
          screenTrack.close();
          screenTrackRef.current = null;
          if (localVideoTrack) {
            await clientRef.current.publish(localVideoTrack);
          }
          setIsScreenSharing(false);
        });
      } catch (err) {
        console.warn('Screen share canceled or denied:', err);
      }
    } else {
      if (screenTrackRef.current) {
        await clientRef.current.unpublish(screenTrackRef.current);
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }
      if (localVideoTrack) {
        await clientRef.current.publish(localVideoTrack);
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

      // Fetch Token from Backend
      let appId = 'f34d04a684d742d4bd1a009585690ff7';
      let token = null;

      try {
        const tokenRes = await fetch(`/api/agora/token?channelName=${encodeURIComponent(cleanRoom)}&uid=${myUid}`);
        if (tokenRes.ok) {
          const data = await tokenRes.json();
          appId = data.appId || appId;
          token = data.token;
        }
      } catch (tErr) {
        console.warn('Backend token endpoint warning:', tErr);
      }

      // Create Agora Client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Event: Remote User Published Video / Audio
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers(prev => ({
            ...prev,
            [remoteUser.uid]: remoteUser
          }));

          // Direct playback fallback on next tick
          setTimeout(() => {
            const playerEl = document.getElementById(`agora-remote-player-${remoteUser.uid}`);
            if (playerEl && remoteUser.videoTrack) {
              try {
                remoteUser.videoTrack.play(playerEl, { fit: 'cover' });
              } catch (e) {
                console.warn('Direct remote play notice:', e);
              }
            }
          }, 150);
        }
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      // Event: Remote User Unpublished
      client.on('user-unpublished', (remoteUser, mediaType) => {
        if (mediaType === 'video') {
          setRemoteUsers(prev => {
            const next = { ...prev };
            delete next[remoteUser.uid];
            return next;
          });
        }
      });

      // Event: Remote User Left
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
      if (localVideoTrack) tracksToPublish.push(localVideoTrack);

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
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (e) {}
    }
    setCallState('postcall');
  };

  // Helper: Open 2nd participant in new tab on this laptop
  const openSecondTabTest = () => {
    const url = `${window.location.origin}/video-call?channel=${encodeURIComponent(channelName)}&peer=true`;
    window.open(url, '_blank', 'width=880,height=720');
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
      backgroundColor: callState === 'incall' ? '#090f17' : 'var(--page-bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* ========================================================================= */}
      {/* 1. PRE-CALL SCREEN                                                        */}
      {/* ========================================================================= */}
      {callState === 'precall' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '28px'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>📹</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Video Counseling Room
                </h2>
              </div>
              <span style={{
                background: 'var(--brand-blue-pale)',
                color: 'var(--brand-blue)',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                1-on-1 Agora WebRTC
              </span>
            </div>

            {/* Laptop 2-Tab Test Banner */}
            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Sparkles size={15} color="var(--brand-blue)" />
                  <span>Testing on 1 Laptop?</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Click to launch a peer tab. Both tabs will see &amp; hear each other!
                </div>
              </div>
              <button
                type="button"
                onClick={openSecondTabTest}
                style={{
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
              >
                <ExternalLink size={13} />
                <span>Open Peer Tab</span>
              </button>
            </div>

            {/* Camera Preview Area */}
            <div style={{
              width: '100%',
              aspectRatio: '16 / 9',
              background: '#0f172a',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border)'
            }}>
              {localVideoTrack ? (
                <LocalVideoPlayer track={localVideoTrack} isCameraOff={isCameraOff} />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontSize: '0.85rem' }}>{statusMsg}</div>
                </div>
              )}

              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 10
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: localVideoTrack ? '#22c55e' : '#f59e0b'
                }}></span>
                <span>{isVirtualCam ? 'Virtual Live Feed' : (localVideoTrack ? 'Physical Webcam' : 'Initializing...')}</span>
              </div>

              {/* Participant Name Badge */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                zIndex: 10
              }}>
                {participantRole} (You)
              </div>
            </div>

            {/* Mic and Camera Toggle Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={toggleMic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: isMuted ? '1px solid var(--coral)' : '1px solid var(--border)',
                  background: isMuted ? 'var(--coral-pale)' : 'var(--surface)',
                  color: isMuted ? 'var(--coral)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isMuted ? 'Mic Muted' : 'Mic On'}</span>
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: isCameraOff ? '1px solid var(--coral)' : '1px solid var(--border)',
                  background: isCameraOff ? 'var(--coral-pale)' : 'var(--surface)',
                  color: isCameraOff ? 'var(--coral)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
                <span>{isCameraOff ? 'Camera Off' : 'Camera On'}</span>
              </button>
            </div>

            {/* Room / Channel Name */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
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
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. campuscare-room-1"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Join Call Button */}
            <button
              type="button"
              onClick={joinCall}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'var(--brand-blue)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-subtle)',
                marginBottom: '10px'
              }}
            >
              <Video size={18} />
              <span>{isConnecting ? 'Connecting to Agora...' : 'Enter Video Call →'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/booking')}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to Appointments Desk</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IN-CALL LIVE WEBRTC VIDEO SCREEN                                       */}
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
          zIndex: 250,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#090f17',
          overflow: 'hidden'
        }}>
          {/* Top Call Info Bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: '14px 24px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 30,
            color: '#fff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.12)',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.78rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                <span>WebRTC Live</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {channelName}
              </span>
              <span style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontFamily: 'monospace'
              }}>
                ⏱ {formatTimer(callDuration)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isCounselor && (
                <button
                  type="button"
                  onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                  style={{
                    background: showNotesDrawer ? '#2563eb' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
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
                  <span>{showNotesDrawer ? 'Hide Notes' : 'Session Notes'}</span>
                </button>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.5)',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '0.8rem'
              }}>
                <Users size={14} />
                <span>{remoteList.length + 1} participant(s)</span>
              </div>
            </div>
          </div>

          {/* Main Remote Video Stage */}
          <div style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090f17'
          }}>
            {/* Scenario A: Real Remote Peer(s) Connected via Agora */}
            {remoteList.length > 0 ? (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                {remoteList.map(u => (
                  <div key={u.uid} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                    <RemoteVideoPlayer user={u} fit="cover" />
                  </div>
                ))}
              </div>
            ) : simulatedCounselor ? (
              /* Scenario B: Simulated Counselor Mode */
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1e293b 0%, #090f17 100%)'
              }}>
                <div style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  boxShadow: '0 0 40px rgba(37,99,235,0.4)',
                  marginBottom: '16px'
                }}>
                  👩‍🏫
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: '0 0 6px', fontWeight: 600 }}>
                  Ms. Shahista Kazi (Campus Counselor)
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px' }}>
                  Lokmanya Tilak College of Engineering • Psychological Welfare
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  padding: '6px 14px',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  <Volume2 size={15} />
                  <span>Counselor Audio Connected</span>
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '80px',
                  left: '24px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}>
                  Counselor Feed (Simulated Mode)
                </div>
              </div>
            ) : (
              /* Scenario C: Waiting for Remote Peer */
              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  margin: '0 auto 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  ⏳
                </div>
                <h3 style={{ color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '8px', fontWeight: 600 }}>
                  Waiting for participant to join...
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                  Session Room: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{channelName}</span>
                </p>
              </div>
            )}

            {/* Local Video Picture-in-Picture (PiP) */}
            <div style={{
              position: 'absolute',
              bottom: '84px',
              right: '24px',
              width: '210px',
              aspectRatio: '16 / 9',
              background: '#1e293b',
              borderRadius: '8px',
              border: '2px solid rgba(255,255,255,0.35)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              zIndex: 25
            }}>
              {localVideoTrack && (
                <LocalVideoPlayer track={localVideoTrack} isCameraOff={isCameraOff} />
              )}
              <div style={{
                position: 'absolute',
                bottom: '6px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '3px',
                fontWeight: 600,
                zIndex: 26
              }}>
                You {isMuted ? '🔇' : ''}
              </div>
            </div>
          </div>

          {/* Floating Call Controls Bar */}
          <div style={{
            position: 'absolute',
            bottom: '18px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '10px 22px',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 30,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMic}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
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
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: isCameraOff ? '#ef4444' : 'rgba(255,255,255,0.15)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
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
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: isScreenSharing ? '#38bdf8' : 'rgba(255,255,255,0.15)',
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

            {/* Counselor Session Notes Toggle */}
            {isCounselor && (
              <button
                type="button"
                onClick={() => setShowNotesDrawer(!showNotesDrawer)}
                title={showNotesDrawer ? 'Close Counselor Notes' : 'Clinical Consultation Notes'}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: 'none',
                  background: showNotesDrawer ? 'var(--brand-blue, #2563eb)' : 'rgba(255,255,255,0.15)',
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

            {/* End Call */}
            <button
              type="button"
              onClick={leaveCall}
              title="End Session"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <PhoneOff size={22} />
            </button>
          </div>

          {/* Counselor Clinical Notes Drawer / Side Panel */}
          {showNotesDrawer && isCounselor && (
            <div style={{
              position: 'absolute',
              top: '68px',
              right: '20px',
              bottom: '80px',
              width: '380px',
              maxWidth: 'calc(100vw - 40px)',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '14px',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 35,
              overflow: 'hidden',
              backdropFilter: 'blur(16px)'
            }}>
              {/* Drawer Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(30, 41, 59, 0.7)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: '#38bdf8' }} />
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
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
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {noteSavedMsg && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid #22c55e',
                    color: '#86efac',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {noteSavedMsg}
                  </div>
                )}

                {/* Session Title */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {/* Category & Severity Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Category
                    </label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.8rem'
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
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                      Severity / Risk
                    </label>
                    <select
                      value={noteSeverity}
                      onChange={(e) => setNoteSeverity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '0.8rem'
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
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Student Anonymous Ref / Roll ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LTCE-2024-8841"
                    value={studentRefId}
                    onChange={(e) => setStudentRefId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                {/* Clinical Observations */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Clinical Observations *
                  </label>
                  <textarea
                    rows={4}
                    value={clinicalObservations}
                    onChange={(e) => setClinicalObservations(e.target.value)}
                    placeholder="Document student's mental state, vocal affect, behavioral cues, concerns discussed..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.82rem',
                      lineHeight: 1.4,
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Action Plan */}
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                    Intervention & Action Plan
                  </label>
                  <textarea
                    rows={3}
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="Recommended self-care strategies, follow-up session timeline, resources assigned..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.82rem',
                      lineHeight: 1.4,
                      resize: 'vertical'
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
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: noteSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    opacity: noteSaving ? 0.7 : 1
                  }}
                >
                  <Save size={16} />
                  <span>{noteSaving ? 'Saving Notes...' : 'Save to Case Files'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. POST-CALL SCREEN                                                       */}
      {/* ========================================================================= */}
      {callState === 'postcall' && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            padding: '32px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--green-pale)',
              color: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 16px'
            }}>
              ✓
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px' }}>
              Counseling Session Ended
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Your session history has been securely logged. Your confidential portal remains accessible anytime.
            </p>

            <div style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-around'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatTimer(callDuration)}
                </div>
              </div>
              <div style={{ width: '1px', background: 'var(--border)' }}></div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room ID</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-blue)', fontFamily: 'monospace' }}>
                  {channelName}
                </div>
              </div>
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
                  padding: '12px 20px',
                  background: 'var(--brand-blue)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Join Another Session
              </button>

              <button
                type="button"
                onClick={() => navigate('/booking')}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
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
