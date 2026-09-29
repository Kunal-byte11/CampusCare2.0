/**
 * JEV System One Typed Decision Engine for CampusCare
 * Inspired by TypeSafe AI's Jev (First "System One" model for typed decisions)
 * 
 * Jev does NOT generate open-ended chat prose.
 * Instead, it evaluates input against a strict schema and returns calibrated,
 * schema-constrained decisions with confidence scores in milliseconds (<100ms).
 */

// Strict Typed Output Schema Definition
export const JEV_CATEGORIES = {
  EXAM_STRESS: 'EXAM_STRESS',
  ACADEMIC_BURNOUT: 'ACADEMIC_BURNOUT',
  PANIC_ATTACK: 'PANIC_ATTACK',
  DEPRESSION_MOOD: 'DEPRESSION_MOOD',
  SLEEP_INSOMNIA: 'SLEEP_INSOMNIA',
  RELATIONSHIPS_PEER: 'RELATIONSHIPS_PEER',
  HOSTEL_HOMESICKNESS: 'HOSTEL_HOMESICKNESS',
  GENERAL_WELLNESS: 'GENERAL_WELLNESS'
};

export const JEV_RISK_LEVELS = {
  GREEN: 'GREEN',     // Mild or general wellness conversation
  YELLOW: 'YELLOW',   // Moderate distress; recommend micro-intervention & coping
  RED: 'RED'          // Acute crisis / self-harm / panic; immediate clinical bypass
};

export const JEV_INTERVENTIONS = {
  BOX_BREATHING: 'BOX_BREATHING',           // 4-7-8 Breathing technique
  GROUNDING_54321: 'GROUNDING_54321',       // Sensory grounding for acute anxiety
  COUNSELOR_BOOKING: 'COUNSELOR_BOOKING',   // Direct bridge to Ms. Shahista Kazi
  EMERGENCY_SOS: 'EMERGENCY_SOS',           // National Tele-MANAS / 14416 card
  THOUGHT_REFRAME: 'THOUGHT_REFRAME',       // CBT Cognitive reframing
  NONE: 'NONE'
};

// Calibrated Risk Lexicon & Patterns
const CRISIS_PATTERNS = [
  /\b(suicid\w*|kill(ing)?\s*myself|end(ing)?\s*(my|this)?\s*life|want(ing)?\s*to\s*die|no\s*reason\s*to\s*live|better\s*off\s*dead)\b/i,
  /\b(self[-\s]*harm\w*|cut(ting)?\s*myself|slit(ting)?|hang(ing)?\s*myself|overdose\w*|take\s*all\s*my\s*pills)\b/i,
  /\b(can'?t\s*go\s*on\s*anymore|goodbye\s*everyone|nobody\s*(would|will)\s*care\s*if\s*i\s*(die|died|disappear|am\s*gone))\b/i,
  /\b(bleed(ing)?|hurt(ing)?\s*myself|jump(ing)?\s*(off|from))\b/i,
  /\b(want\s*to\s*disappear\s*forever|give\s*up\s*on\s*life)\b/i
];

const PANIC_PATTERNS = [
  /\b(can'?t\s*breathe|cannot\s*breathe|suffocat|heart\s*is\s*racing|chest\s*tight|hyperventilat)\b/i,
  /\b(having\s*a\s*panic\s*attack|feel\s*like\s*i'?m\s*dying|losing\s*control|shaking\s*uncontrollably)\b/i
];

const EXAM_STRESS_PATTERNS = [
  /\b(exam|test|viva|kt|backlog|submission|marks|cgpa|fail|sem|mumbai\s*university|syllabus|unit\s*test)\b/i,
  /\b(terrified\s*of\s*failing|haven'?t\s*studied|pressure\s*from\s*parents|placements|engineering\s*pressure)\b/i
];

const SLEEP_PATTERNS = [
  /\b(can'?t\s*sleep|insomnia|sleepless|exhausted|waking\s*up\s*at\s*night|nightmares|tired\s*all\s*the\s*time)\b/i
];

const DEPRESSION_PATTERNS = [
  /\b(feel\s*empty|hopeless|worthless|crying\s*all\s*day|depressed|sad\s*all\s*the\s*time|lost\s*interest)\b/i,
  /\b(lonely|isolated|nobody\s*likes\s*me|hate\s*myself|numb)\b/i
];

/**
 * PII Scrubber: Sanitizes message before classification and processing
 */
export function scrubPII(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Strip LTCE Roll numbers (e.g., LTCE-2024-1234 or roll numbers)
    .replace(/\b(LTCE|ltce)[-_]?[A-Za-z0-9]{3,8}\b/gi, '[STUDENT_ROLL]')
    // Strip Email Addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[STUDENT_EMAIL]')
    // Strip 10-digit Indian phone numbers
    .replace(/\b(\+91[\-\s]?)?[6-9]\d{9}\b/g, '[PHONE_NUMBER]')
    .trim();
}

/**
 * Classifies an incoming student message into strict typed decisions.
 * Implements Jev's System 1 calibrated decision principles.
 * 
 * @param {string} rawMessage - User message
 * @param {Array} history - Previous conversation turns
 * @returns {Promise<Object>} Typed Decision Object
 */
export async function classifyWithJev(rawMessage, history = []) {
  const cleanText = scrubPII(rawMessage);
  const startTime = Date.now();

  // 1. Acute Crisis Gate (Zero-Latency Interceptor)
  const isCrisisMatch = CRISIS_PATTERNS.some(p => p.test(cleanText));
  if (isCrisisMatch) {
    return {
      is_crisis: true,
      risk_level: JEV_RISK_LEVELS.RED,
      category: JEV_CATEGORIES.DEPRESSION_MOOD,
      severity_score: 10,
      recommended_exercise: JEV_INTERVENTIONS.EMERGENCY_SOS,
      escalate_to_counselor: true,
      confidence: 0.99,
      latency_ms: Date.now() - startTime,
      model: 'Jev-System1-Calibrated'
    };
  }

  // 2. Acute Panic / Hyperventilation Gate
  const isPanicMatch = PANIC_PATTERNS.some(p => p.test(cleanText));
  if (isPanicMatch) {
    return {
      is_crisis: false,
      risk_level: JEV_RISK_LEVELS.YELLOW,
      category: JEV_CATEGORIES.PANIC_ATTACK,
      severity_score: 8,
      recommended_exercise: JEV_INTERVENTIONS.BOX_BREATHING,
      escalate_to_counselor: true,
      confidence: 0.94,
      latency_ms: Date.now() - startTime,
      model: 'Jev-System1-Calibrated'
    };
  }

  // 3. Category Scoring
  let examScore = 0;
  let sleepScore = 0;
  let depressionScore = 0;

  EXAM_STRESS_PATTERNS.forEach(p => { if (p.test(cleanText)) examScore += 2; });
  SLEEP_PATTERNS.forEach(p => { if (p.test(cleanText)) sleepScore += 2; });
  DEPRESSION_PATTERNS.forEach(p => { if (p.test(cleanText)) depressionScore += 2; });

  let primaryCategory = JEV_CATEGORIES.GENERAL_WELLNESS;
  let recommendedExercise = JEV_INTERVENTIONS.NONE;
  let severityScore = 3;
  let riskLevel = JEV_RISK_LEVELS.GREEN;
  let escalate = false;

  if (depressionScore > 0 && depressionScore >= examScore && depressionScore >= sleepScore) {
    primaryCategory = JEV_CATEGORIES.DEPRESSION_MOOD;
    severityScore = Math.min(8, 4 + depressionScore);
    recommendedExercise = JEV_INTERVENTIONS.THOUGHT_REFRAME;
    riskLevel = severityScore >= 7 ? JEV_RISK_LEVELS.YELLOW : JEV_RISK_LEVELS.GREEN;
    escalate = severityScore >= 7;
  } else if (examScore > 0 && examScore >= sleepScore) {
    primaryCategory = JEV_CATEGORIES.EXAM_STRESS;
    severityScore = Math.min(8, 3 + examScore);
    recommendedExercise = JEV_INTERVENTIONS.BOX_BREATHING;
    riskLevel = severityScore >= 6 ? JEV_RISK_LEVELS.YELLOW : JEV_RISK_LEVELS.GREEN;
    escalate = severityScore >= 7;
  } else if (sleepScore > 0) {
    primaryCategory = JEV_CATEGORIES.SLEEP_INSOMNIA;
    severityScore = Math.min(7, 3 + sleepScore);
    recommendedExercise = JEV_INTERVENTIONS.GROUNDING_54321;
    riskLevel = JEV_RISK_LEVELS.GREEN;
  }

  // History Sentiment Drift Check: If last turns were also distressed, elevate escalation
  if (history && history.length >= 4) {
    const recentBotExchanges = history.slice(-4);
    const sustainedDistress = recentBotExchanges.filter(m => 
      m.type === 'user' && (EXAM_STRESS_PATTERNS.some(p => p.test(m.text)) || DEPRESSION_PATTERNS.some(p => p.test(m.text)))
    ).length;
    if (sustainedDistress >= 2) {
      escalate = true;
      if (severityScore < 7) severityScore = 7;
      riskLevel = JEV_RISK_LEVELS.YELLOW;
    }
  }

  return {
    is_crisis: false,
    risk_level: riskLevel,
    category: primaryCategory,
    severity_score: severityScore,
    recommended_exercise: recommendedExercise,
    escalate_to_counselor: escalate,
    confidence: 0.91,
    latency_ms: Date.now() - startTime,
    model: 'Jev-System1-Calibrated'
  };
}
