// ─── Mobile phone frame + the interactive tenant/owner mobile app ────────
const { useState, useMemo, useEffect, useRef } = React;
const { IconHome, IconUser, IconUsers, IconWallet, IconCard, IconWrench, IconBuilding,
        IconChart, IconLock, IconBell, IconSearch, IconPlus, IconCheck, IconX,
        IconArrowLeft, IconArrowRight, IconChevR, IconChevL, IconCal, IconPhone,
        IconSettings, IconLogout, IconSparkle, IconWifi, IconSnow, IconFridge,
        IconBalcony, IconTV, IconWasher, IconHanger, IconKitchen, IconDot,
        IconTrash, IconEdit, IconTrend, IconClock, IconBack, IconKey } = window.DI;
const { MONTHS_TH, MONTHS_FULL, AMENITY_OPTS, CUR_Y, CUR_M, dl, baht,
        SEED_ROOMS, SEED_TENANTS, SEED_PAYMENTS, SEED_REPAIRS } = window.SEED;

const amenityIcon = (a) => ({
  "แอร์": IconSnow, "ตู้เย็น": IconFridge, "Wi-Fi": IconWifi, "ระเบียง": IconBalcony,
  "ครัว": IconKitchen, "เครื่องซัก": IconWasher, "เคเบิล TV": IconTV, "ตู้เสื้อผ้า": IconHanger,
}[a] || IconDot);

// ─── Phone Frame ─────────────────────────────────────────────────────────
function Phone({ children, label = "iPhone · 390 × 844" }) {
  return (
    <div style={{ width: 390, height: 844, position: "relative" }}>
      <div style={{
        width: "100%", height: "100%",
        background: "var(--bg)",
        borderRadius: 44,
        border: "1px solid var(--line-2)",
        boxShadow: "var(--sh-3)",
        overflow: "hidden",
        position: "relative",
        display: "flex", flexDirection: "column",
      }}>
        {/* status bar */}
        <div style={{
          height: 44, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", fontSize: 14, fontWeight: 600, color: "var(--ink)",
          flexShrink: 0, fontFamily: "var(--font-en)",
        }}>
          <span>9:41</span>
          <div style={{
            position: "absolute", left: "50%", top: 10, transform: "translateX(-50%)",
            width: 100, height: 28, borderRadius: 14, background: "var(--ink)",
          }}/>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="6" width="3" height="5" rx="0.5"/><rect x="5" y="4" width="3" height="7" rx="0.5"/><rect x="10" y="2" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="11" rx="0.5"/></svg>
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor" strokeWidth="1"><rect x="0.5" y="0.5" width="18" height="10" rx="2"/><rect x="2" y="2" width="13" height="7" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
        {/* home indicator */}
        <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 134, height: 5, borderRadius: 3, background: "var(--ink)" }}/>
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────
function LoginScreen({ onPick }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "32px 28px 28px", background: "linear-gradient(170deg, var(--brand-soft) 0%, var(--bg) 60%)" }}>
      {/* Brand mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <IconBuilding size={20} strokeWidth={2}/>
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.2 }}>Baan<span style={{color:"var(--brand)"}}>.</span></div>
      </div>

      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.6, color: "var(--ink)" }}>
          ยินดีต้อนรับ<br/>กลับมาอีกครั้ง
        </div>
        <div style={{ fontSize: 15, color: "var(--ink-3)", marginTop: 12, lineHeight: 1.5 }}>
          ระบบจัดการหอพักที่ทำให้ทั้งเจ้าของและผู้เช่าใช้ชีวิตง่ายขึ้น
        </div>
      </div>

      {/* Role cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <RoleCard
          accent="var(--brand)" bg="var(--surface)" border="var(--line)"
          icon={<IconUser size={22} stroke="var(--brand)"/>}
          title="ผู้เช่า"
          sub="ดูใบแจ้งหนี้ ชำระค่าเช่า แจ้งซ่อมห้อง"
          onClick={() => onPick("tenant")}
        />
        <RoleCard
          accent="var(--ink)" bg="var(--ink)" fg="white" border="var(--ink)"
          icon={<IconKey size={22} stroke="white"/>}
          title="เจ้าของ / ผู้จัดการ"
          sub="จัดการห้อง ผู้เช่า รายได้ และงานซ่อม"
          onClick={() => onPick("pin")}
          dark
        />
      </div>

      <div style={{ flex: 1 }}/>
      <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", marginTop: 16 }}>
        v2.0 · มีปัญหาในการเข้าใช้งาน? <span style={{ color: "var(--brand)", fontWeight: 600 }}>ติดต่อแอดมิน</span>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, sub, onClick, bg, fg = "var(--ink)", border, dark }) {
  return (
    <button onClick={onClick} className="lift" style={{
      display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
      background: bg, border: `1px solid ${border}`, borderRadius: 18, cursor: "pointer",
      textAlign: "left", color: fg, boxShadow: "var(--sh-1)",
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 12,
        background: dark ? "rgba(255,255,255,0.10)" : "var(--brand-soft)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.1 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: dark ? "rgba(255,255,255,0.65)" : "var(--ink-3)", marginTop: 2 }}>{sub}</div>
      </div>
      <IconChevR size={18} stroke={dark ? "rgba(255,255,255,0.6)" : "var(--ink-4)"}/>
    </button>
  );
}

// ─── PIN Screen ──────────────────────────────────────────────────────────
function PinScreen({ onBack, onSuccess, title = "ใส่รหัสผ่าน", sub = "เจ้าของ / ผู้จัดการ · 6 หลัก", correctPin = "123456" }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);

  const press = (d) => {
    if (pin.length >= 6) return;
    const next = pin + d; setPin(next);
    if (next.length === 6) setTimeout(() => {
      if (next === correctPin) { setPin(""); onSuccess?.(); }
      else { setErr(true); setTimeout(() => { setPin(""); setErr(false); }, 700); }
    }, 150);
  };
  const del = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 28px", background: "var(--bg)" }}>
      <button onClick={onBack} style={{
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
        width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--ink)"
      }}><IconBack size={18}/></button>

      <div style={{ marginTop: 48, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "var(--brand-soft)",
          display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <IconLock size={28} stroke="var(--brand)" strokeWidth={1.75}/>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 16, letterSpacing: -0.2 }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 6 }}>{sub}</div>

        <div className={err ? "shake" : ""} style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 28 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: "50%",
              background: err ? "var(--danger)" : i < pin.length ? "var(--brand)" : "var(--line-2)",
              transition: "background .15s",
            }}/>
          ))}
        </div>
        {err && <div style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>รหัสไม่ถูกต้อง · ลองอีกครั้ง</div>}
      </div>

      <div style={{ flex: 1 }}/>

      <Numpad onPress={press} onDelete={del}/>

      <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: "var(--ink-3)" }}>
        ลืมรหัสผ่าน? <span style={{ color: "var(--brand)", fontWeight: 600 }}>ติดต่อ Admin</span>
      </div>
    </div>
  );
}

function Numpad({ onPress, onDelete }) {
  const cell = (k, label, action, isAction = false) => (
    <button key={k} onClick={action} className="lift" style={{
      height: 60, borderRadius: 18,
      background: isAction ? "transparent" : "var(--surface)",
      border: isAction ? "none" : "1px solid var(--line)",
      fontSize: 22, fontWeight: 600, color: "var(--ink)", cursor: "pointer",
      boxShadow: isAction ? "none" : "var(--sh-1)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>{label}</button>
  );
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {[1,2,3,4,5,6,7,8,9].map(n => cell(`n${n}`, n, () => onPress(String(n))))}
      <div key="spacer"/>
      {cell("n0", 0, () => onPress("0"))}
      {cell("del", <IconX size={20} stroke="var(--ink-3)"/>, onDelete, true)}
    </div>
  );
}

// ─── Login Form (Username + Password) ───────────────────────────────────
function LoginFormScreen({ role = "owner", onBack, onSuccess }) {
  const [u, setU] = useState(role === "owner" ? "admin" : "T2");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState(false);

  const roleLabel = role === "owner" ? "เจ้าของ / ผู้จัดการ" : "ผู้เช่า";
  const correctPass = role === "owner" ? "admin1234" : "tenant";

  const submit = () => {
    if (!u || !p) { setErr(true); setTimeout(() => setErr(false), 700); return; }
    if (p === correctPass) { onSuccess?.(u); }
    else { setErr(true); setTimeout(() => setErr(false), 700); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 28px",
      background: "linear-gradient(170deg, var(--brand-soft) 0%, var(--bg) 60%)" }}>
      <button onClick={onBack} style={{
        background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12,
        width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--ink)"
      }}><IconBack size={18}/></button>

      <div style={{ marginTop: 30 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px",
          background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 100,
          fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 14 }}>
          <IconLock size={11} stroke="var(--brand)"/> เข้าสู่ระบบในฐานะ {roleLabel}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>
          ยินดีต้อนรับ{role === "owner" ? "" : "กลับ"}<br/>
          <span style={{ color: "var(--brand)" }}>เข้าสู่ระบบ</span>
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8 }}>
          กรอกชื่อผู้ใช้และรหัสผ่านที่ได้รับจากแอดมิน
        </div>
      </div>

      <div className={err ? "shake" : ""} style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Username */}
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>ชื่อผู้ใช้</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            background: "var(--surface)", border: `1.5px solid ${err ? "var(--danger)" : "var(--line)"}`,
            borderRadius: 14 }}>
            <IconUser size={18} stroke="var(--ink-3)"/>
            <input value={u} onChange={e => setU(e.target.value)} placeholder="เช่น admin"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)" }}/>
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>รหัสผ่าน</div>
            <a style={{ fontSize: 11.5, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>ลืมรหัสผ่าน?</a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            background: "var(--surface)", border: `1.5px solid ${err ? "var(--danger)" : "var(--line)"}`,
            borderRadius: 14 }}>
            <IconLock size={18} stroke="var(--ink-3)"/>
            <input value={p} onChange={e => setP(e.target.value)} type={show ? "text" : "password"}
              placeholder="••••••••" onKeyDown={e => e.key === "Enter" && submit()}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, color: "var(--ink)", letterSpacing: show ? 0 : 2 }}/>
            <button onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--ink-3)", fontSize: 11.5, fontWeight: 600 }}>
              {show ? "ซ่อน" : "แสดง"}
            </button>
          </div>
          {err && <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <IconX size={12} stroke="var(--danger)"/> ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
          </div>}
        </div>

        {/* Remember */}
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 2 }}>
          <div onClick={() => setRemember(!remember)} style={{
            width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${remember ? "var(--brand)" : "var(--line-2)"}`,
            background: remember ? "var(--brand)" : "var(--surface)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {remember && <IconCheck size={14} stroke="white" strokeWidth={2.5}/>}
          </div>
          <span style={{ fontSize: 13, color: "var(--ink-2)" }}>จดจำฉันไว้ในอุปกรณ์นี้</span>
        </label>
      </div>

      {/* Submit */}
      <button onClick={submit} className="lift" style={{
        marginTop: 22, padding: "15px 0", borderRadius: 16, border: "none", cursor: "pointer",
        background: "var(--ink)", color: "white", fontSize: 15, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}>
        เข้าสู่ระบบ <IconArrowRight size={16} stroke="white"/>
      </button>

      <div style={{ flex: 1 }}/>

      <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--ink-3)", padding: "12px 0" }}>
        เป็นครั้งแรก? <span style={{ color: "var(--brand)", fontWeight: 700, cursor: "pointer" }}>ติดต่อแอดมินเพื่อขอบัญชี</span>
      </div>

      {/* Hint card */}
      <div style={{ background: "var(--surface)", border: "1px dashed var(--line-2)", borderRadius: 12,
        padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <IconSparkle size={14} stroke="var(--brand)"/>
        <div style={{ flex: 1, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>
          ทดลองใช้งาน:<br/>
          <span className="num" style={{ color: "var(--ink)", fontWeight: 600 }}>
            {role === "owner" ? "admin / admin1234" : "T2 / tenant"}
          </span>
        </div>
      </div>
    </div>
  );
}

window.MobileFrames = { Phone, LoginScreen, PinScreen, LoginFormScreen };
