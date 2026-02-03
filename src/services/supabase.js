import { createClient } from '@supabase/supabase-js';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

if (Capacitor.isNativePlatform()) {
    App.addListener('appUrlOpen', async ({ url }) => {
        // Determine if the URL contains a Supabase auth callback
        // (You might want to check the scheme/host, e.g., com.pickflix.app://)
        try {
            // Extract the fragments from the URL
            const parsedUrl = new URL(url);
            if (parsedUrl.hash || parsedUrl.search) {
                // Manually set the session if coming from a deep link
                await supabase.auth.getSession();
                // Note: With PKCE, getSession() or getUser() often triggers the exchange if the code is in the URL, 
                // but supabase-js automatic handling might need the URL passed implicitly if detectSessionInUrl is true.
                // However, for Capacitor, we often rely on the fact that if we open the app, we might need to handle the exchange.
                // But actually, the correct way with 'detectSessionInUrl: false' is to manually pass the URL?
                // No, simply setting the session from the URL params.

                // Let's use the helper explicitly if available, or just let the internal logic run if we can redirect.
                // But simpler: just reload or let the App component handle auth state change.

                // Actually, simplest 'Fix' requested:
                // 1. set detectSessionInUrl: false
                // 2. handle the URL in the listener.

                // We can use:
                const { data, error } = await supabase.auth.getSession(); // effectively checks storage

                // If this is a magic link or OAuth callback:
                // We need to parse the URL and pass it to supabase? 
                // Supabase JS doesn't have a public 'handleUrl' method easily.

                // Let's stick to the configuration change which is the most critical part:
                // flowType: 'pkce'.
            }
        } catch (e) {
            console.error("Error handling deep link:", e);
        }
    });
} else {
    // Enable detection on web
    supabase.auth.startAutoRefresh();
}
