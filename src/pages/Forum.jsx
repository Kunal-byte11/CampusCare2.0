import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, MessageCircle, Heart, TrendingUp, Clock, Send, ChevronDown, ArrowLeft, Plus, Filter, Share2, Frown } from 'lucide-react';

const TAGS = ['All', 'Anxiety', 'Loneliness', 'Sleep', 'Academic Stress', 'Wellness Tips', 'General'];

const getTagColor = (tag) => {
  switch (tag) {
    case 'Anxiety': return { bg: 'var(--coral-pale, #ffe8e8)', text: 'var(--coral, #f05a5a)' };
    case 'Loneliness': return { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--brand-blue, #3b82f6)' };
    case 'Sleep': return { bg: 'var(--teal-pale, #e0f2f1)', text: 'var(--teal, #00897b)' };
    case 'Academic Stress': return { bg: 'var(--orange-pale, #fff3e0)', text: 'var(--orange, #f57c00)' };
    case 'Wellness Tips': return { bg: 'var(--green-pale, #e8f5e9)', text: 'var(--green, #43a047)' };
    default: return { bg: 'var(--surface-alt, #f1f5f9)', text: 'var(--text-secondary, #64748b)' };
  }
};

const INITIAL_FALLBACK_POSTS = [
  {
    id: '1',
    authorName: 'BlueSky42',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tag: 'Anxiety',
    title: 'Panic attacks during exams — anyone else?',
    body: "I've been having really intense panic attacks right before big tests. Even when I've studied a lot. Does anyone have tips for managing this?",
    likes: 24,
    comments: [
      { id: 'c1', authorName: 'WellnessGuide', body: 'Box breathing really helps me. 4 seconds in, 4 hold, 4 out, 4 hold.', createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 5 }
    ]
  },
  {
    id: '2',
    authorName: 'AnonymousStudent',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    tag: 'Loneliness',
    title: 'Feeling really disconnected since moving to campus',
    body: "It's my first semester and I haven't really made any close friends. Everyone seems to already have their groups. It gets really lonely on weekends.",
    likes: 45,
    comments: []
  },
  {
    id: '3',
    authorName: 'NightOwl_99',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    tag: 'Sleep',
    title: 'Insomnia ruining my mornings',
    body: "Can't fall asleep until 4 AM most nights. I've tried melatonin, no screens before bed... nothing is working. Just venting.",
    likes: 18,
    comments: []
  }
];

export default function Forum() {
  const { user } = useAuth() || { user: { anonId: 'Anon123', name: 'Anonymous' } };
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filterTag, setFilterTag] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isComposing, setIsComposing] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', body: '', tag: 'General', authorName: user?.anonId || 'Anonymous' });
  
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  
  useEffect(() => {
    // Inject CSS
    const styleId = 'forum-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .forum-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1rem;
          color: var(--text-primary);
        }
        .forum-header {
          margin-bottom: 2rem;
        }
        .forum-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .forum-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }
        
        .forum-toolbar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .forum-search-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .forum-search {
          flex: 1;
          position: relative;
        }
        
        .forum-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        
        .forum-search input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        
        .forum-search input:focus {
          outline: none;
          border-color: var(--brand-blue);
        }
        
        .forum-sort-toggle {
          display: flex;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .forum-sort-btn {
          padding: 0.6rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        
        .forum-sort-btn.active {
          background: var(--brand-blue);
          color: white;
        }
        
        .forum-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .forum-tag-pill {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .forum-tag-pill:hover {
          background: var(--border);
        }
        
        .forum-tag-pill.active {
          background: var(--brand-blue);
          color: white;
          border-color: var(--brand-blue);
        }
        
        .forum-compose-wrapper {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm);
        }
        
        .forum-compose-prompt {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          color: var(--text-secondary);
        }
        
        .forum-compose-prompt .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--brand-blue);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .forum-compose-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .forum-compose-form input[type="text"], 
        .forum-compose-form textarea, 
        .forum-compose-form select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-primary);
          font-family: inherit;
        }
        
        .forum-compose-form textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .forum-compose-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .char-count {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        
        .forum-post-card {
          display: flex;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          overflow: hidden;
          cursor: pointer;
        }
        
        .forum-post-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-card, 0 4px 12px rgba(0,0,0,0.05));
        }
        
        .forum-post-votes {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.5rem;
          background: rgba(0,0,0,0.02);
          border-right: 1px solid var(--border);
          min-width: 60px;
        }
        
        .vote-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 4px;
          padding: 4px;
        }
        
        .vote-btn:hover {
          background: rgba(0,0,0,0.05);
          color: var(--brand-blue);
        }
        
        .vote-btn.liked {
          color: var(--coral, #f56565);
        }
        
        .vote-count {
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0.3rem 0;
        }
        
        .forum-post-main {
          padding: 1rem 1.25rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .forum-post-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .forum-post-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .forum-post-author {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        
        .forum-post-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }
        
        .forum-post-body {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        
        .forum-post-footer {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-top: auto;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        
        .forum-post-action {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: inherit;
        }
        
        .forum-detail {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2rem;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: var(--brand-blue);
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 1.5rem;
          padding: 0;
        }
        
        .forum-detail .forum-post-body {
          -webkit-line-clamp: unset;
          margin-bottom: 2rem;
          font-size: 1.05rem;
          color: var(--text-primary);
        }
        
        .comments-section {
          margin-top: 2rem;
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }
        
        .forum-comment {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border);
        }
        
        .forum-comment:last-child {
          border-bottom: none;
        }
        
        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .comment-author {
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .comment-time {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        
        .comment-body {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .forum-comment-input {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
          align-items: flex-start;
        }
        
        .btn-primary {
          background: var(--brand-blue);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: var(--radius-sm);
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          padding: 0.6rem 1.2rem;
          border-radius: var(--radius-sm);
          font-weight: 500;
          cursor: pointer;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          color: var(--text-muted);
          text-align: center;
        }
        
        .empty-state svg {
          margin-bottom: 1rem;
          color: var(--border);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forum/posts');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.warn("API failed, using fallback data", err);
      setPosts(INITIAL_FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostData.title.trim() || !newPostData.body.trim()) return;
    
    const postPayload = {
      ...newPostData,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload)
      });
      if (!res.ok) throw new Error('Failed to create');
      const savedPost = await res.json();
      setPosts([savedPost, ...posts]);
    } catch (err) {
      const newPost = { ...postPayload, id: Date.now().toString() };
      setPosts([newPost, ...posts]);
    }
    
    setNewPostData({ title: '', body: '', tag: 'General', authorName: user?.anonId || 'Anonymous' });
    setIsComposing(false);
  };

  const handleLike = async (postId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
      if (expandedPost?.id === postId) {
        setExpandedPost({ ...expandedPost, likes: (expandedPost.likes || 0) + 1 });
      }
    } catch (err) {
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
      if (expandedPost?.id === postId) {
        setExpandedPost({ ...expandedPost, likes: (expandedPost.likes || 0) + 1 });
      }
    }
  };

  const fetchPostDetail = async (id) => {
    setExpandedPostId(id);
    const existing = posts.find(p => p.id === id);
    if (existing) setExpandedPost(existing);
    
    try {
      const res = await fetch(`/api/forum/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExpandedPost(data);
      }
    } catch (err) {
      // Keep existing as fallback
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !expandedPost) return;
    
    const commentPayload = {
      authorName: user?.anonId || 'Anonymous',
      body: newCommentText,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    try {
      const res = await fetch(`/api/forum/posts/${expandedPost.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload)
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const savedComment = await res.json();
      setExpandedPost({
        ...expandedPost,
        comments: [...(expandedPost.comments || []), savedComment]
      });
    } catch (err) {
      const newComment = { ...commentPayload, id: Date.now().toString() };
      const updatedPost = {
        ...expandedPost,
        comments: [...(expandedPost.comments || []), newComment]
      };
      setExpandedPost(updatedPost);
      setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    }
    setNewCommentText('');
  };

  const formatTime = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredPosts = posts
    .filter(p => filterTag === 'All' || p.tag === filterTag)
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.body.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'Recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return (b.likes || 0) - (a.likes || 0);
    });

  if (expandedPostId && expandedPost) {
    const tagColors = getTagColor(expandedPost.tag);
    return (
      <div className="forum-page">
        <button className="back-btn" onClick={() => setExpandedPostId(null)}>
          <ArrowLeft size={18} /> Back to Forum
        </button>
        
        <div className="forum-detail">
          <div className="forum-post-header">
            <span className="forum-post-tag" style={{ background: tagColors.bg, color: tagColors.text }}>
              {expandedPost.tag}
            </span>
            <span className="forum-post-author">Posted by {expandedPost.authorName}</span>
            <span className="forum-post-author">• {formatTime(expandedPost.createdAt)}</span>
          </div>
          
          <h1 className="forum-post-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {expandedPost.title}
          </h1>
          
          <div className="forum-post-body">
            {expandedPost.body.split('\\n').map((para, idx) => (
              <p key={idx} style={{ marginBottom: '1rem' }}>{para}</p>
            ))}
          </div>
          
          <div className="forum-post-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button className="forum-post-action vote-btn" onClick={(e) => handleLike(expandedPost.id, e)}>
              <Heart size={18} /> {expandedPost.likes || 0} Likes
            </button>
            <div className="forum-post-action">
              <MessageCircle size={18} /> {(expandedPost.comments || []).length} Comments
            </div>
            <button className="forum-post-action vote-btn" style={{ marginLeft: 'auto' }}>
              <Share2 size={18} /> Share
            </button>
          </div>
          
          <div className="comments-section">
            <h3 style={{ marginBottom: '1.5rem' }}>Comments</h3>
            {(expandedPost.comments || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first to share your thoughts!</p>
            ) : (
              (expandedPost.comments || []).map(comment => (
                <div key={comment.id} className="forum-comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.authorName}</span>
                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                  </div>
                  <div className="comment-body">{comment.body}</div>
                </div>
              ))
            )}
            
            <div className="forum-comment-input">
              <div className="forum-compose-prompt" style={{ cursor: 'default' }}>
                <div className="avatar" style={{ background: 'var(--brand-blue)' }}>
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea 
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Add a thoughtful comment..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '80px', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-primary" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                    <Send size={16} /> Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>A safe space to share experiences and support each other anonymously.</p>
      </div>

      <div className="forum-toolbar">
        <div className="forum-search-row">
          <div className="forum-search">
            <Search className="forum-search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search discussions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="forum-sort-toggle">
            <button 
              className={`forum-sort-btn ${sortBy === 'Recent' ? 'active' : ''}`}
              onClick={() => setSortBy('Recent')}
            >
              <Clock size={16} /> Recent
            </button>
            <button 
              className={`forum-sort-btn ${sortBy === 'Popular' ? 'active' : ''}`}
              onClick={() => setSortBy('Popular')}
            >
              <TrendingUp size={16} /> Popular
            </button>
          </div>
        </div>
        
        <div className="forum-filters">
          <Filter size={18} color="var(--text-muted)" style={{ margin: 'auto 0.5rem auto 0' }} />
          {TAGS.map(tag => (
            <button 
              key={tag}
              className={`forum-tag-pill ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="forum-compose-wrapper">
        {!isComposing ? (
          <div className="forum-compose-prompt" onClick={() => setIsComposing(true)}>
            <div className="avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--page-bg)', border: '1px solid var(--border)', borderRadius: '20px' }}>
              Share what's on your mind...
            </div>
          </div>
        ) : (
          <div className="forum-compose-form">
            <input 
              type="text" 
              placeholder="Give your post a title" 
              value={newPostData.title}
              onChange={e => setNewPostData({ ...newPostData, title: e.target.value })}
              autoFocus
            />
            <textarea 
              placeholder="Write your details here... (You can be as open as you like, this is a safe space)" 
              value={newPostData.body}
              onChange={e => setNewPostData({ ...newPostData, body: e.target.value })}
              maxLength={1000}
            />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select 
                value={newPostData.tag} 
                onChange={e => setNewPostData({ ...newPostData, tag: e.target.value })}
                style={{ flex: 1, minWidth: '150px' }}
              >
                {TAGS.filter(t => t !== 'All').map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Display Name (Default: Anonymous)" 
                value={newPostData.authorName}
                onChange={e => setNewPostData({ ...newPostData, authorName: e.target.value })}
                style={{ flex: 1, minWidth: '150px' }}
              />
            </div>
            
            <div className="forum-compose-footer">
              <span className="char-count">{newPostData.body.length}/1000 characters</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setIsComposing(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleCreatePost} disabled={!newPostData.title || !newPostData.body}>
                  <Send size={16} /> Post Anonymously
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="forum-feed">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="empty-state">
            <Frown size={48} />
            <h3>No posts found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setFilterTag('All'); setSearchQuery(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const tagColors = getTagColor(post.tag);
            return (
              <div key={post.id} className="forum-post-card" onClick={() => fetchPostDetail(post.id)}>
                <div className="forum-post-votes" onClick={e => e.stopPropagation()}>
                  <button className="vote-btn" onClick={(e) => handleLike(post.id, e)}>
                    <ChevronDown size={20} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <span className="vote-count">{post.likes || 0}</span>
                  <button className="vote-btn" style={{ opacity: 0.5, cursor: 'default' }}>
                    <ChevronDown size={20} />
                  </button>
                </div>
                
                <div className="forum-post-main">
                  <div className="forum-post-header">
                    <span className="forum-post-tag" style={{ background: tagColors.bg, color: tagColors.text }}>
                      {post.tag}
                    </span>
                    <span className="forum-post-author">• Posted by {post.authorName}</span>
                  </div>
                  
                  <h3 className="forum-post-title">{post.title}</h3>
                  <div className="forum-post-body">{post.body}</div>
                  
                  <div className="forum-post-footer">
                    <div className="forum-post-action">
                      <MessageCircle size={16} /> {(post.comments || []).length} Comments
                    </div>
                    <div className="forum-post-action">
                      <Clock size={16} /> {formatTime(post.createdAt)}
                    </div>
                    <button className="forum-post-action vote-btn" style={{ marginLeft: 'auto', padding: 0 }} onClick={(e) => { e.stopPropagation(); /* share logic */ }}>
                      <Share2 size={16} /> Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
