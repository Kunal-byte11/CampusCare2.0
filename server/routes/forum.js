import express from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

const router = express.Router();

// Helper for timeAgo
function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  
  return Math.floor(seconds) + 's ago';
}

// Mock data
let mockPosts = [
  { id: '1', authorAnonId: 'anon_1', authorDisplayName: 'HelpfulSenior', title: 'Welcome to the forum!', body: 'Ask your questions here.', tag: 'General', likes_count: 5, comments_count: 1, created_at: new Date(Date.now() - 86400000).toISOString() }
];
let mockComments = [
  { id: '1', post_id: '1', authorAnonId: 'anon_2', authorDisplayName: 'Freshman24', body: 'Thanks!', created_at: new Date(Date.now() - 3600000).toISOString() }
];
let mockLikes = [
  { id: '1', post_id: '1', user_anon_id: 'anon_2' }
];

// GET /api/forum/posts
router.get('/posts', async (req, res) => {
  try {
    const { tag, search, sort = 'recent' } = req.query;
    
    if (isSupabaseConfigured) {
      let query = supabase.from('forum_posts').select('*');
      
      if (tag) {
        query = query.eq('tag', tag);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`); // Basic search in title
      }
      
      if (sort === 'popular') {
        query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const formattedPosts = data.map(post => ({
        ...post,
        timeAgo: timeAgo(post.created_at)
      }));
      
      res.json(formattedPosts);
    } else {
      let result = [...mockPosts];
      
      if (tag) result = result.filter(p => p.tag === tag);
      if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
      
      if (sort === 'popular') {
        result.sort((a, b) => b.likes_count - a.likes_count || new Date(b.created_at) - new Date(a.created_at));
      } else {
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      const formattedPosts = result.map(post => ({
        ...post,
        timeAgo: timeAgo(post.created_at)
      }));
      
      res.json(formattedPosts);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/forum/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isSupabaseConfigured) {
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (postError) throw postError;
      
      const { data: comments, error: commentsError } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
        
      if (commentsError) throw commentsError;
      
      res.json({
        ...post,
        timeAgo: timeAgo(post.created_at),
        comments: comments.map(c => ({ ...c, timeAgo: timeAgo(c.created_at) }))
      });
    } else {
      const post = mockPosts.find(p => p.id === id);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      
      const comments = mockComments
        .filter(c => c.post_id === id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
      res.json({
        ...post,
        timeAgo: timeAgo(post.created_at),
        comments: comments.map(c => ({ ...c, timeAgo: timeAgo(c.created_at) }))
      });
    }
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/forum/posts
router.post('/posts', async (req, res) => {
  try {
    const { authorAnonId, authorDisplayName, title, body, tag } = req.body;
    
    if (!authorAnonId || !title || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const postData = {
      authorAnonId,
      authorDisplayName: authorDisplayName || 'Anonymous',
      title,
      body,
      tag: tag || 'General',
      likes_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString()
    };
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([postData])
        .select()
        .single();
        
      if (error) throw error;
      res.status(201).json({ ...data, timeAgo: timeAgo(data.created_at) });
    } else {
      const newPost = { id: Date.now().toString(), ...postData };
      mockPosts.push(newPost);
      res.status(201).json({ ...newPost, timeAgo: timeAgo(newPost.created_at) });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// POST /api/forum/posts/:id/comments
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorAnonId, authorDisplayName, body, parentCommentId } = req.body;
    
    if (!authorAnonId || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const commentData = {
      post_id: id,
      authorAnonId,
      authorDisplayName: authorDisplayName || 'Anonymous',
      body,
      parent_comment_id: parentCommentId || null,
      created_at: new Date().toISOString()
    };
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert([commentData])
        .select()
        .single();
        
      if (error) throw error;
      
      const { data: post } = await supabase.from('forum_posts').select('comments_count').eq('id', id).single();
      if (post) {
        await supabase.from('forum_posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', id);
      }
      
      res.status(201).json({ ...data, timeAgo: timeAgo(data.created_at) });
    } else {
      const postIndex = mockPosts.findIndex(p => p.id === id);
      if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
      
      const newComment = { id: Date.now().toString(), ...commentData };
      mockComments.push(newComment);
      mockPosts[postIndex].comments_count += 1;
      
      res.status(201).json({ ...newComment, timeAgo: timeAgo(newComment.created_at) });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// POST /api/forum/posts/:id/like
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userAnonId } = req.body;
    
    if (!userAnonId) {
      return res.status(400).json({ error: 'userAnonId is required' });
    }
    
    if (isSupabaseConfigured) {
      const { data: existingLike } = await supabase
        .from('forum_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_anon_id', userAnonId)
        .single();
        
      const { data: post } = await supabase.from('forum_posts').select('likes_count').eq('id', id).single();
      let currentLikes = post ? (post.likes_count || 0) : 0;
        
      if (existingLike) {
        await supabase.from('forum_likes').delete().eq('id', existingLike.id);
        currentLikes = Math.max(0, currentLikes - 1);
        await supabase.from('forum_posts').update({ likes_count: currentLikes }).eq('id', id);
        res.json({ liked: false, likesCount: currentLikes });
      } else {
        await supabase.from('forum_likes').insert([{ post_id: id, user_anon_id: userAnonId }]);
        currentLikes += 1;
        await supabase.from('forum_posts').update({ likes_count: currentLikes }).eq('id', id);
        res.json({ liked: true, likesCount: currentLikes });
      }
    } else {
      const postIndex = mockPosts.findIndex(p => p.id === id);
      if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
      
      const likeIndex = mockLikes.findIndex(l => l.post_id === id && l.user_anon_id === userAnonId);
      
      if (likeIndex !== -1) {
        mockLikes.splice(likeIndex, 1);
        mockPosts[postIndex].likes_count = Math.max(0, mockPosts[postIndex].likes_count - 1);
        res.json({ liked: false, likesCount: mockPosts[postIndex].likes_count });
      } else {
        mockLikes.push({ id: Date.now().toString(), post_id: id, user_anon_id: userAnonId });
        mockPosts[postIndex].likes_count += 1;
        res.json({ liked: true, likesCount: mockPosts[postIndex].likes_count });
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// DELETE /api/forum/posts/:id
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { authorAnonId } = req.body;
    
    if (!authorAnonId) {
      return res.status(400).json({ error: 'authorAnonId is required' });
    }
    
    if (isSupabaseConfigured) {
      const { data: post } = await supabase.from('forum_posts').select('authorAnonId').eq('id', id).single();
      
      if (!post) return res.status(404).json({ error: 'Post not found' });
      if (post.authorAnonId !== authorAnonId) return res.status(403).json({ error: 'Unauthorized' });
      
      const { error } = await supabase.from('forum_posts').delete().eq('id', id);
      if (error) throw error;
      
      res.json({ success: true });
    } else {
      const postIndex = mockPosts.findIndex(p => p.id === id);
      if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
      
      if (mockPosts[postIndex].authorAnonId !== authorAnonId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      mockPosts.splice(postIndex, 1);
      mockComments = mockComments.filter(c => c.post_id !== id);
      mockLikes = mockLikes.filter(l => l.post_id !== id);
      
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
