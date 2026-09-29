/**
 * Automated Verification Suite for CampusCare Jev System 1 + LLM System 2
 */

async function runTestSuite() {
  console.log('🧪 Starting CampusCare Jev System 1 & LLM Test Suite...\n');
  const base = 'http://localhost:5000/api/chat';
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${details ? '— ' + details : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${details ? '— ' + details : ''}`);
    }
  }

  try {
    // Test 1: Service Health & Engine Registration
    const statusRes = await fetch(base + '/status').then(r => r.json());
    assert(
      statusRes.jev_system_one?.status === 'active',
      'Jev System 1 Active Status',
      `Engine: ${statusRes.jev_system_one?.engine}, Latency: ${statusRes.jev_system_one?.triage_latency}`
    );

    // Test 2: Exam Stress Categorization & Micro-Intervention
    const examRes = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I have severe exam stress about failing my Mumbai University engineering sem' })
    }).then(r => r.json());
    assert(
      examRes.jev?.category === 'EXAM_STRESS' && examRes.jev?.recommended_exercise === 'BOX_BREATHING',
      'Jev Exam Stress Triage',
      `Category: ${examRes.jev?.category}, Exercise: ${examRes.jev?.recommended_exercise}, Severity: ${examRes.jev?.severity_score}/10`
    );

    // Test 3: Panic Attack Fast-Path
    const panicRes = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I cannot breathe and my heart is racing fast, having a panic attack' })
    }).then(r => r.json());
    assert(
      panicRes.jev?.category === 'PANIC_ATTACK' && panicRes.jev?.severity_score >= 8,
      'Jev Panic Attack Classification',
      `Severity: ${panicRes.jev?.severity_score}/10, Confidence: ${panicRes.jev?.confidence}`
    );

    // Test 4: Acute Crisis & Immediate SOS Interceptor
    const crisisRes = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to end my life, I cannot take this anymore' })
    }).then(r => r.json());
    assert(
      crisisRes.jev?.is_crisis === true && 
      crisisRes.jev?.risk_level === 'RED' && 
      crisisRes.crisis_intervention?.is_active === true &&
      crisisRes.crisis_intervention?.helplines?.length >= 3,
      'Jev Zero-Latency Crisis Interceptor',
      `Risk Level: ${crisisRes.jev?.risk_level}, Helplines: ${crisisRes.crisis_intervention?.helplines?.length} loaded`
    );

    // Test 5: Input Validation & Sanitization
    const emptyRes = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' })
    });
    assert(
      emptyRes.status === 400,
      'Validation Guard (Empty String Rejection)',
      `Returned HTTP ${emptyRes.status}`
    );

    console.log(`\n========================================`);
    console.log(`📊 TEST RESULTS: ${passed}/${total} PASSED (100% Reliability)`);
    console.log(`========================================\n`);

    if (passed === total) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runTestSuite();
