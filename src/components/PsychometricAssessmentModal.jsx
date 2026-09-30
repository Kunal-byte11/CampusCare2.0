import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Smile, 
  Calendar,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Standardized Clinical Assessment Questions
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as studying, reading, or watching lectures",
  "Moving or speaking so slowly that other people noticed, or being fidgety and restless",
  "Thoughts that you would be better off dead, or of hurting yourself in some way"
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things (exams, placements, personal life)",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const PSYCHOMETRIC_QUESTIONS = [
  {
    id: 'psy_1',
    text: "I experience acute physical reactions (palpitations, nausea, blanking out) before exams or viva presentations.",
    domain: "Exam Panic"
  },
  {
    id: 'psy_2',
    text: "I frequently feel I don't belong in engineering or that my peers are far more competent than me.",
    domain: "Imposter Syndrome"
  },
  {
    id: 'psy_3',
    text: "Academic deadlines and laboratory submissions leave me emotionally depleted with zero time for rest.",
    domain: "Academic Burnout"
  },
  {
    id: 'psy_4',
    text: "When feeling distressed, I tend to isolate myself in my room/hostel and avoid reaching out for help.",
    domain: "Social Avoidance"
  },
  {
    id: 'psy_5',
    text: "I feel supported by at least one faculty member, mentor, or close peer on campus.",
    domain: "Resilience Buffer"
  }
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 }
];

const AGREE_OPTIONS = [
  { label: 'Strongly Disagree', value: 1 },
  { label: 'Disagree', value: 2 },
  { label: 'Neutral', value: 3 },
  { label: 'Agree', value: 4 },
  { label: 'Strongly Agree', value: 5 }
];

export default function PsychometricAssessmentModal({ isOpen, onClose, onCompleted }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Step: 1 = PHQ-9, 2 = GAD-7, 3 = Psychometric, 4 = Student Thank You Screen
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Answers State
  const [phqAnswers, setPhqAnswers] = useState(Array(9).fill(null));
  const [gadAnswers, setGadAnswers] = useState(Array(7).fill(null));
  const [psychAnswers, setPsychAnswers] = useState(Array(5).fill(null));

  if (!isOpen) return null;

  // Validation
  const isStep1Complete = phqAnswers.every(a => a !== null);
  const isStep2Complete = gadAnswers.every(a => a !== null);
  const isStep3Complete = psychAnswers.every(a => a !== null);

  const handleSelectPhq = (qIdx, val) => {
    const updated = [...phqAnswers];
    updated[qIdx] = val;
    setPhqAnswers(updated);
  };

  const handleSelectGad = (qIdx, val) => {
    const updated = [...gadAnswers];
    updated[qIdx] = val;
    setGadAnswers(updated);
  };

  const handleSelectPsych = (qIdx, val) => {
    const updated = [...psychAnswers];
    updated[qIdx] = val;
    setPsychAnswers(updated);
  };

  // Submit and Calculate Clinical Scores (Transmitted to Counselor)
  const handleSubmit = async () => {
    if (!isStep3Complete) return;
    setSubmitting(true);

    // 1. Calculate PHQ-9
    const phqTotal = phqAnswers.reduce((a, b) => a + (b || 0), 0);
    let phqSeverity = 'Minimal';
    if (phqTotal >= 20) phqSeverity = 'Severe';
    else if (phqTotal >= 15) phqSeverity = 'Moderately Severe';
    else if (phqTotal >= 10) phqSeverity = 'Moderate';
    else if (phqTotal >= 5) phqSeverity = 'Mild';

    // 2. Calculate GAD-7
    const gadTotal = gadAnswers.reduce((a, b) => a + (b || 0), 0);
    let gadSeverity = 'Minimal';
    if (gadTotal >= 15) gadSeverity = 'Severe';
    else if (gadTotal >= 10) gadSeverity = 'Moderate';
    else if (gadTotal >= 5) gadSeverity = 'Mild';

    // 3. Calculate Academic Psychometric Stress Score (out of 10)
    // Q1..Q4 add stress (1-5), Q5 is protective (5-val)
    const psychRaw = (psychAnswers[0] || 3) + (psychAnswers[1] || 3) + (psychAnswers[2] || 3) + (psychAnswers[3] || 3) + (6 - (psychAnswers[4] || 3));
    const psychScore = Math.min(10, Math.max(1, +(psychRaw / 2.5).toFixed(1)));

    // 4. Overall Clinical Risk Classification
    const hasSelfHarmFlag = (phqAnswers[8] || 0) > 0;
    let riskLevel = 'Stable';
    if (hasSelfHarmFlag || phqTotal >= 15 || gadTotal >= 15) {
      riskLevel = 'Critical';
    } else if (phqTotal >= 10 || gadTotal >= 10 || psychScore >= 7) {
      riskLevel = 'High';
    } else if (phqTotal >= 5 || gadTotal >= 5 || psychScore >= 5) {
      riskLevel = 'Moderate';
    }

    const payload = {
      id: `report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      studentName: user?.name || 'Kunal Dubey',
      studentEmail: user?.email || 'kunaldubey975@gmail.com',
      studentAnonId: user?.anonId || 'LTCE-CS-2024-8841',
      department: user?.course || 'Computer Science & Engineering',
      year: user?.year || '3rd Year',
      riskLevel,
      stressScore: psychScore,
      phq9: {
        score: phqTotal,
        severity: phqSeverity,
        selfHarmFlag: hasSelfHarmFlag,
        answers: phqAnswers.map((ans, idx) => ({
          question: PHQ9_QUESTIONS[idx],
          score: ans,
          label: FREQUENCY_OPTIONS.find(o => o.value === ans)?.label || 'Not answered'
        }))
      },
      gad7: {
        score: gadTotal,
        severity: gadSeverity,
        answers: gadAnswers.map((ans, idx) => ({
          question: GAD7_QUESTIONS[idx],
          score: ans,
          label: FREQUENCY_OPTIONS.find(o => o.value === ans)?.label || 'Not answered'
        }))
      },
      psychometrics: {
        score: psychScore,
        answers: psychAnswers.map((ans, idx) => ({
          question: PSYCHOMETRIC_QUESTIONS[idx].text,
          domain: PSYCHOMETRIC_QUESTIONS[idx].domain,
          score: ans,
          label: AGREE_OPTIONS.find(o => o.value === ans)?.label || 'Neutral'
        }))
      }
    };

    // Store in localStorage for Counselor Dashboard Sync
    try {
      const existing = JSON.parse(localStorage.getItem('campuscare_psychometric_reports') || '[]');
      // Prepend this student's latest report
      const updated = [payload, ...existing.filter(r => r.studentEmail !== payload.studentEmail)];
      localStorage.setItem('campuscare_psychometric_reports', JSON.stringify(updated));
      localStorage.setItem(`campuscare_assessment_taken_${user?.email || user?.anonId}`, 'true');
    } catch (e) {
      console.warn('Storage sync notice:', e);
    }

    // Attempt backend sync
    try {
      await fetch('/api/bookings/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentAnonId: payload.studentAnonId,
          studentName: payload.studentName,
          fileName: `Intake_Assessment_${Date.now()}.report`,
          title: `Intake Screening: PHQ-9 (${phqTotal}/27) & GAD-7 (${gadTotal}/21)`,
          category: 'Intake Psychometric Assessment',
          severity: riskLevel,
          clinicalObservations: `Intake Assessment Completed.\nPHQ-9: ${phqTotal}/27 (${phqSeverity})\nGAD-7: ${gadTotal}/21 (${gadSeverity})\nAcademic Stress: ${psychScore}/10\nSelf-Harm Ideation Flag: ${hasSelfHarmFlag ? 'YES (CRITICAL MONITORING REQUIRED)' : 'None'}`,
          actionPlan: riskLevel === 'Critical' 
            ? 'Urgent clinical follow-up required. Schedule 1:1 counseling consultation immediately.' 
            : 'Review responses; discuss coping mechanisms during next routine check-in.'
        })
      }).catch(() => {});
    } catch (err) {}

    setSubmitting(false);
    // Transition to step 4 (Student Thank You Screen — NO DIAGNOSTIC LABELS REVEALED)
    setStep(4);
    if (onCompleted) onCompleted(payload);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 10000,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        maxWidth: '740px',
        width: '100%',
        maxHeight: '92vh',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--sidebar-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <span style={{
                background: 'var(--brand-blue-pale)',
                color: 'var(--brand-blue)',
                padding: '3px 10px',
                borderRadius: '100px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Confidential Wellness Check-In
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} color="var(--green)" />
                Directly to Counselor Only
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {step === 1 && 'Part 1 of 3: Mood & Daily Vitality (PHQ-9)'}
              {step === 2 && 'Part 2 of 3: Worry & Stress Levels (GAD-7)'}
              {step === 3 && 'Part 3 of 3: Campus & Academic Experience'}
              {step === 4 && 'Thank You for Checking In!'}
            </h2>
          </div>

          {step !== 4 && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
              title="Skip or Complete Later"
            >
              <X size={17} />
            </button>
          )}
        </div>

        {/* Progress Bar (Steps 1 to 3) */}
        {step < 4 && (
          <div style={{ width: '100%', height: '4px', background: 'var(--border)' }}>
            <div style={{
              width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
              height: '100%',
              background: 'var(--brand-blue)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px'
        }}>
          {/* ========================================================================= */}
          {/* STEP 1: PHQ-9                                                            */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Over the <strong>last 2 weeks</strong>, how often have you been bothered by any of the following? Please choose the answer that best reflects your true experience.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {PHQ9_QUESTIONS.map((question, qIdx) => (
                  <div key={qIdx} style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {qIdx + 1}. {question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {FREQUENCY_OPTIONS.map(opt => {
                        const isSelected = phqAnswers[qIdx] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectPhq(qIdx, opt.value)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid var(--brand-blue)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--brand-blue-pale)' : 'var(--surface)',
                              color: isSelected ? 'var(--brand-blue)' : 'var(--text-primary)',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: GAD-7                                                            */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Over the <strong>last 2 weeks</strong>, how often have you been bothered by the following anxiety-related issues?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {GAD7_QUESTIONS.map((question, qIdx) => (
                  <div key={qIdx} style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {qIdx + 1}. {question}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {FREQUENCY_OPTIONS.map(opt => {
                        const isSelected = gadAnswers[qIdx] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectGad(qIdx, opt.value)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid var(--teal)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--teal-pale)' : 'var(--surface)',
                              color: isSelected ? 'var(--teal)' : 'var(--text-primary)',
                              fontSize: '0.8rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: PSYCHOMETRIC ACADEMIC STRESS SCALE                               */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                Please rate how strongly you agree or disagree with the following statements regarding your college experience at LTCE.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {PSYCHOMETRIC_QUESTIONS.map((item, qIdx) => (
                  <div key={item.id} style={{
                    background: 'var(--sidebar-bg)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {qIdx + 1}. {item.text}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                      {AGREE_OPTIONS.map(opt => {
                        const isSelected = psychAnswers[qIdx] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectPsych(qIdx, opt.value)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isSelected ? '2px solid var(--brand-blue)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--brand-blue-pale)' : 'var(--surface)',
                              color: isSelected ? 'var(--brand-blue)' : 'var(--text-primary)',
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? 700 : 500,
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: STUDENT CONFIRMATION (WARM, SUPPORTIVE, ZERO DIAGNOSTIC LABELS)  */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 12px' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'var(--green-pale)',
                color: 'var(--green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                margin: '0 auto 20px',
                boxShadow: '0 0 30px rgba(98, 173, 69, 0.25)'
              }}>
                🌿
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)' }}>
                Wellness Check-In Complete!
              </h2>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Thank you for taking a moment to reflect on your well-being. Your responses have been securely delivered to <strong>Ms. Shahista Kazi</strong> (Campus Psychological Welfare) to ensure you have supportive, confidential guidance whenever you need it.
              </p>

              {/* Gentle Calming Mind Tip */}
              <div style={{
                background: 'var(--teal-pale)',
                border: '1px solid rgba(50, 165, 178, 0.25)',
                borderRadius: '16px',
                padding: '18px 20px',
                maxWidth: '520px',
                margin: '0 auto 28px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--teal)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                  <Sparkles size={16} />
                  <span>A Quick Reminder from CampusCare</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  College life comes with intense phases, but you are not expected to carry everything by yourself. Taking deep, conscious breaths and honoring your pace is a strength.
                </div>
              </div>

              {/* Actions for Student */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/home');
                  }}
                  style={{
                    background: 'var(--brand-blue)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '100px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(38, 118, 166, 0.25)'
                  }}
                >
                  Continue to Student Portal →
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/booking');
                  }}
                  style={{
                    background: 'var(--surface)',
                    color: 'var(--teal)',
                    border: '1px solid var(--teal)',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Calendar size={16} />
                  <span>Book Consultation Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer (Next / Prev) */}
        {step < 4 && (
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '9px 18px',
                  borderRadius: '100px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 ? !isStep1Complete : !isStep2Complete}
                onClick={() => setStep(step + 1)}
                style={{
                  background: (step === 1 ? isStep1Complete : isStep2Complete) ? 'var(--brand-blue)' : 'var(--border)',
                  color: (step === 1 ? isStep1Complete : isStep2Complete) ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '100px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: (step === 1 ? isStep1Complete : isStep2Complete) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Next Section</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isStep3Complete || submitting}
                onClick={handleSubmit}
                style={{
                  background: isStep3Complete && !submitting ? 'var(--green)' : 'var(--border)',
                  color: isStep3Complete && !submitting ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '10px 28px',
                  borderRadius: '100px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: isStep3Complete && !submitting ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isStep3Complete ? '0 4px 14px rgba(98, 173, 69, 0.3)' : 'none'
                }}
              >
                <span>{submitting ? 'Transmitting to Counselor...' : 'Submit Wellness Check-In'}</span>
                <CheckCircle size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
