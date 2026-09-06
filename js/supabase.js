const SUPABASE_URL = "https://fjwjytehafmfguuumueb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__28GApH9yOEQlgxjXLSmVQ_TkprXtZ1";

const SupabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);