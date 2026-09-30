import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  PhoneCall, 
  Wind, 
  ShieldAlert, 
  Sparkles, 
  Bot, 
  Calendar, 
  Video, 
  CheckCircle2, 
  Activity,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import BreathingExercise from '../components/BreathingExercise';

export default function Chatbot() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: `Namaste${user?.name ? ' ' + user.name.split(' ')[0] : ''}! I am Manas Sarthi (मानस सारथी), your trusted CampusCare Wellness Companion.\n\nThis is a 100% confidential and safe space for LTCE students. How are you feeling today?`,
      safety: {
        category: 'GENERAL_WELLNESS',
        risk_level: 'GREEN'
      }
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [activeCrisisCard, setActiveCrisisCard] = useState(null);
  const [activeEscalation, setActiveEscalation] = useState(false);
  const [speechNotice, setSpeechNotice] = useState('');
  const chatEndRef = useRef(null);

  const wasSpokenInputRef = useRef(false);

  // Native Speech Hook (STT & TTS)
  const { 
    isListening, 
    isTranscribing,
    isSpeaking, 
    speechSupported, 
    startListening, 
    stopListening, 
    speak, 
    cancelSpeech 
  } = useSpeech({
    onTranscriptReceived: (transcript) => {
      wasSpokenInputRef.current = true;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
    },
    onErrorNotice: (msg) => {
      setSpeechNotice(msg);
      setTimeout(() => setSpeechNotice(''), 6000);
    }
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, showBreathingGuide, activeCrisisCard]);

  // Send Message Handler
  const handleSend = async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : inputText.trim();
    if (!textToSend || loading) return;

    // Cancel speech if talking
    cancelSpeech();

    const userMsg = { id: Date.now(), type: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const shouldPlayAudio = autoSpeak || wasSpokenInputRef.current;

    try {
      // 1. Fetch text reply with high priority (instant sub-second response)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-8),
          studentAnonId: user?.id || 'anon_student',
          returnAudio: false // Do not block text response with heavy audio synthesis
        })
      });

      if (!res.ok) {
        throw new Error('API server issue');
      }

      const data = await res.json();

      // Check for Crisis Intervention Gate
      if (data.crisis_intervention) {
        setActiveCrisisCard(data.crisis_intervention);
      } else {
        setActiveCrisisCard(null);
      }

      // Check for Recommended Breathing Exercise
      if (data.jev?.recommended_exercise === 'BOX_BREATHING') {
        setShowBreathingGuide(true);
      }

      // Check for Counselor Escalation Trigger
      if (data.jev?.escalate_to_counselor) {
        setActiveEscalation(true);
      }

      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.reply,
        jev: data.jev,
        audioBase64: null,
        audioMimeType: null
      };

      setMessages(prev => [...prev, botMsg]);
      setLoading(false); // Stop loading immediately!

      // 2. Play speech immediately using native browser TTS or async server audio
      if (shouldPlayAudio) {
        speak(data.reply);
      }
      wasSpokenInputRef.current = false;

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: "I'm right here with you. It seems there was a brief network blip, but please take a slow breath. How can I help you right now?",
          jev: { category: 'GENERAL_WELLNESS', risk_level: 'GREEN' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height))',
      paddingTop: 'var(--header-height)',
      backgroundColor: 'var(--page-bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '32px'
    }}>
      <div style={{
        maxWidth: '920px',
        width: '100%',
        margin: '20px auto 0',
        padding: '0 16px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--header-height) - 40px)'
      }}>

        {/* Chat Header */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-blue) 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Manas Sarthi (मानस सारथी)
                </h2>
                <span style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Activity size={12} />
                  <span>Confidential & Safe</span>
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                LTCE Student Mental Wellness · Instant Support · 100% Anonymous
              </p>
            </div>
          </div>

          {/* Controls: Voice Toggle & Guided Breathing Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowBreathingGuide(!showBreathingGuide)}
              title="Toggle 4-7-8 Breathing Guide"
              style={{
                background: showBreathingGuide ? 'rgba(56, 189, 248, 0.2)' : 'var(--card-bg, rgba(255,255,255,0.05))',
                border: '1px solid var(--border)',
                color: showBreathingGuide ? '#38bdf8' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Wind size={15} />
              <span>Breathing Guide</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (autoSpeak) {
                  cancelSpeech();
                  setAutoSpeak(false);
                } else {
                  setAutoSpeak(true);
                  speak("Voice output enabled.");
                }
              }}
              title={autoSpeak ? 'Disable Voice Read-Aloud' : 'Enable Voice Read-Aloud'}
              style={{
                background: autoSpeak ? 'rgba(37, 99, 235, 0.2)' : 'var(--card-bg, rgba(255,255,255,0.05))',
                border: '1px solid var(--border)',
                color: autoSpeak ? 'var(--brand-blue)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {autoSpeak ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{autoSpeak ? 'Voice ON' : 'Voice OFF'}</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div style={{
          flex: 1,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Optional Interactive Breathing Card */}
          {showBreathingGuide && (
            <BreathingExercise onClose={() => setShowBreathingGuide(false)} />
          )}

          {/* Active Emergency Crisis Interception Card */}
          {activeCrisisCard && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(153, 27, 27, 0.25))',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '20px',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(220, 38, 38, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <ShieldAlert size={24} style={{ color: '#f87171' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#f87171' }}>
                  Urgent Support & Confidential Helplines
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#fecaca', lineHeight: 1.5, margin: '0 0 16px' }}>
                You are valuable, and help is available right now with zero judgment. Reach out directly:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '14px' }}>
                {activeCrisisCard.helplines.map((hl, i) => (
                  <div key={i} style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>{hl.name}</span>
                    <a
                      href={`tel:${hl.number}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#fff',
                        textDecoration: 'none'
                      }}
                    >
                      <PhoneCall size={16} style={{ color: '#ef4444' }} />
                      <span>{hl.number}</span>
                    </a>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{hl.available}</span>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <strong>Campus Counselor:</strong> {activeCrisisCard.counselor.name} ({activeCrisisCard.counselor.office})
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/video-call')}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  Enter Emergency Video Room
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.type === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              <div style={{
                maxWidth: '82%',
                background: m.type === 'user' ? 'var(--brand-blue)' : 'var(--chat-bubble-bot, #f0f5f8)',
                color: m.type === 'user' ? '#fff' : 'var(--chat-bubble-bot-text, var(--text-primary))',
                border: m.type === 'user' ? 'none' : '1px solid var(--chat-bubble-bot-border, var(--border))',
                padding: '12px 18px',
                borderRadius: m.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: 1.55,
                fontSize: '0.93rem',
                whiteSpace: 'pre-wrap',
                position: 'relative'
              }}>
                {m.text}
              </div>

              {/* Bot Message Voice Control Bar */}
              {m.type === 'bot' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.72rem',
                  paddingLeft: '4px',
                  marginTop: '2px'
                }}>
                  <button
                    type="button"
                    onClick={() => speak(m.text, m.audioBase64, m.audioMimeType)}
                    title="Play voice audio through speakers"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.25)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      color: 'var(--brand-blue)',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Volume2 size={13} />
                    <span>Play Voice</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--chat-bubble-bot, #f0f5f8)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} style={{ color: 'var(--brand-blue)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Formulating response...</span>
              </div>
            </div>
          )}

          {/* Counselor Escalation Bridge Widget */}
          {activeEscalation && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(6,182,212,0.1) 100%)',
              border: '1px solid rgba(37,99,235,0.3)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              margin: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HeartHandshake size={24} style={{ color: 'var(--brand-blue)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                    Would you like to connect with Ms. Shahista Kazi?
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Campus Counselor · Free, confidential 1-on-1 support for LTCE students
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  style={{
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Calendar size={14} />
                  <span>Book Appointment</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/video-call')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Video size={14} />
                  <span>Video Call</span>
                </button>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
          padding: '8px 18px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <button
            type="button"
            onClick={() => handleSend("I am stressed about my upcoming engineering semester exams.")}
            style={{
              background: 'var(--card-bg-subtle, #f0f5f8)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '5px 12px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            📚 Exam Stress
          </button>

          <button
            type="button"
            onClick={() => handleSend("I can't sleep and my mind keeps racing with deadlines.")}
            style={{
              background: 'var(--card-bg-subtle, #f0f5f8)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '5px 12px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            🌙 Trouble Sleeping
          </button>

          <button
            type="button"
            onClick={() => handleSend("I am feeling an intense panic attack coming on.")}
            style={{
              background: 'var(--card-bg-subtle, #f0f5f8)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '5px 12px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            ⚡ Panic Attack
          </button>

          <button
            type="button"
            onClick={() => handleSend("Can you tell me how to meet Ms. Shahista Kazi at LTCE?")}
            style={{
              background: 'var(--card-bg-subtle, #f0f5f8)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              padding: '5px 12px',
              borderRadius: '100px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            👩‍🏫 Counselor Info
          </button>
        </div>

        {/* Optional Speech Notice Banner */}
        {speechNotice && (
          <div style={{
            background: 'var(--card-bg-subtle, #f0f5f8)',
            borderLeft: '1px solid var(--border)',
            borderRight: '1px solid var(--border)',
            padding: '6px 18px',
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>ℹ️</span>
            <span>{speechNotice}</span>
          </div>
        )}

        {/* Input Bar with Voice (STT) and Send */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '0 0 16px 16px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Microphone Speech-To-Text Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isTranscribing}
              title={
                isListening 
                  ? 'Stop recording and transcribe' 
                  : isTranscribing 
                  ? 'Transcribing speech...' 
                  : 'Speak your thoughts (Hardware Mic)'
              }
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: isListening ? '2px solid #ef4444' : isTranscribing ? '2px solid #38bdf8' : '1px solid var(--border)',
                background: isListening ? '#ef4444' : isTranscribing ? 'rgba(56, 189, 248, 0.2)' : 'var(--card-bg-subtle, #f0f5f8)',
                color: isListening ? '#fff' : isTranscribing ? '#38bdf8' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isTranscribing ? 'wait' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.5)' : isTranscribing ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
              }}
            >
              {isListening ? <MicOff size={19} /> : <Mic size={19} />}
            </button>
          )}

          {/* Text Input Area */}
          <textarea
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening 
                ? '🔴 Listening to your voice... (Click mic to finish)' 
                : isTranscribing 
                ? '✨ Transcribing voice with Gemini...' 
                : 'Type or speak your thoughts... (anonymous by default)'
            }
            style={{
              flex: 1,
              background: 'var(--chat-input-bg, #f8fafc)',
              border: isListening ? '1px solid #ef4444' : isTranscribing ? '1px solid #38bdf8' : '1px solid var(--border)',
              borderRadius: '10px',
              padding: '11px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
            title="Send Message"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              background: !inputText.trim() || loading ? 'rgba(255,255,255,0.1)' : 'var(--brand-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !inputText.trim() || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: !inputText.trim() || loading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)'
            }}
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
