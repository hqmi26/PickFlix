
import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the login link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)',
            color: '#fff',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '40px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    marginBottom: '30px',
                    textAlign: 'center',
                    color: 'var(--neon-gold)',
                    textShadow: '0 0 10px var(--neon-gold)'
                }}>
                    {isSignUp ? 'Join PickFlix' : 'Welcome Back'}
                </h1>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--neon-orange)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(0,0,0,0.3)',
                                color: '#fff',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--neon-orange)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ff4444', textAlign: 'center', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '14px',
                            borderRadius: '30px',
                            border: 'none',
                            background: 'linear-gradient(45deg, var(--neon-orange), var(--neon-red))',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: loading ? 'wait' : 'pointer',
                            marginTop: '10px',
                            boxShadow: '0 0 15px rgba(255, 69, 0, 0.4)',
                            transition: 'transform 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                        onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', color: '#aaa' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--neon-gold)',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textDecoration: 'underline'
                        }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
