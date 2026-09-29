/**
 * System Two Empathetic Generative LLM Service for CampusCare
 * Seamlessly integrates Google Gemini, Groq, OpenAI, or a rich Rogerian CBT fallback engine.
 */

const CAMPUS_SYSTEM_PROMPT = `
You are the CampusCare AI Mental Wellness Companion at Lokmanya Tilak College of Engineering (LTCE).

CRITICAL RESPONSE LENGTH & SPEED RULES:
1. STRICT BREVITY: Respond in STRICTLY 2 to 3 short sentences (maximum 50 to 60 words total).
2. NO ESSAYS OR WALLS OF TEXT: Never write long essays or multiple paragraphs. Stressed students need quick, easily readable comfort.
3. EMPATHY & ACTION: In sentence 1, validate their feeling warmly. In sentence 2-3, offer one micro grounding step or mention counselor Ms. Shahista Kazi.
4. MEDICAL BOUNDARIES: Never diagnose mental illnesses and never prescribe medication.
`.trim();

/**
 * Generate empathetic response with Google Gemini
 */
async function callGemini(apiKey, prompt, history, jevContext) {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

  const contents = [];
  if (Array.isArray(history)) {
    history.slice(-4).forEach(h => {
      contents.push({
        role: h.type === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    });
  }

  const systemWithJev = `${CAMPUS_SYSTEM_PROMPT}\n[Jev Context: ${jevContext.category}, Stress: ${jevContext.severity_score}/10]`;

  contents.push({
    role: 'user',
    parts: [{ text: `${systemWithJev}\n\nStudent: ${prompt}\n(Remember: Max 2-3 short sentences!)` }]
  });

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 120,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate.trim();
      }
    } catch (e) {
      // try next model
    }
  }

  throw new Error('All Gemini model endpoints busy or unreachable');
}

/**
 * Generate empathetic response with OpenAI or Groq (Compatible endpoint)
 */
async function callOpenAICompatible(url, apiKey, model, prompt, history, jevContext) {
  const messages = [
    { 
      role: 'system', 
      content: `${CAMPUS_SYSTEM_PROMPT}\n[Jev System 1 Triage: Category=${jevContext.category}, Severity=${jevContext.severity_score}/10, Exercise=${jevContext.recommended_exercise}]` 
    }
  ];

  if (Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      messages.push({
        role: h.type === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "I hear you, and your feelings are completely valid. Tell me more.";
}

/**
 * Intelligent Rogerian CBT Knowledge Engine (Zero external dependency fallback)
 */
function generateClinicalFallback(prompt, jevContext) {
  const { category, recommended_exercise, severity_score } = jevContext;

  if (category === 'PANIC_ATTACK') {
    return (
      "I hear how overwhelming this feels right now. Please know you are safe in this moment. Your body is experiencing a surge of anxiety, but it will pass.\n\n" +
      "Let's ground your senses together. Look around the room and gently notice:\n" +
      "• 5 things you can see\n" +
      "• 4 things you can physically touch\n" +
      "• 3 sounds you can hear\n\n" +
      "I've also opened the breathing guide on your screen. Take one slow breath in with me."
    );
  }

  if (category === 'EXAM_STRESS') {
    return (
      "Engineering submissions and Mumbai University exams can create immense, exhausting pressure. It is completely normal to feel stretched thin.\n\n" +
      "Remember: your exam marks or KT papers do not define your intelligence or your future. When we feel overwhelmed, trying to tackle the whole syllabus at once causes panic.\n\n" +
      "Can we break this down into just the next 25 minutes? What is one small, manageable topic you could review after a 5-minute break?"
    );
  }

  if (category === 'SLEEP_INSOMNIA') {
    return (
      "It is so frustrating when your mind keeps racing while you're trying to sleep. When our nervous system is on high alert from college deadlines, forcing sleep often makes it harder.\n\n" +
      "Try gently shifting your focus away from 'trying to sleep' and just give your body permission to rest. Let your shoulders drop, release the tension in your jaw, and try taking three slow exhales that are longer than your inhales."
    );
  }

  if (category === 'DEPRESSION_MOOD') {
    return (
      "Thank you for sharing that with me. It takes real courage to open up when everything feels heavy or exhausting. Please know you don't have to carry this alone.\n\n" +
      "You don't need to have everything figured out right now. Just being here and acknowledging how you feel is a meaningful step.\n\n" +
      "Ms. Shahista Kazi at the LTCE counseling room is also here if you'd ever like to talk to a human counselor without any judgment."
    );
  }

  // General Wellness Response
  return (
    "I'm listening, and this is your safe, confidential space. College life can bring up a lot of unexpected stress and emotions.\n\n" +
    "Take your time — what has been the hardest part of your day or week so far?"
  );
}

/**
 * Main LLM Generation Gateway
 */
export async function generateEmpatheticResponse(prompt, history = [], jevContext = {}) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  try {
    // 1. Gemini
    if (geminiKey && geminiKey.trim() !== '') {
      return await callGemini(geminiKey, prompt, history, jevContext);
    }

    // 2. Groq
    if (groqKey && groqKey.trim() !== '') {
      return await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        groqKey,
        'llama-3.1-70b-versatile',
        prompt,
        history,
        jevContext
      );
    }

    // 3. OpenAI
    if (openAiKey && openAiKey.trim() !== '') {
      return await callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        openAiKey,
        'gpt-4o-mini',
        prompt,
        history,
        jevContext
      );
    }

    // 4. Clinical Knowledge Fallback Engine
    return generateClinicalFallback(prompt, jevContext);
  } catch (err) {
    console.warn('[LLM Service Notice] External provider issue, using clinical safety fallback:', err.message);
    return generateClinicalFallback(prompt, jevContext);
  }
}
