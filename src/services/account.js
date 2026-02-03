
import { supabase } from './supabase';

// --- Profiles ---

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for no rows returned
        throw error;
    }
    return data;
};

export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updates, updated_at: new Date() })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const searchProfiles = async (query) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10);

    if (error) throw error;
    return data;
};

// --- Friends ---

export const getFriends = async (userId) => {
    // Get connections where user is either requester or recipient
    const { data, error } = await supabase
        .from('friends')
        .select(`
      id,
      status,
      created_at,
      user:user_id(id, username, avatar_url),
      friend:friend_id(id, username, avatar_url)
    `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    if (error) throw error;

    // Format data to return a clean list of friends
    return data.map(connection => {
        const isRequester = connection.user.id === userId;
        const friendProfile = isRequester ? connection.friend : connection.user;
        return {
            connectionId: connection.id,
            status: connection.status,
            isIncomingRequest: !isRequester && connection.status === 'pending',
            isOutgoingRequest: isRequester && connection.status === 'pending',
            ...friendProfile
        };
    });
};

export const addFriend = async (userId, friendId) => {
    // Check if connection already exists
    const { data: existing } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .single();

    if (existing) throw new Error("Friend request already exists or you are already friends.");

    const { data, error } = await supabase
        .from('friends')
        .insert([{ user_id: userId, friend_id: friendId }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const acceptFriendRequest = async (connectionId) => {
    const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const removeFriend = async (connectionId) => {
    const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', connectionId);

    if (error) throw error;
};
