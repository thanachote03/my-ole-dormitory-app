// Dormitory · Soft Pastel Redesign — entry shell
import { useEffect, useState } from "react";
import { DataProvider } from "./design/DataContext";
import { LoginScreen, LoginFormScreen, TenantApp } from "./design/mobile";
import { OwnerDesktop } from "./design/owner";
import { OwnerMobile } from "./design/owner-mobile";
import { supabase } from "./supabaseClient";

export default function App() {
  return (
    <DataProvider>
      <Shell/>
    </DataProvider>
  );
}

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [breakpoint]);
  return mobile;
}

// Storage strategy — prevents cross-tab session collision when owner and tenant
// are both logged in simultaneously (e.g. testing in two browser tabs/windows):
//
//  sessionStorage  → tab-specific; each tab gets its own copy, never bleeds over
//  localStorage    → shared across all tabs in the same browser
//
// Owner  : sessionStorage (this tab) + localStorage (survive browser restart)
// Tenant : sessionStorage ONLY  (tab-isolated; a new tab starts at login screen,
//           which is correct — tenants always log in on their own device)
//
const SESSION_KEY = "bee_auth_session"; // sessionStorage — tab-specific
const OWNER_KEY   = "bee_auth_owner";   // localStorage   — persisted owner session
const LEGACY_KEY  = "bee_auth";         // keep for one-release migration

function loadStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage first — always wins for this specific tab
    const sess = window.sessionStorage.getItem(SESSION_KEY);
    if (sess) return JSON.parse(sess);
    // Fall back to persisted owner session (survives browser close/reopen)
    const owner = window.localStorage.getItem(OWNER_KEY);
    if (owner) return JSON.parse(owner);
    // One-release legacy migration: move old key to new scheme then remove it
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      window.localStorage.removeItem(LEGACY_KEY);
      return parsed;
    }
  } catch {}
  return null;
}

function Shell() {
  const [auth, setAuthState] = useState(loadStoredAuth);
  const [pickRole, setPickRole] = useState(null);
  const mobile = useIsMobile();

  const setAuth = (next) => {
    setAuthState(next);
    try {
      if (next && next.remember !== false) {
        // Always write to sessionStorage so THIS tab remembers who it is
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
        if (next.role === "owner") {
          // Owner also goes to localStorage → survives browser restart
          window.localStorage.setItem(OWNER_KEY, JSON.stringify(next));
        }
        // Tenant intentionally NOT written to localStorage — tab-only session
      } else {
        window.sessionStorage.removeItem(SESSION_KEY);
        window.localStorage.removeItem(OWNER_KEY);
      }
    } catch {}
  };

  // Sign out from Supabase Auth when user logs out (no-op if not signed in)
  const handleLogout = () => {
    try { supabase.auth.signOut(); } catch {}
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(OWNER_KEY);
      window.localStorage.removeItem(LEGACY_KEY); // clean up legacy
    } catch {}
    setAuthState(null);
    setPickRole(null);
  };

  if (auth?.role === "owner") {
    return mobile
      ? <OwnerMobile staffRole={auth.staffRole} staffName={auth.staffName} onLogout={handleLogout}/>
      : <OwnerDesktop staffRole={auth.staffRole} staffName={auth.staffName} onLogout={handleLogout}/>;
  }
  if (auth?.role === "tenant") {
    return (
      <MobileCanvas>
        <TenantApp tenantId={auth.tenantId} onLogout={handleLogout}/>
      </MobileCanvas>
    );
  }

  if (pickRole) {
    return (
      <MobileCanvas>
        <LoginFormScreen role={pickRole} onBack={() => setPickRole(null)} onSuccess={(u) => setAuth(u)}/>
      </MobileCanvas>
    );
  }

  return (
    <MobileCanvas>
      <LoginScreen onPick={(r) => setPickRole(r)}/>
    </MobileCanvas>
  );
}

function MobileCanvas({ children }) {
  // Full-viewport background (cream), with the screen content centered in a
  // mobile-width column. Real mobile devices see the column fill their screen;
  // desktop sees a centered card-like column with cream sides.
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", background: "var(--bg)",
    }}>
      <div style={{
        width: "100%", maxWidth: 440, flex: 1,
        display: "flex", flexDirection: "column",
        boxShadow: "var(--sh-2)",
      }}>
        {children}
      </div>
    </div>
  );
}
