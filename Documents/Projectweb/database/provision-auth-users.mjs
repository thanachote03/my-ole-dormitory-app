#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// Provision Supabase Auth users for existing tenants
// ═══════════════════════════════════════════════════════════════════════════
//
// Usage:
//   1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
//      (get the service role key from Dashboard → Settings → API → service_role)
//   2. node database/provision-auth-users.mjs
//
// What it does:
//   • For every tenant in public.tenants, create an auth.users record
//   • Email: <username>@dorm.local  (synthetic — tenants won't use real email)
//   • Password: tenant.password field (or 'tenant' default)
//   • Sets user_metadata.role='tenant', user_metadata.tenant_id=<id>
//   • Updates tenants.auth_id with the new user's UUID
//
// Re-runnable: skips tenants that already have auth_id set.
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const URL  = process.env.SUPABASE_URL  || process.env.VITE_SUPABASE_URL;
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  console.error('   Get them from Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  console.log('🔍 Loading tenants…');
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, name, username, password, room_id, auth_id');
  if (error) { console.error('❌', error); process.exit(1); }

  console.log(`📋 Found ${tenants.length} tenants\n`);

  let created = 0, skipped = 0, failed = 0;

  for (const t of tenants) {
    if (t.auth_id) { skipped++; console.log(`⏭️  ${t.id} ${t.name} — already has auth_id`); continue; }

    const email = `${t.username || t.id}@dorm.local`.toLowerCase();
    const password = t.password || 'tenant';

    try {
      const { data, error: createErr } = await supabase.auth.admin.createUser({
        email, password,
        email_confirm: true,
        user_metadata: { role: 'tenant', tenant_id: t.id, name: t.name },
      });
      if (createErr) {
        // If user already exists, look them up
        if (createErr.message?.includes('already')) {
          const { data: existing } = await supabase.auth.admin.listUsers();
          const found = existing?.users?.find(u => u.email === email);
          if (found) {
            await supabase.from('tenants').update({ auth_id: found.id }).eq('id', t.id);
            console.log(`🔗 ${t.id} ${t.name} — linked existing auth user`);
            created++;
            continue;
          }
        }
        throw createErr;
      }
      await supabase.from('tenants').update({ auth_id: data.user.id }).eq('id', t.id);
      console.log(`✅ ${t.id} ${t.name} → ${email}`);
      created++;
    } catch (e) {
      console.error(`❌ ${t.id} ${t.name} —`, e.message || e);
      failed++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Created/linked: ${created}`);
  console.log(`⏭️  Skipped (already linked): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
