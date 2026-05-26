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

const AUTH_KEY = "bee_auth";

function loadStoredAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function Shell() {
  const [auth, setAuthState] = useState(loadStoredAuth);
  const [pickRole, setPickRole] = useState(null);
  const mobile = useIsMobile();

  // Wrap setAuth so success writes to localStorage (when "remember" is true,
  // which is the default in the login form). Refresh then re-hydrates the
  // session instead of dumping the user back at the welcome screen.
  const setAuth = (next) => {
    setAuthState(next);
    try {
      if (next && next.remember !== false) {
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
      } else {
        window.localStorage.removeItem(AUTH_KEY);
      }
    } catch {}
  };

  // Sign out from Supabase Auth when user logs out (no-op if not signed in)
  const handleLogout = () => {
    try { supabase.auth.signOut(); } catch {}
    try { window.localStorage.removeItem(AUTH_KEY); } catch {}
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
