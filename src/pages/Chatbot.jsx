import React, { useState, useRef, useEffect } from 'react';

const initialBotReplies = [
  "I hear you. That sounds really tough. Can you tell me more about what's been happening?",
  "Thank you for sharing that with me. It takes courage. You're not alone in this. 💙",
  "That's completely valid to feel that way. Let's take a moment — try taking 3 slow, deep breaths with me.",
  'Would you like me to suggest a grounding exercise, or would you prefer I help you book a counselor?',
  'You\'re doing the right thing by reaching out. What matters most to you right now?',
  "I'm here for you. Sometimes just putting feelings into words can help. Keep going 💚",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hi there. I'm the CampusCare assistant. This is a safe, anonymous space. How are you feeling today?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [botIdx, setBotIdx] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hangleSend = (textOverride) => {
    const text = typeof textOverride === 'string' ? textOverride : inputText.trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text }]);
    setInputText('');

    if (showQuick) setShowQuick(false);

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: initialBotReplies[botIdx % initialBotReplies.length] }]);
      setBotIdx(idx => idx + 1);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      hangleSend();
    }
  };

  return (
    <div className="page active" id="page-chatbot">
      <div className="chat-layout chat-container">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar new-bot-avatar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="var(--brand-blue)" />
                <path d="M15 11h-6v4h6v-4zM11 15h2v2h-2v-2z" fill="#ffffff" />
                <rect x="7" y="10" width="10" height="6" rx="1" fill="#ffffff" />
                <circle cx="9.5" cy="12.5" r="1" fill="var(--brand-blue)" />
                <circle cx="14.5" cy="12.5" r="1" fill="var(--brand-blue)" />
                <path d="M12 10v-2m-2 0h4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3>CampusCare AI Assistant</h3>
              <p><span className="status-dot"></span> Online · Responds instantly · Anonymous</p>
            </div>
          </div>
          <div className="chat-header-modes">
            <button className="chat-mode-btn" onClick={() => { setMessages([{ id: 1, type: 'bot', text: "Crisis mode activated. I'm here. Can you tell me what's happening?" }]); setShowQuick(false); }}>Crisis mode</button>
            <button className="chat-mode-btn" onClick={() => { setMessages([{ id: 1, type: 'bot', text: "Vent mode activated. I'm just here to listen. Let it all out." }]); setShowQuick(false); }}>Vent mode</button>
          </div>
        </div>

        <div className="chat-messages" id="chat-messages">
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.type}`}>
              <div className="msg-avatar">{m.type === 'bot' ? (
                <div className="new-bot-avatar-small">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <circle cx="12" cy="12" r="10" fill="var(--brand-blue)" />
                    <rect x="7" y="10" width="10" height="6" rx="1" fill="#ffffff" />
                    <circle cx="9.5" cy="12.5" r="1" fill="var(--brand-blue)" />
                    <circle cx="14.5" cy="12.5" r="1" fill="var(--brand-blue)" />
                    <path d="M12 10v-2m-2 0h4" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              ) : '👤'}</div>
              <div className="msg-bubble">{m.text}</div>
            </div>
          ))}

          {showQuick && (
            <div className="quick-replies" id="quick-replies">
              <button className="quick-reply new-qr" onClick={() => hangleSend("😞 Not great")}>😞 Not great</button>
              <button className="quick-reply new-qr" onClick={() => hangleSend("😰 Anxious")}>😰 Anxious</button>
              <button className="quick-reply new-qr" onClick={() => hangleSend("😮‍💨 Stressed")}>😮‍💨 Stressed</button>
              <button className="quick-reply new-qr" onClick={() => hangleSend("🤔 Just checking in")}>🤔 Just checking in</button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area new-input-area">
          <textarea
            className="chat-input new-input"
            id="chat-input"
            placeholder="Type a message... (anonymous by default)"
            rows="1"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button className="chat-send new-send-btn" id="chat-send" onClick={hangleSend}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
