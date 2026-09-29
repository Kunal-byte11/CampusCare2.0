import express from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import pkg from 'agora-token';
const { RtcTokenBuilder, RtcRole } = pkg;

const router = express.Router();

const APP_ID = process.env.AGORA_APP_ID || 'f34d04a684d742d4bd1a009585690ff7';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || 'fd9b1a01b38d4bb481e2f5de574211c3';

// Mock data
let mockCalls = [];

// GET /api/agora/config
router.get('/config', (req, res) => {
  res.json({ appId: APP_ID });
});

// Token generator helper
function generateRtcToken(req, res) {
  try {
    const channelName = req.body?.channelName || req.query?.channelName || req.query?.channel;
    const rawUid = req.body?.uid ?? req.query?.uid ?? 0;
    const uid = parseInt(rawUid, 10) || 0;
    const role = req.body?.role || req.query?.role || 'publisher';
    const expireTime = parseInt(req.body?.expireTime || req.query?.expireTime || 3600, 10);
    
    if (!channelName) {
      return res.status(400).json({ error: 'channelName is required' });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expireTime;
    
    const rtcRole = role === 'subscriber' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      rtcRole,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return res.json({
      token,
      appId: APP_ID,
      channelName,
      uid,
      expireTime: privilegeExpiredTs
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return res.status(500).json({ error: 'Failed to generate token: ' + error.message });
  }
}

// GET & POST /api/agora/token
router.get('/token', generateRtcToken);
router.post('/token', generateRtcToken);

// POST /api/agora/create-call
router.post('/create-call', async (req, res) => {
  try {
    const { callerAnonId, callerName, calleeAnonId, calleeName, callType = 'video' } = req.body;
    
    if (!callerAnonId || !calleeAnonId) {
      return res.status(400).json({ error: 'callerAnonId and calleeAnonId are required' });
    }

    const channelName = `cc_${callerAnonId}_${Date.now()}`;
    
    const callData = {
      channel_name: channelName,
      caller_anon_id: callerAnonId,
      caller_name: callerName || 'Anonymous',
      callee_anon_id: calleeAnonId,
      callee_name: calleeName || 'Anonymous',
      call_type: callType,
      status: 'waiting',
      created_at: new Date().toISOString()
    };

    let record = callData;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('video_calls')
        .insert([callData])
        .select()
        .single();
        
      if (error) throw error;
      record = data;
    } else {
      record.id = Date.now().toString();
      mockCalls.push(record);
    }

    // Generate token for caller
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + 3600;
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    res.status(201).json({ ...record, token, appId: APP_ID });
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// PATCH /api/agora/call/:channelName/join
router.patch('/call/:channelName/join', async (req, res) => {
  try {
    const { channelName } = req.params;
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('video_calls')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('channel_name', channelName)
        .select()
        .single();
        
      if (error) throw error;
      res.json(data);
    } else {
      const index = mockCalls.findIndex(c => c.channel_name === channelName);
      if (index === -1) return res.status(404).json({ error: 'Call not found' });
      
      mockCalls[index] = {
        ...mockCalls[index],
        status: 'active',
        started_at: new Date().toISOString()
      };
      res.json(mockCalls[index]);
    }
  } catch (error) {
    console.error('Error joining call:', error);
    res.status(500).json({ error: 'Failed to join call' });
  }
});

// PATCH /api/agora/call/:channelName/end
router.patch('/call/:channelName/end', async (req, res) => {
  try {
    const { channelName } = req.params;
    const endedAt = new Date().toISOString();
    
    if (isSupabaseConfigured) {
      // First get the call to calculate duration
      const { data: call } = await supabase
        .from('video_calls')
        .select('started_at')
        .eq('channel_name', channelName)
        .single();
        
      let durationSeconds = 0;
      if (call && call.started_at) {
        durationSeconds = Math.floor((new Date(endedAt) - new Date(call.started_at)) / 1000);
      }

      const { data, error } = await supabase
        .from('video_calls')
        .update({ 
          status: 'ended', 
          ended_at: endedAt,
          duration_seconds: durationSeconds
        })
        .eq('channel_name', channelName)
        .select()
        .single();
        
      if (error) throw error;
      res.json(data);
    } else {
      const index = mockCalls.findIndex(c => c.channel_name === channelName);
      if (index === -1) return res.status(404).json({ error: 'Call not found' });
      
      let durationSeconds = 0;
      if (mockCalls[index].started_at) {
        durationSeconds = Math.floor((new Date(endedAt) - new Date(mockCalls[index].started_at)) / 1000);
      }
      
      mockCalls[index] = {
        ...mockCalls[index],
        status: 'ended',
        ended_at: endedAt,
        duration_seconds: durationSeconds
      };
      res.json(mockCalls[index]);
    }
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

// GET /api/agora/calls/:anonId
router.get('/calls/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('video_calls')
        .select('*')
        .or(`caller_anon_id.eq.${anonId},callee_anon_id.eq.${anonId}`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      res.json(data || []);
    } else {
      const calls = mockCalls
        .filter(c => c.caller_anon_id === anonId || c.callee_anon_id === anonId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(calls);
    }
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

export default router;
