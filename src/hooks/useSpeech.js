import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Direct PCM Float32 Array Resampler & 16-Bit Mono WAV Encoder
 * 100% immune to MediaRecorder Opus/EBML missing headers and Chromium decode bugs.
 */
function encodePcmToWav(chunks, originalSampleRate, targetSampleRate = 16000) {
  if (!chunks || chunks.length === 0) return null;

  // 1. Flatten Float32 chunks
  const totalRawSamples = chunks.reduce((acc, c) => acc + c.length, 0);
  if (totalRawSamples === 0) return null;

  const rawPcm = new Float32Array(totalRawSamples);
  let offset = 0;
  for (const c of chunks) {
    rawPcm.set(c, offset);
    offset += c.length;
  }

  // 2. Linear Resampling to targetSampleRate (16,000 Hz)
  const ratio = originalSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(rawPcm.length / ratio));
  const resampled = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = Math.min(Math.floor(i * ratio), rawPcm.length - 1);
    resampled[i] = rawPcm[srcIndex];
  }

  // 3. Construct Canonical 44-byte RIFF/WAVE header
  const wavBuffer = new ArrayBuffer(44 + resampled.length * 2);
  const view = new DataView(wavBuffer);

  const writeString = (o, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(o + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + resampled.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, targetSampleRate, true); // 16,000 Hz
  view.setUint32(28, targetSampleRate * 2, true); // Byte rate (16000 * 1 * 2)
  view.setUint16(32, 2, true); // Block align (1 * 2)
  view.setUint16(34, 16, true); // 16 bits per sample
  writeString(36, 'data');
  view.setUint32(40, resampled.length * 2, true);

  // 4. Quantize Float32 [-1.0, 1.0] to 16-bit signed integer [-32768, 32767]
  let bytePos = 44;
  for (let i = 0; i < resampled.length; i++, bytePos += 2) {
    const s = Math.max(-1, Math.min(1, resampled[i]));
    view.setInt16(bytePos, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Client-Side Gemini Fallback
 */
async function transcribeDirectGemini(base64Wav, apiKey) {
  if (!apiKey) return '';
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: 'audio/wav', data: base64Wav } },
              { text: "Transcribe what the user said verbatim in English or Hinglish. Return raw text only." }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    } catch (e) {
      // try next
    }
  }
  return '';
}

/**
 * useSpeech Hook
 * Rock-solid Voice Engine using Direct Web Audio PCM (STT) and Hybrid AudioBuffer/HTML5 (TTS)
 */
export function useSpeech({ onTranscriptReceived, onErrorNotice } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const pcmChunksRef = useRef([]);

  const activeBufferSourceRef = useRef(null);
  const activeHtmlAudioRef = useRef(null);
  const activeUtteranceRef = useRef(null);

  const callbackRef = useRef(onTranscriptReceived);
  const errorCallbackRef = useRef(onErrorNotice);

  useEffect(() => {
    callbackRef.current = onTranscriptReceived;
    errorCallbackRef.current = onErrorNotice;
  }, [onTranscriptReceived, onErrorNotice]);

  // AudioContext getter with automatic autoplay unlocking
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      setSpeechSupported(false);
      return null;
    }
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }
    return audioContextRef.current;
  }, []);

  // Global user interaction listener to unlock audio permanently
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      try {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
      } catch (e) {}
    };

    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });

    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, [getAudioContext]);

  // =========================================================================
  // 1. HARDWARE MICROPHONE INPUT (Direct PCM Capture -> 16kHz WAV -> Gemini)
  // =========================================================================
  const startListening = useCallback(async () => {
    try {
      // Cancel any active speech
      if (activeBufferSourceRef.current) {
        try { activeBufferSourceRef.current.stop(); } catch (e) {}
        activeBufferSourceRef.current = null;
      }
      if (activeHtmlAudioRef.current) {
        try { activeHtmlAudioRef.current.pause(); } catch (e) {}
        activeHtmlAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      setIsSpeaking(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        errorCallbackRef.current?.('Microphone access is not supported in this browser.');
        return;
      }

      const audioCtx = getAudioContext();
      if (!audioCtx) {
        errorCallbackRef.current?.('Web Audio subsystem not available.');
        return;
      }

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      pcmChunksRef.current = [];

      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // ScriptProcessorNode buffer 4096, 1 input, 1 output
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmChunksRef.current.push(new Float32Array(inputData));
      };

      source.connect(processor);
      // Connect to a silent dummy gain node to keep processor active without echoing
      const silentGain = audioCtx.createGain();
      silentGain.gain.value = 0;
      processor.connect(silentGain);
      silentGain.connect(audioCtx.destination);

      setIsListening(true);
    } catch (err) {
      console.warn('[Microphone Start Notice]', err);
      setIsListening(false);
      errorCallbackRef.current?.('Please allow microphone access in your browser settings.');
    }
  }, [getAudioContext]);

  const stopListening = useCallback(async () => {
    if (!isListening && pcmChunksRef.current.length === 0) {
      setIsListening(false);
      return;
    }

    setIsListening(false);
    setIsTranscribing(true);

    // Disconnect audio nodes
    if (processorNodeRef.current) {
      try { processorNodeRef.current.disconnect(); } catch (e) {}
      processorNodeRef.current = null;
    }
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      try { mediaStreamRef.current.getTracks().forEach(t => t.stop()); } catch (e) {}
      mediaStreamRef.current = null;
    }

    try {
      const audioCtx = getAudioContext();
      const currentSampleRate = audioCtx ? audioCtx.sampleRate : 48000;
      const chunks = pcmChunksRef.current;
      pcmChunksRef.current = [];

      if (!chunks || chunks.length < 2) {
        setIsTranscribing(false);
        return;
      }

      // Encode directly into standard 16kHz mono 16-bit WAV
      const wavBlob = encodePcmToWav(chunks, currentSampleRate, 16000);
      if (!wavBlob || wavBlob.size < 500) {
        setIsTranscribing(false);
        return;
      }

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(wavBlob);
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          let transcribedText = '';

          // 1. Try Backend Server Transcribe Endpoint
          try {
            const res = await fetch('/api/chat/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: 'audio/wav'
              })
            });

            if (res.ok) {
              const data = await res.json();
              transcribedText = data.transcript?.trim() || '';
            }
          } catch (serverErr) {
            console.warn('[Server Transcribe Notice]', serverErr.message);
          }

          // 2. Direct Client-side Gemini Fallback
          if (!transcribedText) {
            const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (clientKey) {
              transcribedText = await transcribeDirectGemini(base64Data, clientKey);
            }
          }

          if (transcribedText && callbackRef.current) {
            callbackRef.current(transcribedText);
          }
        } catch (err) {
          console.warn('[Audio Process Error]', err);
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.warn('[Stop Listening Error]', err);
      setIsTranscribing(false);
    }
  }, [isListening, getAudioContext]);

  // =========================================================================
  // 2. TEXT-TO-SPEECH (Real AudioBuffer & HTML5 Playback)
  // =========================================================================
  const cancelSpeech = useCallback(() => {
    if (activeBufferSourceRef.current) {
      try { activeBufferSourceRef.current.stop(); } catch (e) {}
      activeBufferSourceRef.current = null;
    }
    if (activeHtmlAudioRef.current) {
      try {
        activeHtmlAudioRef.current.pause();
        activeHtmlAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeHtmlAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    setIsSpeaking(false);
    activeUtteranceRef.current = null;
    window.__activeUtterance = null;
  }, []);

  const playBase64Audio = useCallback(async (base64Audio, mimeType = 'audio/wav') => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return false;

    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Convert Base64 to ArrayBuffer
      const binary = atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      // Web Audio API buffer decoding
      const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      activeBufferSourceRef.current = source;
      setIsSpeaking(true);

      source.onended = () => {
        setIsSpeaking(false);
        activeBufferSourceRef.current = null;
      };

      source.start(0);
      return true;
    } catch (webAudioErr) {
      console.warn('[Web Audio Decode Notice, trying HTML5 Audio]:', webAudioErr.message);

      // Fallback: HTML5 Audio Element
      try {
        const audioUri = `data:${mimeType};base64,${base64Audio}`;
        const audio = new Audio(audioUri);
        activeHtmlAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          activeHtmlAudioRef.current = null;
        };

        await audio.play();
        setIsSpeaking(true);
        return true;
      } catch (htmlAudioErr) {
        console.warn('[HTML5 Audio Play Notice]:', htmlAudioErr.message);
        return false;
      }
    }
  }, [getAudioContext]);

  const speak = useCallback(async (text, directAudioBase64 = null, directAudioMime = 'audio/wav') => {
    if (!text || typeof window === 'undefined') return;

    cancelSpeech();

    const cleaned = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleaned) return;

    setIsSpeaking(true);

    // 1. Direct Audio Payload (from in-stream /api/chat)
    if (directAudioBase64) {
      const ok = await playBase64Audio(directAudioBase64, directAudioMime);
      if (ok) return;
    }

    // 2. Dedicated Real Audio Endpoint (/api/chat/tts)
    try {
      const res = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned.slice(0, 300) })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const ok = await playBase64Audio(data.audioBase64, data.mimeType || 'audio/wav');
          if (ok) return;
        }
      }
    } catch (e) {
      console.warn('[TTS Request Notice]:', e.message);
    }

    // 3. Fallback: Browser Native SpeechSynthesis
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = 1.0;
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const preferred = voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (preferred) utterance.voice = preferred;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          window.__activeUtterance = null;
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
          window.__activeUtterance = null;
        };

        activeUtteranceRef.current = utterance;
        window.__activeUtterance = utterance;

        setTimeout(() => {
          try {
            if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }, 50);
        return;
      }
    } catch (synthErr) {
      console.warn('[SpeechSynthesis Notice]:', synthErr.message);
    }

    setIsSpeaking(false);
  }, [cancelSpeech, playBase64Audio]);

  return {
    isListening,
    isTranscribing,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeech
  };
}
