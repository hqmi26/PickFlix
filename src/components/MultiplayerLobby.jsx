import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createRoom, joinRoom, subscribeToRoom, cancelRoom, leaveRoom } from '../services/multiplayer';
import { supabase } from '../services/supabase';

const MultiplayerLobby = ({ onStartGame, onBack }) => {
    const [view, setView] = useState('menu'); // 'menu', 'hosting', 'joining'
    const [roomCode, setRoomCode] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isHost, setIsHost] = useState(false);

    // Subscribe to room updates when in a room
    // Check for persisted room state on mount
    useEffect(() => {
        const checkPersistedState = async () => {
            const savedState = localStorage.getItem('pickflix-multiplayer-state');
            if (savedState) {
                try {
                    const { roomId: savedRoomId, roomCode: savedRoomCode, isHost: savedIsHost } = JSON.parse(savedState);

                    // Verify room still exists in Supabase
                    const { data: room, error } = await supabase
                        .from('rooms')
                        .select('*')
                        .eq('id', savedRoomId)
                        .single();

                    if (error || !room) {
                        // Room no longer exists, clear state
                        localStorage.removeItem('pickflix-multiplayer-state');
                        return;
                    }

                    // Restore state
                    setRoomId(savedRoomId);
                    setRoomCode(savedRoomCode);
                    setIsHost(savedIsHost);
                    setView('hosting');

                    // If game already active, rejoin automatically
                    if (room.status === 'active') {
                        onStartGame(room);
                    } else {
                        // Re-join logic for lobby presence
                        // We don't need to re-insert into room_participants because we never left DB
                        // But we do need to subscribe, which happens in the other useEffect(roomId)
                    }
                } catch (e) {
                    console.error("Failed to restore multiplayer state", e);
                    localStorage.removeItem('pickflix-multiplayer-state');
                }
            }
        };

        checkPersistedState();
    }, []);

    // Subscribe to room updates when in a room
    useEffect(() => {
        if (!roomId) return;

        const channel = subscribeToRoom(roomId, (action) => {
            // console.log('Room Action:', action);
            if (action.type === 'PRESENCE_SYNC' || action.type === 'PRESENCE_JOIN' || action.type === 'PRESENCE_LEAVE') {
                // For simplicity, we can just rely on syncing the full state or creating a list from presences
                // But actually Supabase Presence returns an object keyed by user_id
                // Let's refetch participants from DB for accuracy on join, or use presence state
                // For this prototype, let's just re-fetch the participant list from DB on join/leave events
                fetchParticipants();
            }
            if (action.type === 'ROOM_UPDATE') {
                if (action.payload.status === 'active') {
                    onStartGame(action.payload);
                }
            }
            if (action.type === 'ROOM_DELETED') {
                setRoomId(null);
                setRoomCode('');
                setIsHost(false);
                setView('menu');
                setError('Host cancelled the room');
                localStorage.removeItem('pickflix-multiplayer-state');
            }
        });

        const fetchParticipants = async () => {
            const { data } = await supabase
                .from('room_participants')
                .select('user_id, joined_at');
            // In a real app we'd join with profiles, but we might not have a profiles table yet.
            // We'll just show User IDs or random avatars for now.
            if (data) setParticipants(data);
        };

        fetchParticipants();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    const handleCreateRoom = async () => {
        setLoading(true);
        setError(null);
        try {
            const room = await createRoom({ category: 'popular' }); // Default config
            setRoomCode(room.code);
            setRoomId(room.id);
            setIsHost(true);

            // Auto-join host
            await joinRoom(room.code);

            // Persist state
            localStorage.setItem('pickflix-multiplayer-state', JSON.stringify({
                roomId: room.id,
                roomCode: room.code,
                isHost: true
            }));

            setView('hosting');
        } catch (err) {
            console.error(err);
            setError('Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!joinCode) return;
        setLoading(true);
        setError(null);
        try {
            const room = await joinRoom(joinCode.toUpperCase());
            setRoomCode(room.code);
            setRoomId(room.id);
            const isHostUser = room.host_id === (await supabase.auth.getUser()).data.user.id;
            setIsHost(isHostUser);

            // Persist state
            localStorage.setItem('pickflix-multiplayer-state', JSON.stringify({
                roomId: room.id,
                roomCode: room.code,
                isHost: isHostUser
            }));

            setView('hosting'); // Same view for lobby, just waiting
        } catch (err) {
            console.error(err);
            setError('Failed to join room. Check the code.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = async () => {
        // Update room status to active
        await supabase
            .from('rooms')
            .update({ status: 'active' })
            .eq('id', roomId);
        // Trigger handled by subscription
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
        // Maybe show toast
    };

    return (
        <div className="multiplayer-lobby" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            color: 'var(--text-white)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
        }}>
            <h2 style={{
                fontSize: '2.5rem',
                color: 'var(--neon-gold)',
                textShadow: '0 0 10px var(--neon-gold)'
            }}>
                Movie Night
            </h2>

            {view === 'menu' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <button
                        onClick={handleCreateRoom}
                        disabled={loading}
                        style={{
                            ...buttonStyle,
                            background: 'transparent',
                            border: '2px solid var(--neon-red)',
                            color: 'var(--neon-red)',
                            boxShadow: '0 0 15px var(--neon-red), inset 0 0 10px var(--neon-red)',
                            textShadow: '0 0 5px var(--neon-red)'
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Room'}
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Enter Code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            style={inputStyle}
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={loading || !joinCode}
                            style={{
                                ...buttonStyle,
                                flex: 1,
                                background: 'transparent',
                                border: '2px solid var(--neon-gold)',
                                color: 'var(--neon-gold)',
                                boxShadow: '0 0 15px var(--neon-gold), inset 0 0 10px var(--neon-gold)',
                                textShadow: '0 0 5px var(--neon-gold)'
                            }}
                        >
                            Join
                        </button>
                    </div>
                    {error && <p style={{ color: 'var(--neon-red)' }}>{error}</p>}
                </div>
            )}

            {view === 'hosting' && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-gray)' }}>Room Code</p>
                        <div
                            onClick={copyCode}
                            style={{
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                letterSpacing: '5px',
                                cursor: 'pointer',
                                color: 'var(--neon-orange)',
                                textShadow: '0 0 20px rgba(255, 138, 0, 0.5)'
                            }}>
                            {roomCode}
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Click to copy</p>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3>Participants ({participants.length})</h3>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            marginTop: '1rem'
                        }}>
                            {participants.map(p => (
                                <div key={p.user_id} style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--neon-gold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    👤
                                </div>
                            ))}
                        </div>
                    </div>

                    {isHost ? (
                        <button
                            onClick={handleStartGame}
                            style={{ ...buttonStyle, background: 'var(--neon-gold)', color: '#000' }}
                        >
                            Start Swiping
                        </button>
                    ) : (
                        <p style={{ fontStyle: 'italic', color: 'var(--text-gray)' }}>
                            Waiting for host to start...
                        </p>
                    )}

                    {isHost && (
                        <button
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel the room?')) {
                                    await cancelRoom(roomId);
                                    localStorage.removeItem('pickflix-multiplayer-state');
                                }
                            }}
                            style={{
                                marginTop: '1rem',
                                background: 'transparent',
                                color: 'var(--neon-red)',
                                border: '1px solid var(--neon-red)',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel Room
                        </button>
                    )}

                    {!isHost && (
                        <button
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to leave the room?')) {
                                    await leaveRoom(roomId);
                                    localStorage.removeItem('pickflix-multiplayer-state');
                                    setRoomId(null);
                                    setRoomCode('');
                                    setView('menu');
                                }
                            }}
                            style={{
                                marginTop: '1rem',
                                background: 'transparent',
                                color: 'var(--neon-orange)',
                                border: '1px solid var(--neon-orange)',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            Exit Room
                        </button>
                    )}
                </div>
            )}

            <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-gray)', marginTop: '2rem', cursor: 'pointer' }}>
                Back to Solo Mode
            </button>
        </div>
    );
};

const buttonStyle = {
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'var(--glass-bg)',
    color: 'var(--text-white)',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const inputStyle = {
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(0,0,0,0.3)',
    color: 'var(--text-white)',
    fontSize: '1.2rem',
    flex: 2,
    textAlign: 'center',
    textTransform: 'uppercase'
};

export default MultiplayerLobby;
