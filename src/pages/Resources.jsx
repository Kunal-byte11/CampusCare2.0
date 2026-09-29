import React, { useState } from 'react';
import {
  Search,
  X,
  Play,
  Video,
  Headphones,
  Wind,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Globe,
  Share2,
  Sparkles,
  LayoutGrid,
  ExternalLink,
  ShieldCheck,
  Check,
  Flame,
  HeartPulse,
  Moon,
  SunMedium,
  Compass,
  Tag,
  Activity,
  Heart,
  Volume2,
  Layers,
  Radio,
  RotateCcw
} from 'lucide-react';

const resourcesData = [
  {
    id: 1,
    title: '5-Minute Guided Breathing',
    desc: 'A short breathing routine to calm your nervous system, lower resting heart rate, and relieve tension.',
    tags: ['Stress', 'Mindfulness', 'Breathwork'],
    format: 'Exercise',
    iconType: 'wind',
    lang: 'English',
    durationSec: 312,
    durationLabel: '5:12',
    videoUrl: 'https://www.youtube.com/embed/enJyOTvEn4M',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    colorTheme: 'blue'
  },
  {
    id: 2,
    title: 'Grounding Exercise (5-4-3-2-1)',
    desc: 'Practice sensory awareness to pull your mind out of panic loops and re-center during overwhelming moments.',
    tags: ['Anxiety', 'Mindfulness', 'Grounding'],
    format: 'Exercise',
    iconType: 'activity',
    lang: 'English',
    durationSec: 300,
    durationLabel: '5:00',
    videoUrl: 'https://www.youtube.com/embed/30VMIEmA114',
    thumbnail: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d1b8?w=600&q=80',
    colorTheme: 'teal'
  },
  {
    id: 3,
    title: 'Body Scan Meditation',
    desc: 'A 10-minute guided audio meditation systematically releasing tension throughout every muscle group.',
    tags: ['Stress', 'Sleep', 'Meditation'],
    format: 'Audio',
    iconType: 'headphones',
    lang: 'English',
    durationSec: 600,
    durationLabel: '10:00',
    videoUrl: 'https://www.youtube.com/embed/H_uc-uQ3Nkc',
    thumbnail: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?w=600&q=80',
    colorTheme: 'green'
  },
  {
    id: 4,
    title: 'Daily Mood Journal',
    desc: 'Structured morning and evening journaling prompts to reflect on emotional triggers and build mental resilience.',
    tags: ['Depression', 'Mindfulness', 'Journaling'],
    format: 'Guide',
    iconType: 'book',
    lang: 'English',
    durationSec: 600,
    durationLabel: '10:00',
    videoUrl: 'https://www.youtube.com/embed/7CcZ7gyFXv0',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    colorTheme: 'orange'
  },
  {
    id: 5,
    title: 'Sleep Hygiene Guide',
    desc: 'Evidence-based cognitive behavioral strategies to regulate circadian rhythm and combat sleep-onset insomnia.',
    tags: ['Sleep', 'Wellness', 'Habits'],
    format: 'Guide',
    iconType: 'moon',
    lang: 'English',
    durationSec: 328,
    durationLabel: '5:28',
    videoUrl: 'https://www.youtube.com/embed/t0kACis_dJE',
    thumbnail: 'https://images.unsplash.com/photo-1520206183501-b80df61e43c2?w=600&q=80',
    colorTheme: 'blue'
  },
  {
    id: 6,
    title: 'Progressive Muscle Relaxation',
    desc: 'Clinical exercise guiding you through tensing and releasing muscle groups to relieve psychosomatic tension.',
    tags: ['Stress', 'Anxiety', 'Relaxation'],
    format: 'Video',
    iconType: 'video',
    lang: 'Hindi',
    durationSec: 1080,
    durationLabel: '18:00',
    videoUrl: 'https://www.youtube.com/embed/dYUVL15w4Ks',
    thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80',
    colorTheme: 'coral'
  },
  {
    id: 7,
    title: '4-7-8 Breathing Technique',
    desc: 'The natural tranquilizer for the nervous system: inhale for 4, hold for 7, exhale completely for 8.',
    tags: ['Anxiety', 'Sleep', 'Breathwork'],
    format: 'Exercise',
    iconType: 'wind',
    lang: 'English',
    durationSec: 627,
    durationLabel: '10:27',
    videoUrl: 'https://www.youtube.com/embed/LiUnFJ8P4gM',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    colorTheme: 'teal'
  },
  {
    id: 8,
    title: 'Gratitude Meditation',
    desc: 'Shift perspective from scarcity and distress to calm grounding and emotional replenishment.',
    tags: ['Depression', 'Mindfulness', 'Positivity'],
    format: 'Audio',
    iconType: 'heart',
    lang: 'English',
    durationSec: 644,
    durationLabel: '10:44',
    videoUrl: 'https://www.youtube.com/embed/E7sjprp6VA0',
    thumbnail: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?w=600&q=80',
    colorTheme: 'green'
  }
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormat, setActiveFormat] = useState('all');
  const [activeTopic, setActiveTopic] = useState('all');
  const [selectedId, setSelectedId] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedIds, setSavedIds] = useState([1, 3]);
  const [completedIds, setCompletedIds] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const toggleBookmark = (id, e) => {
    e?.stopPropagation();
    setSavedIds(prev => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter(x => x !== id) : [...prev, id];
      showToast(isSaved ? 'Removed from saved library' : 'Saved to your library 🔖');
      return next;
    });
  };

  const toggleCompleted = (id) => {
    setCompletedIds(prev => {
      const isDone = prev.includes(id);
      const next = isDone ? prev.filter(x => x !== id) : [...prev, id];
      showToast(isDone ? 'Session unmarked' : 'Session marked as completed! 🌿');
      return next;
    });
  };

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Session link copied to clipboard!');
    }
  };

  const handleSelectResource = (id, autoPlay = false) => {
    setSelectedId(id);
    if (autoPlay) {
      setIsPlaying(true);
    }
    if (window.innerWidth <= 1024) {
      const panel = document.getElementById('resource-preview-panel');
      if (panel) {
        const top = panel.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  };

  // Filter calculations
  const filtered = resourcesData.filter(r => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));

    const matchFormat =
      activeFormat === 'all'
        ? true
        : activeFormat === 'saved'
        ? savedIds.includes(r.id)
        : r.format.toLowerCase() === activeFormat.toLowerCase();

    const matchTopic =
      activeTopic === 'all'
        ? true
        : r.tags.some(t => t.toLowerCase() === activeTopic.toLowerCase());

    return matchSearch && matchFormat && matchTopic;
  });

  const selectedResource =
    resourcesData.find(x => x.id === selectedId) ||
    (filtered.length > 0 ? filtered[0] : resourcesData[0]);

  // Topic filter options with icons
  const topicsList = [
    { id: 'all', label: 'All Topics', icon: <Compass size={13} /> },
    { id: 'stress', label: 'Stress', icon: <Flame size={13} /> },
    { id: 'anxiety', label: 'Anxiety', icon: <HeartPulse size={13} /> },
    { id: 'mindfulness', label: 'Mindfulness', icon: <Sparkles size={13} /> },
    { id: 'sleep', label: 'Sleep', icon: <Moon size={13} /> },
    { id: 'depression', label: 'Depression', icon: <SunMedium size={13} /> }
  ];

  // Format filter options with icons
  const formatOptions = [
    { id: 'all', label: 'All Resources', icon: <LayoutGrid size={14} />, count: resourcesData.length },
    { id: 'video', label: 'Videos', icon: <Video size={14} />, count: resourcesData.filter(r => r.format === 'Video').length },
    { id: 'audio', label: 'Guided Audio', icon: <Headphones size={14} />, count: resourcesData.filter(r => r.format === 'Audio').length },
    { id: 'exercise', label: 'Exercises', icon: <Wind size={14} />, count: resourcesData.filter(r => r.format === 'Exercise').length },
    { id: 'guide', label: 'Reading Guides', icon: <BookOpen size={14} />, count: resourcesData.filter(r => r.format === 'Guide').length },
    { id: 'saved', label: 'Saved', icon: <Bookmark size={14} />, count: savedIds.length },
  ];

  // Dedicated Resource Icons helper
  const renderResourceIcon = (iconType, size = 22) => {
    switch (iconType) {
      case 'wind':
        return <Wind size={size} />;
      case 'activity':
        return <Activity size={size} />;
      case 'headphones':
        return <Headphones size={size} />;
      case 'book':
        return <BookOpen size={size} />;
      case 'moon':
        return <Moon size={size} />;
      case 'video':
        return <Video size={size} />;
      case 'heart':
        return <Heart size={size} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  const getFormatIcon = (format, size = 12) => {
    switch (format.toLowerCase()) {
      case 'video':
        return <Video size={size} />;
      case 'audio':
        return <Headphones size={size} />;
      case 'exercise':
        return <Wind size={size} />;
      case 'guide':
        return <BookOpen size={size} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  return (
    <div className="page active" id="page-resources">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--text-primary)',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          fontWeight: 500,
          boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Check size={14} />
          {toastMsg}
        </div>
      )}

      <div className="resources-layout">
        {/* Header Administrative Banner with Icons */}
        <div className="resources-header-box">
          <div className="resources-header-left">
            <h2>
              <BookOpen size={24} style={{ color: 'var(--brand-blue)' }} />
              Self-Care &amp; Clinical Resources
            </h2>
            <p>
              Evidence-based guided meditations, breathing routines, stress relief exercises, and clinical reading guides.
            </p>
          </div>

          <div className="resources-stats-strip">
            <div className="res-stat-chip">
              <Layers size={14} />
              <span>{resourcesData.length} Guided Modules</span>
            </div>
            <div className="res-stat-chip">
              <ShieldCheck size={14} />
              <span>Free &amp; Confidential</span>
            </div>
            <div className="res-stat-chip" onClick={() => setActiveFormat('saved')} style={{ cursor: 'pointer' }}>
              <Bookmark size={14} />
              <span>{savedIds.length} Saved</span>
            </div>
          </div>
        </div>

        {/* Quick Coping Toolkit Strip with Icons */}
        <div className="res-quick-tools">
          <div className="res-quick-card" onClick={() => handleSelectResource(1, true)}>
            <div className="res-quick-card-icon" style={{ background: 'var(--brand-blue-pale)', color: 'var(--brand-blue)' }}>
              <Wind size={22} />
            </div>
            <div>
              <div className="res-quick-card-title">5-Min Box Breathing</div>
              <div className="res-quick-card-sub">
                <Clock size={11} /> 5:12 · Instant Vagus Nerve Reset
              </div>
            </div>
            <div className="res-quick-card-action">
              <Play size={12} fill="currentColor" /> Play
            </div>
          </div>

          <div className="res-quick-card" onClick={() => handleSelectResource(2, true)}>
            <div className="res-quick-card-icon" style={{ background: 'var(--teal-pale)', color: 'var(--teal)' }}>
              <Activity size={22} />
            </div>
            <div>
              <div className="res-quick-card-title">5-4-3-2-1 Sensory Grounding</div>
              <div className="res-quick-card-sub">
                <ShieldCheck size={11} /> 5:00 · Panic &amp; Anxiety Relief
              </div>
            </div>
            <div className="res-quick-card-action">
              <Play size={12} fill="currentColor" /> Play
            </div>
          </div>

          <div className="res-quick-card" onClick={() => handleSelectResource(5, true)}>
            <div className="res-quick-card-icon" style={{ background: 'var(--orange-pale)', color: 'var(--orange)' }}>
              <Moon size={22} />
            </div>
            <div>
              <div className="res-quick-card-title">Sleep Hygiene Protocol</div>
              <div className="res-quick-card-sub">
                <Moon size={11} /> 5:28 · Insomnia &amp; Night Routine
              </div>
            </div>
            <div className="res-quick-card-action">
              <Play size={12} fill="currentColor" /> Play
            </div>
          </div>
        </div>

        {/* Filter and Search Panel with Icons */}
        <div className="res-filter-panel">
          <div className="res-filter-top-row">
            <div className="res-search-wrap">
              <Search size={16} className="res-search-icon" />
              <input
                type="text"
                className="res-search-input"
                placeholder="Search exercises, breathing routines, sleep, anxiety..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="res-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="res-format-pills">
              {formatOptions.map(f => (
                <button
                  key={f.id}
                  className={`res-format-pill ${activeFormat === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFormat(f.id)}
                >
                  {f.icon}
                  <span>{f.label}</span>
                  <span className="res-pill-count">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Chips with Dedicated Icons */}
          <div className="res-topic-chips">
            <span className="res-topic-label">
              <Tag size={12} /> Focus:
            </span>
            {topicsList.map(topic => (
              <button
                key={topic.id}
                className={`res-topic-chip ${activeTopic === topic.id ? 'active' : ''}`}
                onClick={() => setActiveTopic(topic.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                {topic.icon}
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Grid: Resources List + Interactive Media Player Panel */}
        <div className="resources-container">
          {/* Left Grid: Resource Cards */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              <span>
                Showing <strong>{filtered.length}</strong> of {resourcesData.length} wellness resources
              </span>
              {(searchQuery || activeFormat !== 'all' || activeTopic !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFormat('all');
                    setActiveTopic('all');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-blue)',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={12} /> Reset filters
                </button>
              )}
            </div>

            <div className="resources-grid">
              {filtered.map(r => {
                const isSelected = selectedId === r.id;
                const isSaved = savedIds.includes(r.id);
                const isDone = completedIds.includes(r.id);

                return (
                  <div
                    key={r.id}
                    className={`resource-card card-border-${r.colorTheme} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectResource(r.id, false)}
                  >
                    {/* Media Thumbnail with Overlay Badges and Icons */}
                    <div className="rc-thumb-wrapper">
                      <img src={r.thumbnail} alt={r.title} className="rc-thumb-img" />
                      <div className="rc-thumb-overlay">
                        <div className="rc-overlay-top">
                          <span className="rc-format-badge">
                            {getFormatIcon(r.format, 12)}
                            {r.format}
                          </span>
                          <button
                            className={`rc-bookmark-btn ${isSaved ? 'saved' : ''}`}
                            onClick={(e) => toggleBookmark(r.id, e)}
                            title={isSaved ? 'Saved in library' : 'Save to library'}
                            aria-label="Save resource"
                          >
                            <Bookmark size={13} fill={isSaved ? '#ffffff' : 'none'} />
                          </button>
                        </div>

                        <div className="rc-overlay-bottom">
                          <span className="rc-duration-pill">
                            <Clock size={11} />
                            {r.durationLabel}
                          </span>
                          <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Globe size={11} /> {r.lang}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content with Dedicated 44x44 Icon Box */}
                    <div className="rc-body">
                      <div className="rc-card-header">
                        <div className={`rc-card-icon-box icon-${r.colorTheme}`}>
                          {renderResourceIcon(r.iconType, 22)}
                        </div>
                        <div className="rc-header-text">
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <div className="rc-title">{r.title}</div>
                            {isDone && (
                              <span title="Completed session" style={{ color: 'var(--green)', display: 'flex', flexShrink: 0 }}>
                                <CheckCircle2 size={16} />
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {r.durationLabel} · {r.format}
                          </div>
                        </div>
                      </div>

                      <div className="rc-desc">{r.desc}</div>

                      {/* Tag list with Tag Icon */}
                      <div className="rc-tags-list">
                        {r.tags.map(t => (
                          <span key={t} className="rc-tag-badge">
                            <Tag size={9} style={{ opacity: 0.7 }} />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="rc-bottom-actions">
                      <button
                        className={`rc-btn-play-trigger ${isSelected && isPlaying ? 'active-trigger' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectResource(r.id, true);
                        }}
                      >
                        <Play size={13} fill="currentColor" />
                        <span>{isSelected && isPlaying ? 'Now Playing' : 'Start Session'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Search size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem', fontSize: '15px' }}>
                    No matching resources found
                  </h4>
                  <p style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 1.25rem' }}>
                    Try adjusting your search terms or clearing the selected format filters.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveFormat('all');
                      setActiveTopic('all');
                    }}
                    style={{ padding: '6px 16px', fontSize: '12.5px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={13} /> Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Preview Theatre & Session Controller with Icons */}
          <div className="resource-preview-panel" id="resource-preview-panel">
            {selectedResource ? (
              <>
                <div className="rp-panel-header">
                  <div className="rp-panel-status">
                    <span className="rp-status-pulse"></span>
                    <Radio size={13} />
                    <span>{isPlaying ? 'ACTIVE SESSION' : 'SELECTED SESSION'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => toggleBookmark(selectedResource.id)}
                      className={`rc-bookmark-btn ${savedIds.includes(selectedResource.id) ? 'saved' : ''}`}
                      title={savedIds.includes(selectedResource.id) ? 'Saved' : 'Save'}
                      style={{ width: '28px', height: '28px', background: 'var(--sidebar-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                    >
                      <Bookmark size={13} fill={savedIds.includes(selectedResource.id) ? 'var(--brand-blue)' : 'none'} />
                    </button>
                    <button
                      onClick={handleShare}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--sidebar-bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Share link"
                    >
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Video / Audio Media Viewport with Overlay */}
                <div className="rp-media-viewport">
                  {isPlaying && selectedResource.videoUrl ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`${selectedResource.videoUrl}?autoplay=1&rel=0`}
                      title={selectedResource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                    ></iframe>
                  ) : (
                    <>
                      <img
                        src={selectedResource.thumbnail}
                        alt={selectedResource.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="rp-media-overlay-play" onClick={() => setIsPlaying(true)}>
                        <div className="rp-play-circle-icon">
                          <Play size={24} fill="#ffffff" style={{ marginLeft: '3px' }} />
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px', marginBottom: '2px' }}>
                          {selectedResource.title}
                        </div>
                        <div style={{ fontSize: '11.5px', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> Tap to start {selectedResource.durationLabel} session
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Session Details with Rich Icons */}
                <div className="rp-detail-card">
                  <h3 className="rp-detail-title">{selectedResource.title}</h3>

                  <div className="rp-detail-badges">
                    <span className="rp-detail-badge">
                      {getFormatIcon(selectedResource.format, 13)}
                      {selectedResource.format}
                    </span>
                    <span className="rp-detail-badge">
                      <Clock size={12} />
                      {selectedResource.durationLabel}
                    </span>
                    <span className="rp-detail-badge">
                      <Globe size={12} />
                      {selectedResource.lang}
                    </span>
                    <span className="rp-detail-badge">
                      <Volume2 size={12} />
                      Audio Enabled
                    </span>
                  </div>

                  <p className="rp-detail-desc">{selectedResource.desc}</p>

                  <div>
                    <div className="rp-section-label">
                      <Sparkles size={13} style={{ color: 'var(--brand-blue)' }} />
                      Focus &amp; Clinical Impact:
                    </div>
                    <div className="rp-focus-pills">
                      {selectedResource.tags.map(t => (
                        <span key={t} className="rp-focus-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={10} />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rp-action-grid">
                    <button
                      className={`rp-btn-action ${completedIds.includes(selectedResource.id) ? 'completed' : ''}`}
                      onClick={() => toggleCompleted(selectedResource.id)}
                    >
                      <CheckCircle2 size={14} />
                      <span>{completedIds.includes(selectedResource.id) ? 'Completed ✓' : 'Mark as Completed'}</span>
                    </button>

                    {selectedResource.videoUrl && (
                      <a
                        href={selectedResource.videoUrl.replace('/embed/', '/watch?v=')}
                        target="_blank"
                        rel="noreferrer"
                        className="rp-btn-action"
                        style={{ textDecoration: 'none' }}
                        title="Open in new tab"
                      >
                        <ExternalLink size={14} />
                        <span>Open Video</span>
                      </a>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a resource from the list to view and play.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
