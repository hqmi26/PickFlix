export const themes = {
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk Cinema',
        dark: {
            '--bg-dark': '#0a0a0a',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)',
            '--neon-primary': '#ff1f1f',
            '--neon-secondary': '#ffdb4d',
            '--neon-accent': '#ff8c00',
            '--text-primary': '#ffffff',
            '--text-secondary': '#a1a1a1',
            '--card-bg': '#1a1a1a',
            '--glass-bg': 'rgba(255, 255, 255, 0.05)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--glow-primary': '0 0 15px #ff1f1f',
            '--glow-secondary': '0 0 15px #ffdb4d',
        },
        light: {
            '--bg-dark': '#f0f0f5',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #ffffff 0%, #e0e0eb 100%)',
            '--neon-primary': '#d60000', // Darker red for light mode
            '--neon-secondary': '#e6c200', // Darker gold
            '--neon-accent': '#e67300', // Darker orange
            '--text-primary': '#1a1a1a',
            '--text-secondary': '#555555',
            '--card-bg': '#ffffff',
            '--glass-bg': 'rgba(0, 0, 0, 0.05)',
            '--glass-border': 'rgba(0, 0, 0, 0.1)',
            '--glow-primary': '0 0 15px rgba(214, 0, 0, 0.3)',
            '--glow-secondary': '0 0 15px rgba(230, 194, 0, 0.3)',
        }
    },
    classic: {
        id: 'classic',
        name: 'Classic Theatre',
        dark: {
            '--bg-dark': '#1a0505',
            '--bg-gradient': 'linear-gradient(135deg, #2b0a0a 0%, #1a0505 100%)',
            '--neon-primary': '#d4af37',
            '--neon-secondary': '#800020',
            '--neon-accent': '#e5e4e2',
            '--text-primary': '#f5f5f5',
            '--text-secondary': '#d3b8ae',
            '--card-bg': '#2a0e0e',
            '--glass-bg': 'rgba(212, 175, 55, 0.1)',
            '--glass-border': 'rgba(212, 175, 55, 0.3)',
            '--glow-primary': '0 0 15px #d4af37',
            '--glow-secondary': '0 0 10px #800020',
        },
        light: {
            '--bg-dark': '#fcf5e5', // Cream
            '--bg-gradient': 'linear-gradient(135deg, #fffaf0 0%, #f5e6d3 100%)',
            '--neon-primary': '#b8860b', // Dark Goldenrod
            '--neon-secondary': '#800020', // Burgundy stays same
            '--neon-accent': '#a9a9a9', // Dark Gray
            '--text-primary': '#2a0e0e', // Dark brown text
            '--text-secondary': '#5c4033', // Brownish gray
            '--card-bg': '#fffaf0',
            '--glass-bg': 'rgba(184, 134, 11, 0.1)',
            '--glass-border': 'rgba(184, 134, 11, 0.2)',
            '--glow-primary': '0 0 15px rgba(184, 134, 11, 0.3)',
            '--glow-secondary': '0 0 10px rgba(128, 0, 32, 0.3)',
        }
    },
    popcorn: {
        id: 'popcorn',
        name: 'Popcorn Pop',
        dark: {
            '--bg-dark': '#120a2e',
            '--bg-gradient': 'conic-gradient(from 0deg at 50% 50%, #120a2e, #240b3b, #120a2e)',
            '--neon-primary': '#ff00ff',
            '--neon-secondary': '#00ffff',
            '--neon-accent': '#ffff00',
            '--text-primary': '#ffffff',
            '--text-secondary': '#b3b3cc',
            '--card-bg': '#1e1145',
            '--glass-bg': 'rgba(255, 255, 255, 0.1)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--glow-primary': '0 0 15px #ff00ff',
            '--glow-secondary': '0 0 15px #00ffff',
        },
        light: {
            '--bg-dark': '#f5f0ff', // Very light purple
            '--bg-gradient': 'conic-gradient(from 0deg at 50% 50%, #ffffff, #f0e6ff, #ffffff)',
            '--neon-primary': '#cf00cf', // Darker Magenta
            '--neon-secondary': '#00a3a3', // Darker Cyan
            '--neon-accent': '#e6e600', // Darker Yellow
            '--text-primary': '#240b3b',
            '--text-secondary': '#665c84',
            '--card-bg': '#ffffff',
            '--glass-bg': 'rgba(0, 0, 0, 0.05)',
            '--glass-border': 'rgba(0, 0, 0, 0.1)',
            '--glow-primary': '0 0 15px rgba(207, 0, 207, 0.2)',
            '--glow-secondary': '0 0 15px rgba(0, 163, 163, 0.2)',
        }
    }
};
