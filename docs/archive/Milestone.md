# Milestone: Persistent Login (Supabase Auth)

Date: 2025-12-28
Owner: MIDAS App

## Executive summary
We shipped a persistent login flow that keeps users signed in across reloads and browser restarts, while preserving deterministic module boot order. The implementation is intentionally small because Supabase already provides a robust session persistence mechanism. The work focused on enabling it cleanly and eliminating race conditions during boot.

## What we achieved
- Persistent login is now the default behavior: a valid Supabase session is stored and restored automatically.
- Module boot is deterministic: auth and data layers are initialized before modules attempt to sync.
- Duplicate Supabase auth clients are avoided, preventing undefined behavior.
- UI no longer flickers into auth-gated placeholders during boot, and modules can wait safely for auth + storage readiness.

## Why this was "easy"
Supabase Auth already ships with session persistence; it only requires `persistSession: true` and a single client per tab. The earlier issues were caused by:
- multiple client instantiations
- auth and data modules touching IndexedDB before it was initialized
- boot order not waiting for Supabase to be ready

Once those were corrected, persistent login worked with minimal changes because the underlying platform was already designed for it.

## Technical changes (high level)
1) Supabase client persistence
- Enabled `persistSession: true` in the Supabase client configuration.
- Added an inflight lock so only one GoTrue client is created per tab load.

2) Deterministic boot order
- Boot now waits for Supabase to be available (with a short timeout) before module init.
- Auth-dependent modules are gated behind storage initialization.

3) Local storage readiness
- Profile and appointments sync now ensure IndexedDB is initialized before reading or writing.
- Reduces transient boot errors and prevents spurious auth redirects.

4) Assistant/Hub QoL
- Assistant context refresh uses lazy loading and placeholders when values are missing.
- Appointment formatting handles missing time data gracefully.

## Behavior expectations
- Normal reload or browser restart: user stays logged in.
- Clearing site data (cache/storage): user must log in again. This is expected and correct.
- Private browsing or storage-blocked contexts: persistence may not work; user will be prompted to log in.

## Risk and robustness notes
- Single client per tab prevents GoTrue warnings and race conditions.
- Auth/session state is now consistent across modules because the boot sequence is serialized.
- The persistent session is as robust as the browser storage; wiping storage is the only normal reason for a forced login.

## Validation checklist (optional)
- Open app, log in once, refresh tab: still logged in.
- Close tab/browser, reopen: still logged in.
- Clear site data: login is required (expected).
- Toggle offline/online: session remains; data sync resumes when online.

## Files touched in this milestone
- `app/supabase/core/client.js`
- `assets/js/main.js`
- `app/modules/profile/index.js`
- `app/modules/appointments/index.js`
- `app/modules/hub/index.js`
- `docs/modules/Auth Module Overview.md`
- `docs/modules/Supabase Core Overview.md`

