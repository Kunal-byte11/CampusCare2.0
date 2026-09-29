import React, { useState, useEffect } from 'react';
import { X, Wind, Heart } from 'lucide-react';

/**
 * Interactive 4-7-8 Guided Breathing Component
 * Proven clinical micro-intervention for acute exam stress and panic attacks.
 */
export default function BreathingExercise({ onClose }) {
  const [phase, setPhase] = useState('Inhale'); // 'Inhale' | 'Hold' | 'Exhale'
  const [timer, setTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(1);

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 7;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 8;
        } else {
          setPhase('Inhale');
          setCycleCount(c => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'Inhale': return 'Breathe in slowly through your nose...';
      case 'Hold': return 'Hold your breath gently. Keep your shoulders relaxed...';
      case 'Exhale': return 'Exhale completely and slowly through your mouth...';
      default: return '';
    }
  };

  const getScale = () => {
    if (phase === 'Inhale') return 1.35;
    if (phase === 'Hold') return 1.35;
    return 0.9;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '16px',
      padding: '20px',
      margin: '12px 0',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px'
          }}
          title="Dismiss breathing guide"
        >
          <X size={18} />
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Wind size={18} style={{ color: '#38bdf8' }} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          4-7-8 Relaxing Breath · Cycle {cycleCount}
        </span>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px', minHeight: '24px' }}>
        {getPhaseInstruction()}
      </p>

      {/* Animated Breathing Circle */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: phase === 'Inhale' 
          ? 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)' 
          : phase === 'Hold'
          ? 'radial-gradient(circle, #818cf8 0%, #4f46e5 100%)'
          : 'radial-gradient(circle, #34d399 0%, #059669 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
        transform: `scale(${getScale()})`,
        transition: phase === 'Inhale' ? 'transform 4s ease-out' : phase === 'Exhale' ? 'transform 8s ease-in' : 'none',
        margin: '12px 0 16px'
      }}>
        <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>{timer}</span>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', color: 'rgba(255,255,255,0.9)' }}>
          {phase}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
        <span>Inhale: <strong>4s</strong></span>
        <span>•</span>
        <span>Hold: <strong>7s</strong></span>
        <span>•</span>
        <span>Exhale: <strong>8s</strong></span>
      </div>
    </div>
  );
}
