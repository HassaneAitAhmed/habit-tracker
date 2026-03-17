const SUPABASE_URL      = 'https://rhygsemxuwwbsxllwxfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoeWdzZW14dXd3YnN4bGx3eGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MjM4NDIsImV4cCI6MjA4OTE5OTg0Mn0.f4C1IjRXUwwimKW94eBwR4ILi0ipn1_etY1mMFuf3dg';

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
