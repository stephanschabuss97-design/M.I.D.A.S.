'use strict';
/**
 * MODULE: supabase/auth/index.js
 * Description: Zentraler Barrel für Authentifizierungs-Module (Core, UI, Guard) zur Bereitstellung eines einheitlichen Import-Points.
 * Submodules:
 *  - re-exports (Core, UI, Guard)
 */

// SUBMODULE: re-exports @public - vereint Auth-Komponenten in einem zentralen Barrel
export * from './core.js?v=22';
export * from './ui.js?v=22';
export * from './guard.js?v=22';
