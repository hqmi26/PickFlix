
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getProfile, updateProfile, getFriends, addFriend, acceptFriendRequest, removeFriend, searchProfiles } from '../services/account';
import { User, Users, Search, Plus, Check, X, LogOut, Edit2, Save } from 'lucide-react';

const Account = ({ session, onBack }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editing, setEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'friends'

    useEffect(() => {
        if (session?.user?.id) {
            loadData();
        }
    }, [session]);

    const loadData = async () => {
        setLoading(true);
        try {
            let userProfile = await getProfile(session.user.id);
            if (!userProfile) {
                // Initial profile creation if not exists
                userProfile = await updateProfile(session.user.id, {
                    username: session.user.email.split('@')[0],
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`
                });
            }
            setProfile(userProfile);
            setNewUsername(userProfile.username);
            setNewAvatar(userProfile.avatar_url);

            const friendsList = await getFriends(session.user.id);
            setFriends(friendsList);
        } catch (error) {
            console.error("Error loading account data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const updated = await updateProfile(session.user.id, {
                username: newUsername,
                avatar_url: newAvatar
            });
            setProfile(updated);
            setEditing(false);
        } catch (error) {
            alert("Error updating profile: " + error.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        try {
            const results = await searchProfiles(searchQuery);
            // Filter out self and existing friends
            const filtered = results.filter(u =>
                u.id !== session.user.id &&
                !friends.some(f => f.id === u.id && f.status === 'accepted')
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const handleAddFriend = async (friendId) => {
        try {
            await addFriend(session.user.id, friendId);
            setSearchResults(prev => prev.filter(u => u.id !== friendId));
            loadData(); // Reload to see pending request
            alert("Friend request sent!");
        } catch (error) {
            alert("Failed to send request: " + error.message);
        }
    };

    const handleAccept = async (connectionId) => {
        try {
            await acceptFriendRequest(connectionId);
            loadData();
        } catch (error) {
            console.error("Error accepting friend:", error);
        }
    };

    const handleRemove = async (connectionId) => {
        if (!confirm("Are you sure?")) return;
        try {
            await removeFriend(connectionId);
            loadData();
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    if (loading) return <div style={{ color: 'var(--neon-gold)', marginTop: '100px' }}>Loading Profile...</div>;

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            marginTop: '100px',
            padding: '20px',
            color: '#fff',
            zIndex: 10
        }}>
            <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'profile' ? 'var(--neon-gold)' : 'var(--text-gray)',
                            padding: '10px 20px',
                            borderBottom: activeTab === 'profile' ? '2px solid var(--neon-gold)' : 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}
                    >
                        <User size={20} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === 'friends' ? 'var(--neon-gold)' : 'var(--text-gray)',
                            padding: '10px 20px',
                            borderBottom: activeTab === 'friends' ? '2px solid var(--neon-gold)' : 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}
                    >
                        <Users size={20} /> Friends
                        {friends.some(f => f.isIncomingRequest) && (
                            <span style={{
                                background: 'var(--neon-red)',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%'
                            }} />
                        )}
                    </button>
                </div>

                {activeTab === 'profile' && profile && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={editing ? newAvatar : profile.avatar_url}
                                    alt="Avatar"
                                    style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        border: '3px solid var(--neon-gold)',
                                        objectFit: 'cover'
                                    }}
                                />
                                {editing && (
                                    <div style={{ marginTop: '20px' }}>
                                        <label style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '10px', display: 'block' }}>Choose an Avatar</label>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                                            gap: '10px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '10px',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '10px'
                                        }}>
                                            {Array.from({ length: 12 }).map((_, i) => {
                                                const seed = `avatar-${i}`;
                                                // Using a reliable dicebear style
                                                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setNewAvatar(url)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '50%',
                                                            border: newAvatar === url ? '3px solid var(--neon-gold)' : '2px solid transparent',
                                                            padding: '2px',
                                                            transition: 'all 0.2s',
                                                            opacity: newAvatar === url ? 1 : 0.7,
                                                            transform: newAvatar === url ? 'scale(1.1)' : 'scale(1)'
                                                        }}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Avatar Option ${i}`}
                                                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{ marginTop: '10px' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#ccc' }}>Or paste a custom URL:</label>
                                            <input
                                                type="text"
                                                value={newAvatar}
                                                onChange={(e) => setNewAvatar(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.2)',
                                                    borderRadius: '5px',
                                                    color: '#fff',
                                                    marginTop: '5px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ flex: 1 }}>
                                {editing ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Username</label>
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                style={{
                                                    display: 'block',
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid var(--neon-gold)',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '1.2rem',
                                                    marginTop: '5px'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={handleUpdateProfile}
                                                style={{
                                                    background: 'var(--neon-gold)',
                                                    color: '#000',
                                                    border: 'none',
                                                    padding: '8px 20px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                <Save size={18} /> Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditing(false);
                                                    setNewUsername(profile.username);
                                                    setNewAvatar(profile.avatar_url);
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '8px 20px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: '#fff' }}>{profile.username}</h2>
                                        <p style={{ color: 'var(--text-gray)', margin: 0 }}>{session.user.email}</p>
                                        <button
                                            onClick={() => setEditing(true)}
                                            style={{
                                                marginTop: '20px',
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: '#fff',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <Edit2 size={16} /> Edit Profile
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'friends' && (
                    <div>
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                            <input
                                type="text"
                                placeholder="Find friends by username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '30px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    background: 'var(--neon-orange)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '0 20px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <Search size={20} /> Search
                            </button>
                        </form>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>Found People</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {searchResults.map(user => (
                                        <div key={user.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={user.avatar_url} alt={user.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                                <span>{user.username}</span>
                                            </div>
                                            <button
                                                onClick={() => handleAddFriend(user.id)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: 'none',
                                                    color: 'var(--neon-green, #4ade80)',
                                                    padding: '8px',
                                                    borderRadius: '50%',
                                                    cursor: 'pointer'
                                                }}
                                                title="Add Friend"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Requests */}
                        {friends.filter(f => f.isIncomingRequest).length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                                <h3 style={{ color: 'var(--neon-gold)', fontSize: '0.9rem', marginBottom: '15px' }}>Pending Requests</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {friends.filter(f => f.isIncomingRequest).map(friend => (
                                        <div key={friend.connectionId} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px',
                                            background: 'rgba(255, 215, 0, 0.1)',
                                            border: '1px solid var(--neon-gold)',
                                            borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={friend.avatar_url} alt={friend.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                                <span>{friend.username}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleAccept(friend.connectionId)}
                                                    style={{
                                                        background: 'var(--neon-green, #4ade80)',
                                                        border: 'none',
                                                        color: '#000',
                                                        padding: '8px',
                                                        borderRadius: '50%',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(friend.connectionId)}
                                                    style={{
                                                        background: 'rgba(255,0,0,0.2)',
                                                        border: 'none',
                                                        color: 'var(--neon-red)',
                                                        padding: '8px',
                                                        borderRadius: '50%',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Friends List */}
                        <div>
                            <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>Your Friends ({friends.filter(f => f.status === 'accepted').length})</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {friends.filter(f => f.status === 'accepted').map(friend => (
                                    <div key={friend.connectionId} style={{
                                        padding: '15px',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '15px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        position: 'relative'
                                    }}>
                                        <img src={friend.avatar_url} alt={friend.username} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                                        <span style={{ fontWeight: 'bold' }}>{friend.username}</span>
                                        <button
                                            onClick={() => handleRemove(friend.connectionId)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'var(--text-gray)',
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                cursor: 'pointer'
                                            }}
                                            title="Remove Friend"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {friends.filter(f => f.status === 'accepted').length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-gray)', padding: '20px' }}>
                                        No friends yet. Search for people to add!
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Outgoing Requests */}
                        {friends.filter(f => f.isOutgoingRequest).length > 0 && (
                            <div style={{ marginTop: '30px' }}>
                                <h3 style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '15px' }}>Sent Requests</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.7 }}>
                                    {friends.filter(f => f.isOutgoingRequest).map(friend => (
                                        <div key={friend.connectionId} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '10px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={friend.avatar_url} alt={friend.username} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                                <span>{friend.username}</span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Pending</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;
