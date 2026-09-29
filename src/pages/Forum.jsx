import React, { useState } from 'react';

const initialPosts = [
  {
    id: 1,
    user: 'BlueSky42',
    time: '2h ago',
    tag: 'Anxiety',
    title: 'Panic attacks during exams — anyone else?',
    body: "I've been having really intense panic attacks right before big tests. Even when I've studied a lot. Does anyone have tips for managing this?",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    user: 'AnonymousStudent',
    time: '5h ago',
    tag: 'Loneliness',
    title: 'Feeling really disconnected since moving to campus',
    body: "It's my first semester and I haven't really made any close friends. Everyone seems to already have their groups. It gets really lonely on weekends.",
    likes: 45,
    comments: 14,
  },
  {
    id: 3,
    user: 'NightOwl_99',
    time: '1d ago',
    tag: 'Sleep',
    title: 'Insomnia ruining my mornings',
    body: "Can't fall asleep until 4 AM most nights. I've tried melatonin, no screens before bed... nothing is working. Just venting.",
    likes: 18,
    comments: 6,
  },
];

export default function Forum() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      user: 'You',
      time: 'Just now',
      tag: 'General',
      title: 'New Discussion',
      body: newPost.trim(),
      likes: 0,
      comments: 0,
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <div className="page active" id="page-forum">
      <div className="forum-layout">
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Community Forum</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>A safe space to share experiences and support each other anonymously.</p>

        <div className="forum-compose">
          <div className="fp-avatar">U</div>
          <input
            type="text"
            className="compose-input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share what's on your mind... (Press Enter to post)"
          />
          <button className="btn-primary" onClick={handlePost} style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>Post Anonymously</button>
        </div>

        <div className="forum-feed">
          {posts.map(p => (
            <div key={p.id} className="forum-post">
              <div className="fp-top">
                <div className="fp-avatar">{p.user.charAt(0)}</div>
                <div className="fp-user">{p.user}</div>
                <div className="fp-tag">{p.tag}</div>
                <div className="fp-time">{p.time}</div>
              </div>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
              <div className="fp-actions">
                <div className="fp-action">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                  {p.likes}
                </div>
                <div className="fp-action">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                  {p.comments} Replies
                </div>
                <div className="fp-action" style={{ marginLeft: 'auto' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                  Share
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
