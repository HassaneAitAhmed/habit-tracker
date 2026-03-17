const SUPABASE_URL      = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

if (typeof supabase === 'undefined') {
  document.getElementById('loadingOverlay').innerHTML = `
    <div style="text-align:center;padding:32px;max-width:420px;">
      <div style="font-size:32px;margin-bottom:14px;">📦</div>
      <div style="font-size:18px;font-weight:600;margin-bottom:10px;color:#1C1A15">Supabase failed to load</div>
      <div style="font-size:12px;color:#6B6558;margin-bottom:18px;line-height:1.8;">Check your internet connection and reload.</div>
      <button onclick="location.reload()" style="background:#4A3F2F;border:none;color:#F5F2EC;font-size:12px;padding:10px 24px;border-radius:8px;cursor:pointer;">Reload</button>
    </div>`;
  throw new Error('Supabase library not loaded');
}

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});
