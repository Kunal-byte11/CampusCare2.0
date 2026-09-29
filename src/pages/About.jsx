import React from 'react';
import { useNavigate } from 'react-router-dom';

const campusFacilities = [
  {
    title: 'Central Library & Digital Resource Wing',
    desc: 'Spanning over 1,200 sq. m. with 45,000+ volumes, IEEE/ACM digital access, and quiet contemplation bays.',
    tag: 'Academic Hub',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'High-Performance AI & Data Science Labs',
    desc: 'Equipped with cutting-edge GPU workstations, IoT hardware testbeds, and high-speed gigabit networking.',
    tag: 'Research & Innovation',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Main Academic Quad & Seminar Complex',
    desc: 'A modern 22,000 sq. m. built-up educational complex hosting smart classrooms and acoustics auditoriums.',
    tag: 'Campus Life',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Student Wellness & Confidential Counseling Suite',
    desc: 'Private, sound-insulated consultation spaces for one-on-one sessions with licensed psychologists.',
    tag: 'Mental Health Cell',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Student Cafeteria & Social Commons',
    desc: 'Hygienic multi-cuisine dining, open-air discussion plazas, and student collaboration hubs.',
    tag: 'Social Spaces',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Sports Arena & Recreation Grounds',
    desc: 'Cricket, football, badminton courts, and indoor gymnasiums promoting active and healthy student lifestyles.',
    tag: 'Fitness & Sports',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  },
];

const institutionalStats = [
  { val: '1994', lbl: 'Year Established', sub: '3 Decades of Excellence' },
  { val: "Grade 'A'", lbl: 'NAAC Accredited', sub: 'Autonomous Institute' },
  { val: '22,000 m²', lbl: 'Built-up Infrastructure', sub: '2.8-Acre Green Campus' },
  { val: '3,000+', lbl: 'Empowered Engineers', sub: 'Active Student Body' },
];

export default function About({ openModal }) {
  const navigate = useNavigate();

  return (
    <div className="page active" id="page-about">
      <div className="about-layout">
        
        {/* --- Hero Section --- */}
        <section className="about-hero">
          <div className="about-hero-badge">
            <span className="badge-pulse"></span>
            🏛️ Lokmanya Tilak College of Engineering (LTCE) · Navi Mumbai
          </div>
          <h1 className="about-hero-title">
            Empowering Minds.<br />
            <span>Elevating Campus Well-being.</span>
          </h1>
          <p className="about-hero-sub">
            CampusCare is the official digital student welfare and mental health ecosystem for Lokmanya Tilak College of Engineering. 
            We combine institutional backing with private, anonymous first-aid, professional psychological counseling, and a caring peer community.
          </p>

          <div className="about-hero-ctas">
            <button className="btn-primary" onClick={() => navigate('/chatbot')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Talk to AI Assistant
            </button>
            <button className="btn-secondary" onClick={() => navigate('/booking')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Book Counselor
            </button>
            <a href="#about-campus" className="btn-tertiary">
              Explore Campus ↓
            </a>
          </div>
        </section>

        {/* --- Institutional Stats Ribbon --- */}
        <section className="about-stats-ribbon">
          <div className="about-stats-grid">
            {institutionalStats.map((st, idx) => {
              const borderStyles = [
                'border-top-coral',
                'border-top-green',
                'border-top-blue',
                'border-top-teal'
              ];
              return (
                <div key={idx} className={`about-stat-card ${borderStyles[idx % 4]}`}>
                  <div className="about-stat-val">{st.val}</div>
                  <div className="about-stat-lbl">{st.lbl}</div>
                  <div className="about-stat-sub">{st.sub}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- Vision & Mission Section --- */}
        <section className="about-section about-vision-section">
          <div className="about-section-header">
            <span className="section-eyebrow">Institutional Foundation</span>
            <h2>Vision &amp; Educational Purpose</h2>
            <p>Under the stewardship of Lokmanya Tilak Jankalyan Shikshan Sanstha (LTJSS), Nagpur.</p>
          </div>

          <div className="about-vision-grid">
            <div className="vision-card">
              <div className="vision-card-icon">🎯</div>
              <h3>Institutional Vision</h3>
              <p className="vision-quote">
                "To create technically competent and ethically responsible professionals capable of providing efficient solutions to the contemporary world."
              </p>
              <div className="vision-author">— Lokmanya Tilak College of Engineering</div>
            </div>

            <div className="vision-card">
              <div className="vision-card-icon">🚀</div>
              <h3>CampusCare Mission</h3>
              <p>
                To provide every engineering student at LTCE with proactive mental wellness support, confidential emotional relief, and transparent grievance redressal—ensuring no student struggles alone in academic or personal distress.
              </p>
              <ul className="vision-list">
                <li>Zero-stigma mental health access for all undergraduate &amp; postgraduate scholars</li>
                <li>100% anonymous identity protection via institutional email verification</li>
                <li>Seamless coordination with on-campus psychologists and faculty mentors</li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- The Four Pillars of CampusCare --- */}
        <section className="about-section">
          <div className="about-section-header">
            <span className="section-eyebrow">Our Ecosystem</span>
            <h2>The Four Pillars of Care</h2>
            <p>Comprehensive support tailored specifically to engineering students' realities.</p>
          </div>

          <div className="about-pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">💬</div>
              <h3>1. AI Mental First-Aid</h3>
              <p>
                Available 24/7. When late-night exam stress, assignment deadlines, or anxiety strike, our triage assistant provides grounding exercises, breathing drills, and compassionate support.
              </p>
              <span className="pillar-highlight">⚡ Instant Anonymous Response</span>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">👩‍⚕️</div>
              <h3>2. Licensed Counselors</h3>
              <p>
                Direct booking with clinical psychologists, psychiatrists, and certified therapists speaking English, Hindi, Marathi, and regional languages.
              </p>
              <span className="pillar-highlight">📅 In-Person &amp; Video Sessions</span>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📢</div>
              <h3>3. Grievance &amp; Anti-Ragging</h3>
              <p>
                Transparent, confidential channels for reporting harassment, academic stress, hostel concerns, or campus grievances under strict AICTE/UGC guidelines.
              </p>
              <span className="pillar-highlight">🛡️ Safe &amp; Protected Reporting</span>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">📚</div>
              <h3>4. Self-Care &amp; Peer Forum</h3>
              <p>
                An evidence-backed library of guided meditations, journal prompts, and a moderated peer forum where students share experiences and uplift one another.
              </p>
              <span className="pillar-highlight">🌱 Daily Healthy Habits</span>
            </div>
          </div>
        </section>

        {/* --- Campus & Facilities Showcase --- */}
        <section className="about-section" id="about-campus">
          <div className="about-section-header">
            <span className="section-eyebrow">Koparkhairane, Navi Mumbai</span>
            <h2>Our Vibrant Campus</h2>
            <p>A thriving 2.8-acre academic and personal growth environment in the heart of Navi Mumbai.</p>
          </div>

          <div className="campus-gallery-grid">
            {campusFacilities.map((fac, idx) => (
              <div key={idx} className="campus-card group">
                <div className="campus-img-wrap">
                  <img src={fac.image} alt={fac.title} loading="lazy" />
                  <span className="campus-card-tag">{fac.tag}</span>
                </div>
                <div className="campus-card-body">
                  <h4>{fac.title}</h4>
                  <p>{fac.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Institutional Heritage & Governance --- */}
        <section className="about-section about-heritage-section">
          <div className="heritage-card">
            <div className="heritage-left">
              <span className="section-eyebrow">About the Institution</span>
              <h2>Lokmanya Tilak Jankalyan Shikshan Sanstha</h2>
              <p>
                Founded in 1983, <strong>Lokmanya Tilak Jankalyan Shikshan Sanstha (LTJSS)</strong> is one of Maharashtra's foremost educational trusts, 
                spearheading quality technical and professional education.
              </p>
              <p>
                <strong>Lokmanya Tilak College of Engineering (LTCE)</strong> was established in 1994 in Navi Mumbai. 
                Today, as an Autonomous Institute affiliated to the University of Mumbai, LTCE offers premier engineering programs in 
                Computer Engineering, Artificial Intelligence &amp; Machine Learning, Data Science, IoT &amp; Cyber Security, 
                Mechanical Engineering, Electrical Engineering, and Electronics &amp; Telecommunication.
              </p>
              
              <div className="accreditation-chips">
                <span className="acc-chip">🏆 NAAC Grade 'A' Accredited</span>
                <span className="acc-chip">🏛️ Autonomous Institute</span>
                <span className="acc-chip">🎓 University of Mumbai Affiliated</span>
                <span className="acc-chip">📜 AICTE &amp; DTE Approved</span>
                <span className="acc-chip">⚙️ NBA Accredited Programs</span>
              </div>
            </div>

            <div className="heritage-right">
              <div className="privacy-card-inner">
                <div className="pci-icon">🔒</div>
                <h3>The CampusCare Privacy Guarantee</h3>
                <p>
                  We understand that stigma is the biggest barrier to seeking help. CampusCare employs strict zero-knowledge identity protocols:
                </p>
                <ul>
                  <li>Your institutional <code>@ltce.in</code> email is only used for temporary validation.</li>
                  <li>All chats, appointments, and forum posts are tagged only with an unlinked pseudonym.</li>
                  <li>No session logs or personal records are shared with academic or administrative faculty without explicit emergency consent.</li>
                </ul>
                <button className="btn-primary full-btn" onClick={() => openModal('signup')}>
                  Get Your Anonymous ID
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Location & Official Contacts --- */}
        <section className="about-section about-contact-section">
          <div className="about-contact-card">
            <div className="acc-info">
              <h3>Visit &amp; Contact the Campus</h3>
              <p className="acc-sub">Located in the educational corridor of Koparkhairane, Navi Mumbai with seamless suburban transit links.</p>

              <div className="contact-item">
                <div className="ci-icon">📍</div>
                <div>
                  <strong>Address</strong>
                  <p>Sector 4, Vikas Nagar, Koparkhairane, Navi Mumbai, Maharashtra – 400709, India</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="ci-icon">🚆</div>
                <div>
                  <strong>Transit Accessibility</strong>
                  <p>0.7 km from Koparkhairane Railway Station (Harbour / Trans-Harbour Line). 25 km from Chhatrapati Shivaji Maharaj International Airport.</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="ci-icon">📞</div>
                <div>
                  <strong>Helpline &amp; Administrative Desk</strong>
                  <p>Phone: +91-022-27541005 / 27541006 | Email: <a href="mailto:principal@ltce.in">principal@ltce.in</a></p>
                </div>
              </div>
            </div>

            <div className="acc-action-box">
              <h4>Need to talk right now?</h4>
              <p>Our AI first-aid assistant and helpline support are ready to listen without judging.</p>
              <button className="btn-primary full-btn" onClick={() => navigate('/chatbot')}>
                Open CampusCare AI
              </button>
              <a href="https://telemanas.mohfw.gov.in/home" target="_blank" rel="noopener noreferrer" className="btn-secondary full-btn" style={{ textAlign: 'center', marginTop: '0.65rem' }}>
                National Tele-MANAS: 1800-89-14416
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
