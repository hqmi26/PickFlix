import { supabase } from './supabase';

export const createRoom = async (config = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate a 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
        .from('rooms')
        .insert({
            code,
            host_id: user.id,
            config,
            status: 'waiting'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const joinRoom = async (code) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code)
        .single();

    if (roomError) throw new Error('Room not found');

    const { error: joinError } = await supabase
        .from('room_participants')
        .insert({
            room_id: room.id,
            user_id: user.id
        });

    if (joinError && joinError.code !== '23505') { // Ignore unique violation if already joined
        throw joinError;
    }

    return room;
};

export const ensureJoined = async (roomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('room_participants')
        .insert({
            room_id: roomId,
            user_id: user.id
        });

    if (error && error.code !== '23505') { // Ignore unique violation
        console.error("Error ensuring join:", error);
    }
};

export const leaveRoom = async (roomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
};

export const cancelRoom = async (roomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId)
        .eq('host_id', user.id);
};

export const subscribeToRoom = (roomId, onUpdate) => {
    // Subscribe to room changes (e.g. status start)
    const roomChannel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
            onUpdate({ type: 'ROOM_UPDATE', payload: payload.new });
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, () => {
            onUpdate({ type: 'ROOM_DELETED' });
        })
        // Listen for new votes (USER_VOTED)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_votes', filter: `room_id=eq.${roomId}` }, (payload) => {
            onUpdate({ type: 'USER_VOTED', payload: payload.new });
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_matches', filter: `room_id=eq.${roomId}` }, (payload) => {
            onUpdate({ type: 'MATCH_FOUND', payload: payload.new });
        })
        // Presence for participants
        .on('presence', { event: 'sync' }, () => {
            const newState = roomChannel.presenceState();
            onUpdate({ type: 'PRESENCE_SYNC', payload: newState });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            onUpdate({ type: 'PRESENCE_JOIN', payload: newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            onUpdate({ type: 'PRESENCE_LEAVE', payload: leftPresences });
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                const { data: { user } } = await supabase.auth.getUser();
                await roomChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
            }
        });

    return roomChannel;
};

export const castVote = async (roomId, movieId, vote) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('handle_vote', {
        p_room_id: roomId,
        p_movie_id: movieId,
        p_vote: vote
    });

    if (error) throw error;

    return { otherLikers: data.other_likers };
};

// checkForMatch is now handled server-side by handle_vote RPC

export const getRoomMatches = async (roomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('room_matches')
        .select('*')
        .eq('room_id', roomId);

    if (error) throw error;
    return data;
};

export const getRoomVotes = async (roomId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('room_votes')
        .select('*')
        .eq('room_id', roomId);

    if (error) throw error;
    return data;
};
