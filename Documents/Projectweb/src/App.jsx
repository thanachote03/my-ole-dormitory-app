import { useState } from "react";

const DEFAULT_PIN = "123456";
const AMENITY_OPTIONS = ["แอร์", "ตู้เย็น", "Wi-Fi", "ระเบียง", "ครัว", "เครื่องซัก", "เคเบิล TV", "ตู้เสื้อผ้า"];

const INIT_ROOMS = [
  { id: "A101", floor: 1, type: "เดี่ยว", price: 3500, amenities: ["แอร์", "ตู้เย็น", "Wi-Fi"], status: "ไม่ว่าง" },
  { id: "A201", floor: 2, type: "คู่", price: 5000, amenities: ["แอร์", "ตู้เย็น", "Wi-Fi", "ระเบียง"], status: "ว่าง" },
  { id: "B101", floor: 1, type: "เดี่ยว", price: 4000, amenities: ["แอร์", "ตู้เย็น", "Wi-Fi"], status: "ไม่ว่าง" },
  { id: "B201", floor: 2, type: "คู่", price: 5500, amenities: ["แอร์", "ตู้เย็น", "Wi-Fi", "ระเบียง"], status: "ว่าง" },
];

const INIT_TENANTS = [
  { id: "T001", name: "นายสมชาย ใจดี", phone: "081-234-5678", room: "A101", since: "ม.ค. 2026", paid: true },
  { id: "T002", name: "นางสาวมาลี สุขใจ", phone: "089-876-5432", room: "B101", since: "มี.ค. 2026", paid: false },
];

const INIT_REPAIRS = [
  { id: 1, room: "A101", issue: "แอร์ไม่เย็น", date: "17 พ.ค. 2026", status: "กำลังดำเนินการ", priority: "สูง" },
  { id: 2, room: "B101", issue: "ก๊อกน้ำรั่ว", date: "15 พ.ค. 2026", status: "เสร็จแล้ว", priority: "ปกติ" },
];

const PAYMENT_HISTORY = {
  "A101": [
    { id: 1, month: "มิ.ย. 2026", amount: 3500, status: "รอชำระ", due: "5 มิ.ย. 2026" },
    { id: 2, month: "พ.ค. 2026", amount: 3500, status: "ชำระแล้ว", due: "5 พ.ค. 2026" },
    { id: 3, month: "เม.ย. 2026", amount: 3500, status: "ชำระแล้ว", due: "5 เม.ย. 2026" },
  ],
  "B101": [
    { id: 1, month: "มิ.ย. 2026", amount: 4000, status: "รอชำระ", due: "5 มิ.ย. 2026" },
    { id: 2, month: "พ.ค. 2026", amount: 4000, status: "ชำระแล้ว", due: "5 พ.ค. 2026" },
  ],
};

export default function DormApp() {
  const [ownerPin, setOwnerPin] = useState(DEFAULT_PIN);
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("payment");
  const [rooms, setRooms] = useState(INIT_ROOMS);
  const [tenants, setTenants] = useState(INIT_TENANTS);
  const [repairs, setRepairs] = useState(INIT_REPAIRS);

  // PIN
  const [pinScreen, setPinScreen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [changePinModal, setChangePinModal] = useState(false);
  const [pinStep, setPinStep] = useState("current"); // current | new | confirm
  const [pinCurrent, setPinCurrent] = useState("");
  const [pinNew, setPinNew] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  // Tenant
  const [selectedPayRoom, setSelectedPayRoom] = useState("");
  const [payModal, setPayModal] = useState(null);
  const [repairModal, setRepairModal] = useState(false);
  const [repairForm, setRepairForm] = useState({ room: "", issue: "" });

  // Owner - rooms
  const [addRoomModal, setAddRoomModal] = useState(false);
  const [editRoomModal, setEditRoomModal] = useState(null); // room object
  const [roomForm, setRoomForm] = useState({ id: "", floor: "", type: "เดี่ยว", price: "", amenities: [], status: "ว่าง" });
  const [editRoomForm, setEditRoomForm] = useState(null);

  // Owner - tenants
  const [addTenantModal, setAddTenantModal] = useState(false);
  const [viewTenantModal, setViewTenantModal] = useState(null); // tenant object
  const [editTenantForm, setEditTenantForm] = useState(null);
  const [tenantForm, setTenantForm] = useState({ name: "", phone: "", room: "", since: "มิ.ย. 2026" });

  const [successMsg, setSuccessMsg] = useState("");
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3000); };

  // ── PIN login ──
  const handlePinPress = (digit) => {
    if (pinInput.length >= 6) return;
    const next = pinInput + digit;
    setPinInput(next);
    if (next.length === 6) {
      setTimeout(() => {
        if (next === ownerPin) {
          setRole("owner"); setTab("tenants");
          setPinScreen(false); setPinInput(""); setPinError(false);
        } else {
          setPinError(true);
          setTimeout(() => { setPinInput(""); setPinError(false); }, 900);
        }
      }, 200);
    }
  };
  const handlePinDelete = () => setPinInput(p => p.slice(0, -1));

  // ── Change PIN ──
  const handleChangePinPress = (digit) => {
    if (pinStep === "current") {
      const next = pinCurrent + digit;
      if (next.length > 6) return;
      setPinCurrent(next);
      if (next.length === 6) {
        setTimeout(() => {
          if (next === ownerPin) { setPinStep("new"); setPinCurrent(""); setPinChangeError(""); }
          else { setPinChangeError("รหัสปัจจุบันไม่ถูกต้อง"); setTimeout(() => { setPinCurrent(""); setPinChangeError(""); }, 900); }
        }, 200);
      }
    } else if (pinStep === "new") {
      const next = pinNew + digit;
      if (next.length > 6) return;
      setPinNew(next);
      if (next.length === 6) { setTimeout(() => { setPinStep("confirm"); setPinNew(next); }, 200); }
      else setPinNew(next);
    } else {
      const next = pinConfirm + digit;
      if (next.length > 6) return;
      setPinConfirm(next);
      if (next.length === 6) {
        setTimeout(() => {
          if (next === pinNew) {
            setOwnerPin(pinNew); setChangePinModal(false);
            setPinStep("current"); setPinCurrent(""); setPinNew(""); setPinConfirm(""); setPinChangeError("");
            showSuccess("เปลี่ยนรหัสผ่านสำเร็จ! 🔐");
          } else {
            setPinChangeError("รหัสไม่ตรงกัน กรุณาลองใหม่");
            setTimeout(() => { setPinConfirm(""); setPinStep("new"); setPinNew(""); setPinChangeError(""); }, 900);
          }
        }, 200);
      } else setPinConfirm(next);
    }
  };
  const handleChangePinDelete = () => {
    if (pinStep === "current") setPinCurrent(p => p.slice(0, -1));
    else if (pinStep === "new") setPinNew(p => p.slice(0, -1));
    else setPinConfirm(p => p.slice(0, -1));
  };
  const currentChangePinValue = pinStep === "current" ? pinCurrent : pinStep === "new" ? pinNew : pinConfirm;
  const changePinTitle = pinStep === "current" ? "ใส่รหัสปัจจุบัน" : pinStep === "new" ? "ตั้งรหัสใหม่ (6 หลัก)" : "ยืนยันรหัสใหม่";

  // ── Room handlers ──
  const toggleAmenity = (a, form, setForm) => setForm(f => ({
    ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a]
  }));

  const handleAddRoom = () => {
    if (!roomForm.id || !roomForm.price || !roomForm.floor) { showSuccess("❌ กรุณากรอกข้อมูลที่จำเป็น"); return; }
    if (rooms.find(r => r.id === roomForm.id)) { showSuccess("❌ หมายเลขห้องนี้มีอยู่แล้ว"); return; }
    setRooms(r => [...r, { ...roomForm, price: Number(roomForm.price), floor: Number(roomForm.floor) }]);
    setRoomForm({ id: "", floor: "", type: "เดี่ยว", price: "", amenities: [], status: "ว่าง" });
    setAddRoomModal(false);
    showSuccess(`เพิ่มห้อง ${roomForm.id} สำเร็จ! 🏢`);
  };

  const handleSaveRoom = () => {
    if (!editRoomForm.price || !editRoomForm.floor) { showSuccess("❌ กรุณากรอกข้อมูลที่จำเป็น"); return; }
    setRooms(r => r.map(rm => rm.id === editRoomForm.id ? { ...editRoomForm, price: Number(editRoomForm.price), floor: Number(editRoomForm.floor) } : rm));
    setEditRoomModal(null); setEditRoomForm(null);
    showSuccess("บันทึกข้อมูลห้องสำเร็จ ✓");
  };

  const handleDeleteRoom = (id) => {
    setRooms(r => r.filter(rm => rm.id !== id));
    setEditRoomModal(null); setEditRoomForm(null);
    showSuccess(`ลบห้อง ${id} แล้ว`);
  };

  // ── Tenant handlers ──
  const handleAddTenant = () => {
    if (!tenantForm.name || !tenantForm.phone || !tenantForm.room) { showSuccess("❌ กรุณากรอกข้อมูลที่จำเป็น"); return; }
    setTenants(t => [...t, { id: `T${Date.now()}`, ...tenantForm, paid: false }]);
    setRooms(r => r.map(rm => rm.id === tenantForm.room ? { ...rm, status: "ไม่ว่าง" } : rm));
    setTenantForm({ name: "", phone: "", room: "", since: "มิ.ย. 2026" });
    setAddTenantModal(false);
    showSuccess(`เพิ่มผู้เช่า ${tenantForm.name} สำเร็จ! 👤`);
  };

  const handleSaveTenant = () => {
    setTenants(t => t.map(tn => tn.id === editTenantForm.id ? editTenantForm : tn));
    setViewTenantModal(editTenantForm);
    setEditTenantForm(null);
    showSuccess("บันทึกข้อมูลผู้เช่าสำเร็จ ✓");
  };

  const handleDeleteTenant = (tid, roomId) => {
    setTenants(t => t.filter(tn => tn.id !== tid));
    setRooms(r => r.map(rm => rm.id === roomId ? { ...rm, status: "ว่าง" } : rm));
    setViewTenantModal(null); setEditTenantForm(null);
    showSuccess("ลบข้อมูลผู้เช่าแล้ว");
  };

  const handleTogglePaid = (tid) => {
    setTenants(t => t.map(tn => tn.id === tid ? { ...tn, paid: !tn.paid } : tn));
    if (viewTenantModal?.id === tid) setViewTenantModal(v => ({ ...v, paid: !v.paid }));
  };

  const handleRepairStatus = (id) => {
    setRepairs(r => r.map(rp => rp.id === id
      ? { ...rp, status: rp.status === "รอดำเนินการ" ? "กำลังดำเนินการ" : "เสร็จแล้ว" } : rp));
    showSuccess("อัปเดตสถานะเรียบร้อย ✓");
  };

  const handleAddRepair = () => {
    if (!repairForm.room || !repairForm.issue) return;
    setRepairs(r => [...r, { id: Date.now(), ...repairForm, date: "20 พ.ค. 2026", status: "รอดำเนินการ", priority: "ปกติ" }]);
    setRepairForm({ room: "", issue: "" }); setRepairModal(false);
    showSuccess("แจ้งซ่อมสำเร็จ! 🔧");
  };

  const availableRooms = rooms.filter(r => r.status === "ว่าง");
  const occupiedRooms = rooms.filter(r => r.status === "ไม่ว่าง");
  const roomPayments = selectedPayRoom ? (PAYMENT_HISTORY[selectedPayRoom] || []) : [];
  const pendingPayment = roomPayments.find(p => p.status === "รอชำระ");

  // ─────────────── LOGIN ───────────────
  if (!role && !pinScreen) return (
    <Wrap>
      <div style={s.loginBg}>
        <div style={s.glow} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "56px 24px 40px" }}>
          <div style={s.logoCircle}>🏢</div>
          <h1 style={s.appTitle}>Dormitory</h1>
          <p style={s.appSub}>ระบบจัดการหอพักออนไลน์</p>
          <div style={{ marginTop: 52 }}>
            <p style={s.loginLabel}>เข้าสู่ระบบในฐานะ</p>
            <button style={s.roleBtn} onClick={() => { setRole("tenant"); setTab("payment"); }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div><div style={s.roleBtnTitle}>ผู้เช่า</div><div style={s.roleBtnSub}>ชำระค่าเช่าและแจ้งซ่อม</div></div>
            </button>
            <button style={{ ...s.roleBtn, background: "rgba(255,255,255,0.08)" }} onClick={() => setPinScreen(true)}>
              <span style={{ fontSize: 28 }}>🏠</span>
              <div><div style={s.roleBtnTitle}>เจ้าของ / ผู้จัดการ</div><div style={s.roleBtnSub}>จัดการห้องและผู้เช่า</div></div>
            </button>
          </div>
        </div>
      </div>
    </Wrap>
  );

  // ─────────────── PIN SCREEN ───────────────
  if (pinScreen) return (
    <Wrap>
      <div style={s.pinBg}>
        <div style={s.glow} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 32px 40px" }}>
          <div style={s.logoCircle}>🔐</div>
          <h2 style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 6 }}>ใส่รหัสผ่าน</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 36 }}>สำหรับเจ้าของ / ผู้จัดการ (6 หลัก)</p>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: pinError ? "#ef4444" : i < pinInput.length ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.2s", transform: pinError ? "scale(1.3)" : "scale(1)" }} />
            ))}
          </div>
          {pinError && <div style={{ color: "#fca5a5", fontSize: 13, marginBottom: 4 }}>รหัสไม่ถูกต้อง</div>}
          <div style={{ height: 24 }} />
          <Numpad onPress={handlePinPress} onDelete={handlePinDelete} />
          <button style={s.pinBack} onClick={() => { setPinScreen(false); setPinInput(""); setPinError(false); }}>← กลับ</button>
        </div>
      </div>
    </Wrap>
  );

  const tenantTabs = [{ id: "payment", label: "ชำระเงิน", icon: "💳" }, { id: "repair", label: "แจ้งซ่อม", icon: "🔧" }];
  const ownerTabs = [{ id: "tenants", label: "ผู้เช่า", icon: "👥" }, { id: "rooms", label: "ห้องพัก", icon: "🏢" }, { id: "repairs", label: "ซ่อมบำรุง", icon: "🔧" }];
  const tabs = role === "tenant" ? tenantTabs : ownerTabs;

  return (
    <Wrap>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>{role === "tenant" ? "👤 ระบบผู้เช่า" : "🏢 Dormitory Admin"}</div>
          <div style={s.headerSub}>{role === "tenant" ? "ชำระค่าเช่าและแจ้งซ่อม" : "หอพักสุขใจ"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {role === "owner" && (
            <button style={{ ...s.logoutBtn, fontSize: 11, padding: "6px 10px" }} onClick={() => {
              setPinStep("current"); setPinCurrent(""); setPinNew(""); setPinConfirm(""); setPinChangeError("");
              setChangePinModal(true);
            }}>🔐 แก้ไข PIN</button>
          )}
          <button style={s.logoutBtn} onClick={() => { setRole(null); setPinInput(""); }}>ออก</button>
        </div>
      </div>

      {successMsg && <div style={s.toast}>{successMsg}</div>}

      <div style={s.content}>

        {/* ──── TENANT: PAYMENT ──── */}
        {tab === "payment" && role === "tenant" && (
          <div>
            <div style={s.secTitle}>ชำระค่าเช่า</div>
            <div style={s.roomSelectBox}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>เลือกห้องพักของคุณ</div>
              <select style={s.selectInput} value={selectedPayRoom} onChange={e => setSelectedPayRoom(e.target.value)}>
                <option value="">-- เลือกหมายเลขห้อง --</option>
                {occupiedRooms.map(r => (
                  <option key={r.id} value={r.id}>ห้อง {r.id}</option>
                ))}
              </select>
            </div>
            {!selectedPayRoom && (
              <div style={s.emptyPay}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>กรุณาเลือกห้องพักก่อน</div>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>เพื่อดูประวัติและชำระค่าเช่า</div>
              </div>
            )}
            {selectedPayRoom && (
              <>
                {pendingPayment ? (
                  <div style={s.balCard}>
                    <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>ยอดค้างชำระ · ห้อง {selectedPayRoom}</div>
                    <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 4 }}>฿{pendingPayment.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>กำหนดชำระ: {pendingPayment.due}</div>
                    <button style={s.payNowBtn} onClick={() => setPayModal(pendingPayment)}>ชำระเงินเลย →</button>
                  </div>
                ) : (
                  <div style={{ ...s.balCard, background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
                    <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>ห้อง {selectedPayRoom}</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>✅ ชำระครบแล้วในเดือนนี้</div>
                  </div>
                )}
                <div style={s.secTitle}>ประวัติการชำระ</div>
                {roomPayments.length === 0 && <Empty msg="ยังไม่มีประวัติ" />}
                {roomPayments.map(p => (
                  <div key={p.id} style={s.payRow}>
                    <div>
                      <div style={s.cardTitle}>{p.month}</div>
                      <div style={s.cardSub}>ครบกำหนด {p.due}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>฿{p.amount.toLocaleString()}</div>
                      <div style={p.status === "ชำระแล้ว" ? s.done : s.pend}>{p.status === "ชำระแล้ว" ? "✓ " : "⏳ "}{p.status}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ──── TENANT: REPAIR ──── */}
        {tab === "repair" && role === "tenant" && (
          <div>
            <div style={s.secTitle}>แจ้งซ่อมบำรุง</div>
            <button style={s.bigBtn} onClick={() => setRepairModal(true)}>+ แจ้งซ่อมใหม่</button>
            {repairs.map(r => (
              <div key={r.id} style={s.repCard}>
                <div style={s.row}><span style={s.roomLabel}>ห้อง {r.room}</span><span style={r.status === "เสร็จแล้ว" ? s.repD : r.status === "กำลังดำเนินการ" ? s.repP : s.repW}>{r.status}</span></div>
                <div style={s.cardTitle}>{r.issue}</div>
                <div style={s.cardSub}>แจ้งเมื่อ {r.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* ──── OWNER: TENANTS ──── */}
        {tab === "tenants" && role === "owner" && (
          <div>
            <div style={s.row}>
              <div style={s.secTitle}>รายชื่อผู้เช่า</div>
              <button style={s.addBtn} onClick={() => setAddTenantModal(true)}>+ เพิ่มผู้เช่า</button>
            </div>
            <div style={s.statsRow}>
              <Stat num={tenants.length} label="ทั้งหมด" />
              <Stat num={tenants.filter(t => t.paid).length} label="ชำระแล้ว" color="#22c55e" />
              <Stat num={tenants.filter(t => !t.paid).length} label="ค้างชำระ" color="#ef4444" />
            </div>
            {tenants.length === 0 && <Empty msg={"ยังไม่มีผู้เช่า\nกด '+ เพิ่มผู้เช่า'"} />}
            {tenants.map(t => (
              <div key={t.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => setViewTenantModal(t)}>
                <div style={s.roomBadgeLarge}>
                  <div style={s.roomBadgeNum}>{t.room}</div>
                  <div style={s.roomBadgeLbl}>ห้อง</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.cardTitle}>{t.name}</div>
                  <div style={s.cardSub}>📞 {t.phone}</div>
                  <div style={s.cardSub}>📅 ตั้งแต่ {t.since}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div style={t.paid ? s.done : s.pend}>{t.paid ? "✓ ชำระแล้ว" : "⏳ ค้างชำระ"}</div>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>แตะเพื่อดู ›</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ──── OWNER: ROOMS ──── */}
        {tab === "rooms" && role === "owner" && (
          <div>
            <div style={s.row}>
              <div style={s.secTitle}>ห้องพักทั้งหมด</div>
              <button style={s.addBtn} onClick={() => setAddRoomModal(true)}>+ เพิ่มห้อง</button>
            </div>
            <div style={s.statsRow}>
              <Stat num={rooms.length} label="ทั้งหมด" />
              <Stat num={availableRooms.length} label="ว่าง" color="#22c55e" />
              <Stat num={"฿" + rooms.filter(r => r.status === "ไม่ว่าง").reduce((a, r) => a + r.price, 0).toLocaleString()} label="รายได้/เดือน" />
            </div>
            {rooms.length === 0 && <Empty msg={"ยังไม่มีห้องพัก\nกด '+ เพิ่มห้อง'"} />}
            {rooms.map(room => {
              const tenant = tenants.find(t => t.room === room.id);
              return (
                <div key={room.id} style={{ ...s.roomCard, cursor: "pointer" }} onClick={() => { setEditRoomModal(room); setEditRoomForm({ ...room }); }}>
                  <div style={s.roomLeft}>
                    <div style={s.roomNumBox}><div style={s.roomNumText}>{room.id}</div><div style={s.roomNumFloor}>ชั้น {room.floor}</div></div>
                    <div>
                      <div style={s.cardTitle}>{room.type}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#4f46e5", marginTop: 2 }}>฿{room.price.toLocaleString()}/เดือน</div>
                      {tenant ? <div style={s.tenantChip}>👤 {tenant.name}</div> : <div style={s.emptyChip}>ว่าง — ยังไม่มีผู้เช่า</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <div style={room.status === "ว่าง" ? s.avail : s.full}>{room.status}</div>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>แตะเพื่อแก้ไข ›</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ──── OWNER: REPAIRS ──── */}
        {tab === "repairs" && role === "owner" && (
          <div>
            <div style={s.secTitle}>รายการแจ้งซ่อม</div>
            {repairs.length === 0 && <Empty msg="ไม่มีรายการซ่อม" />}
            {repairs.map(r => (
              <div key={r.id} style={s.repCard}>
                <div style={s.row}><span style={s.roomLabel}>ห้อง {r.room}</span><span style={r.priority === "สูง" ? s.prioH : r.priority === "ปกติ" ? s.prioM : s.prioL}>{r.priority}</span></div>
                <div style={s.cardTitle}>{r.issue}</div>
                <div style={s.cardSub}>แจ้งเมื่อ {r.date}</div>
                <div style={{ ...s.row, marginTop: 8 }}>
                  <span style={r.status === "เสร็จแล้ว" ? s.repD : r.status === "กำลังดำเนินการ" ? s.repP : s.repW}>{r.status}</span>
                  {r.status !== "เสร็จแล้ว" && <button style={s.updateBtn} onClick={() => handleRepairStatus(r.id)}>{r.status === "รอดำเนินการ" ? "เริ่มดำเนินการ" : "ทำเสร็จแล้ว"}</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={s.nav}>
        {tabs.map(t => (
          <button key={t.id} style={s.navBtn} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: tab === t.id ? "#6366f1" : "#94a3b8", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ MODAL: VIEW/EDIT TENANT ══ */}
      {viewTenantModal && !editTenantForm && (
        <Overlay onClick={() => setViewTenantModal(null)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <h2 style={s.mTitle}>👤 ข้อมูลผู้เช่า</h2>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ ...s.roomBadgeLarge, width: 64, height: 64, fontSize: 16, borderRadius: 18 }}>
                <div style={{ ...s.roomBadgeNum, fontSize: 16 }}>{viewTenantModal.room}</div>
                <div style={s.roomBadgeLbl}>ห้อง</div>
              </div>
            </div>
            {[["ชื่อ-นามสกุล", viewTenantModal.name], ["เบอร์โทร", viewTenantModal.phone], ["ห้อง", viewTenantModal.room], ["เริ่มเช่า", viewTenantModal.since]].map(([k, v]) => (
              <div key={k} style={s.confRow}><span style={{ color: "#94a3b8" }}>{k}</span><strong>{v}</strong></div>
            ))}
            <div style={s.confRow}>
              <span style={{ color: "#94a3b8" }}>สถานะชำระ</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={viewTenantModal.paid ? s.done : s.pend}>{viewTenantModal.paid ? "✓ ชำระแล้ว" : "⏳ ค้างชำระ"}</span>
                <button style={s.smallBtn} onClick={() => handleTogglePaid(viewTenantModal.id)}>สลับ</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ ...s.primBtn, margin: 0, flex: 1 }} onClick={() => setEditTenantForm({ ...viewTenantModal })}>✏️ แก้ไข</button>
              <button style={{ ...s.primBtn, margin: 0, flex: 1, background: "linear-gradient(135deg,#ef4444,#dc2626)" }}
                onClick={() => handleDeleteTenant(viewTenantModal.id, viewTenantModal.room)}>🗑️ ลบ</button>
            </div>
            <button style={{ ...s.secBtn, marginTop: 8 }} onClick={() => setViewTenantModal(null)}>ปิด</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: EDIT TENANT FORM ══ */}
      {editTenantForm && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>✏️ แก้ไขข้อมูลผู้เช่า</h2>
            <Label>ชื่อ-นามสกุล</Label>
            <input style={s.inp} value={editTenantForm.name} onChange={e => setEditTenantForm(f => ({ ...f, name: e.target.value }))} />
            <Label>เบอร์โทรศัพท์</Label>
            <input style={s.inp} value={editTenantForm.phone} onChange={e => setEditTenantForm(f => ({ ...f, phone: e.target.value }))} />
            <Label>หมายเลขห้อง</Label>
            <input style={s.inp} value={editTenantForm.room} onChange={e => setEditTenantForm(f => ({ ...f, room: e.target.value }))} />
            <Label>วันที่เริ่มเช่า</Label>
            <input style={s.inp} value={editTenantForm.since} onChange={e => setEditTenantForm(f => ({ ...f, since: e.target.value }))} />
            <button style={s.primBtn} onClick={handleSaveTenant}>บันทึก</button>
            <button style={s.secBtn} onClick={() => setEditTenantForm(null)}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: ADD TENANT ══ */}
      {addTenantModal && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>👤 เพิ่มผู้เช่าใหม่</h2>
            <Label>ชื่อ-นามสกุล *</Label>
            <input style={s.inp} placeholder="เช่น นายสมหมาย ดีใจ" value={tenantForm.name} onChange={e => setTenantForm(f => ({ ...f, name: e.target.value }))} />
            <Label>เบอร์โทรศัพท์ *</Label>
            <input style={s.inp} placeholder="08X-XXX-XXXX" value={tenantForm.phone} onChange={e => setTenantForm(f => ({ ...f, phone: e.target.value }))} />
            <Label>เลือกห้อง *</Label>
            <select style={s.inp} value={tenantForm.room} onChange={e => setTenantForm(f => ({ ...f, room: e.target.value }))}>
              <option value="">-- เลือกห้องว่าง --</option>
              {availableRooms.map(r => <option key={r.id} value={r.id}>ห้อง {r.id} ({r.type}) ฿{r.price.toLocaleString()}/เดือน</option>)}
            </select>
            {availableRooms.length === 0 && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>⚠️ ไม่มีห้องว่าง</div>}
            <Label>วันที่เริ่มเช่า</Label>
            <input style={s.inp} placeholder="มิ.ย. 2026" value={tenantForm.since} onChange={e => setTenantForm(f => ({ ...f, since: e.target.value }))} />
            <button style={s.primBtn} onClick={handleAddTenant}>บันทึกผู้เช่า</button>
            <button style={s.secBtn} onClick={() => setAddTenantModal(false)}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: EDIT ROOM ══ */}
      {editRoomModal && editRoomForm && (
        <Overlay onClick={() => { setEditRoomModal(null); setEditRoomForm(null); }}>
          <Sheet onClick={e => e.stopPropagation()}>
            <h2 style={s.mTitle}>✏️ แก้ไขห้อง {editRoomModal.id}</h2>
            <Label>ชั้น</Label>
            <input style={s.inp} type="number" value={editRoomForm.floor} onChange={e => setEditRoomForm(f => ({ ...f, floor: e.target.value }))} />
            <Label>ประเภทห้อง</Label>
            <div style={s.segRow}>
              {["เดี่ยว", "คู่"].map(t => (
                <button key={t} style={editRoomForm.type === t ? s.segOn : s.segOff} onClick={() => setEditRoomForm(f => ({ ...f, type: t }))}>{t}</button>
              ))}
            </div>
            <Label>ราคาค่าเช่า/เดือน (บาท)</Label>
            <input style={s.inp} type="number" value={editRoomForm.price} onChange={e => setEditRoomForm(f => ({ ...f, price: e.target.value }))} />
            <Label>สิ่งอำนวยความสะดวก</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {AMENITY_OPTIONS.map(a => (
                <button key={a} style={editRoomForm.amenities.includes(a) ? s.aOn : s.aOff} onClick={() => toggleAmenity(a, editRoomForm, setEditRoomForm)}>{a}</button>
              ))}
            </div>
            <Label>สถานะ</Label>
            <div style={s.segRow}>
              {["ว่าง", "ไม่ว่าง"].map(st => (
                <button key={st} style={editRoomForm.status === st ? s.segOn : s.segOff} onClick={() => setEditRoomForm(f => ({ ...f, status: st }))}>{st}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={{ ...s.primBtn, margin: 0, flex: 1 }} onClick={handleSaveRoom}>💾 บันทึก</button>
              <button style={{ ...s.primBtn, margin: 0, flex: 1, background: "linear-gradient(135deg,#ef4444,#dc2626)" }} onClick={() => handleDeleteRoom(editRoomModal.id)}>🗑️ ลบห้อง</button>
            </div>
            <button style={{ ...s.secBtn, marginTop: 8 }} onClick={() => { setEditRoomModal(null); setEditRoomForm(null); }}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: ADD ROOM ══ */}
      {addRoomModal && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>🏢 เพิ่มห้องพักใหม่</h2>
            <Label>หมายเลขห้อง *</Label>
            <input style={s.inp} placeholder="เช่น C101" value={roomForm.id} onChange={e => setRoomForm(f => ({ ...f, id: e.target.value }))} />
            <Label>ชั้น *</Label>
            <input style={s.inp} placeholder="1" type="number" value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} />
            <Label>ประเภทห้อง</Label>
            <div style={s.segRow}>
              {["เดี่ยว", "คู่"].map(t => (
                <button key={t} style={roomForm.type === t ? s.segOn : s.segOff} onClick={() => setRoomForm(f => ({ ...f, type: t }))}>{t}</button>
              ))}
            </div>
            <Label>ราคาค่าเช่า/เดือน (บาท) *</Label>
            <input style={s.inp} placeholder="3500" type="number" value={roomForm.price} onChange={e => setRoomForm(f => ({ ...f, price: e.target.value }))} />
            <Label>สิ่งอำนวยความสะดวก</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {AMENITY_OPTIONS.map(a => (
                <button key={a} style={roomForm.amenities.includes(a) ? s.aOn : s.aOff} onClick={() => toggleAmenity(a, roomForm, setRoomForm)}>{a}</button>
              ))}
            </div>
            <Label>สถานะเริ่มต้น</Label>
            <div style={s.segRow}>
              {["ว่าง", "ไม่ว่าง"].map(st => (
                <button key={st} style={roomForm.status === st ? s.segOn : s.segOff} onClick={() => setRoomForm(f => ({ ...f, status: st }))}>{st}</button>
              ))}
            </div>
            <button style={s.primBtn} onClick={handleAddRoom}>บันทึกห้องพัก</button>
            <button style={s.secBtn} onClick={() => setAddRoomModal(false)}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: CHANGE PIN ══ */}
      {changePinModal && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>🔐 เปลี่ยนรหัสผ่าน</h2>
            <div style={{ textAlign: "center", marginBottom: 6, fontSize: 14, color: "#64748b" }}>{changePinTitle}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 8 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < currentChangePinValue.length ? "#6366f1" : "#e2e8f0", transition: "all 0.15s" }} />
              ))}
            </div>
            {pinChangeError && <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginBottom: 8 }}>{pinChangeError}</div>}
            <div style={{ marginTop: 8 }}>
              <Numpad onPress={handleChangePinPress} onDelete={handleChangePinDelete} dark={false} />
            </div>
            <button style={{ ...s.secBtn, marginTop: 16 }} onClick={() => { setChangePinModal(false); setPinStep("current"); setPinCurrent(""); setPinNew(""); setPinConfirm(""); setPinChangeError(""); }}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: PAY ══ */}
      {payModal && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>ชำระค่าเช่า</h2>
            {[["เดือน", payModal.month], ["ห้อง", selectedPayRoom], ["จำนวน", `฿${payModal.amount.toLocaleString()}`]].map(([k, v]) => (
              <div key={k} style={s.confRow}><span>{k}</span><strong style={k === "จำนวน" ? { color: "#6366f1" } : {}}>{v}</strong></div>
            ))}
            <div style={{ marginTop: 12 }}>
              {["💳 บัตรเครดิต/เดบิต", "📱 พร้อมเพย์", "🏦 โอนผ่านธนาคาร"].map(m => (
                <div key={m} style={s.payMeth}>{m}</div>
              ))}
            </div>
            <button style={s.primBtn} onClick={() => { setPayModal(null); showSuccess("ชำระเงินสำเร็จ! ✓ ใบเสร็จส่งทาง Email แล้ว"); }}>ยืนยันชำระเงิน</button>
            <button style={s.secBtn} onClick={() => setPayModal(null)}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}

      {/* ══ MODAL: REPAIR ══ */}
      {repairModal && (
        <Overlay>
          <Sheet>
            <h2 style={s.mTitle}>แจ้งซ่อมใหม่</h2>
            <Label>หมายเลขห้อง</Label>
            <input style={s.inp} placeholder="เช่น A101" value={repairForm.room} onChange={e => setRepairForm(f => ({ ...f, room: e.target.value }))} />
            <Label>รายละเอียดปัญหา</Label>
            <textarea style={{ ...s.inp, height: 80, resize: "none" }} placeholder="อธิบายปัญหา..." value={repairForm.issue} onChange={e => setRepairForm(f => ({ ...f, issue: e.target.value }))} />
            <button style={s.primBtn} onClick={handleAddRepair}>ส่งคำขอซ่อม</button>
            <button style={s.secBtn} onClick={() => setRepairModal(false)}>ยกเลิก</button>
          </Sheet>
        </Overlay>
      )}
    </Wrap>
  );
}

// ─── Numpad component ───
function Numpad({ onPress, onDelete, dark = true }) {
  const btnStyle = {
    padding: "16px 0", borderRadius: 14,
    border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0",
    background: dark ? "rgba(255,255,255,0.1)" : "#f8fafc",
    fontSize: 20, fontWeight: 700,
    color: dark ? "#fff" : "#1e293b",
    cursor: "pointer", backdropFilter: dark ? "blur(8px)" : "none",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}>
      {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d, i) => (
        <button key={i}
          style={d === "" ? { background: "transparent", border: "none" } : btnStyle}
          onClick={() => d === "⌫" ? onDelete() : d !== "" ? onPress(String(d)) : null}
          disabled={d === ""}>
          {d}
        </button>
      ))}
    </div>
  );
}

// ─── Sub-components ───
const Wrap = ({ children }) => <div style={s.shell}><div style={s.screen}>{children}</div></div>;
const Overlay = ({ children, onClick }) => <div style={s.overlay} onClick={onClick}>{children}</div>;
const Sheet = ({ children, onClick }) => <div style={s.sheet} onClick={onClick}><div style={s.handle} />{children}</div>;
const Label = ({ children }) => <div style={s.lbl}>{children}</div>;
const Stat = ({ num, label, color }) => (
  <div style={s.statCard}><div style={{ ...s.statNum, ...(color ? { color } : {}) }}>{num}</div><div style={s.statLbl}>{label}</div></div>
);
const Empty = ({ msg }) => <div style={s.empty}>{msg}</div>;

const s = {
  shell: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", fontFamily: "'Sarabun','Noto Sans Thai',sans-serif" },
  screen: { width: 390, height: 844, background: "#f8fafc", borderRadius: 40, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", position: "relative" },
  loginBg: { flex: 1, background: "linear-gradient(160deg,#1e1b4b,#4f46e5 60%,#7c3aed)", minHeight: "100%", position: "relative", overflow: "hidden" },
  pinBg: { flex: 1, background: "linear-gradient(160deg,#0f172a,#1e1b4b 50%,#312e81)", minHeight: "100%", position: "relative", overflow: "hidden" },
  glow: { position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(167,139,250,0.15)", top: -100, right: -80, filter: "blur(60px)" },
  logoCircle: { width: 80, height: 80, borderRadius: 24, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto" },
  appTitle: { fontSize: 34, fontWeight: 800, color: "#fff", margin: "12px 0 6px" },
  appSub: { fontSize: 15, color: "rgba(255,255,255,0.65)", margin: 0 },
  loginLabel: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16 },
  roleBtn: { width: "100%", display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "16px 20px", marginBottom: 12, cursor: "pointer", textAlign: "left" },
  roleBtnTitle: { fontSize: 16, fontWeight: 700, color: "#fff" },
  roleBtnSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  pinBack: { marginTop: 28, background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer" },
  header: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "48px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 },
  headerTitle: { fontSize: 18, fontWeight: 700, color: "#fff" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  logoutBtn: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer" },
  toast: { position: "absolute", top: 100, left: 20, right: 20, zIndex: 100, background: "#22c55e", color: "#fff", borderRadius: 12, padding: "12px 16px", fontSize: 14, fontWeight: 600, textAlign: "center", boxShadow: "0 4px 20px rgba(34,197,94,0.4)" },
  content: { flex: 1, overflowY: "auto", padding: "16px 16px 8px" },
  secTitle: { fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 12 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: { background: "#4f46e5", color: "#fff", border: "none", borderRadius: 12, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  statsRow: { display: "flex", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, background: "#fff", borderRadius: 14, padding: "12px 10px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  statNum: { fontSize: 16, fontWeight: 800, color: "#1e293b" },
  statLbl: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  card: { background: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" },
  roomBadgeLarge: { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  roomBadgeNum: { fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1 },
  roomBadgeLbl: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#1e293b" },
  cardSub: { fontSize: 12, color: "#64748b", marginTop: 2 },
  smallBtn: { fontSize: 11, padding: "4px 10px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", color: "#475569" },
  done: { fontSize: 12, color: "#16a34a", fontWeight: 600 },
  pend: { fontSize: 12, color: "#d97706", fontWeight: 600 },
  roomCard: { background: "#fff", borderRadius: 16, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9" },
  roomLeft: { display: "flex", gap: 12, alignItems: "center" },
  roomNumBox: { width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  roomNumText: { fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1 },
  roomNumFloor: { fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  tenantChip: { marginTop: 4, fontSize: 11, color: "#4f46e5", fontWeight: 600, background: "#ede9fe", borderRadius: 8, padding: "2px 8px", display: "inline-block" },
  emptyChip: { marginTop: 4, fontSize: 11, color: "#16a34a", fontWeight: 600, background: "#f0fdf4", borderRadius: 8, padding: "2px 8px", display: "inline-block" },
  avail: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#f0fdf4", color: "#16a34a", fontWeight: 600, display: "inline-block" },
  full: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#fef2f2", color: "#dc2626", fontWeight: 600, display: "inline-block" },
  roomLabel: { fontSize: 13, fontWeight: 700, color: "#4f46e5" },
  repCard: { background: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  repD: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#f0fdf4", color: "#16a34a", fontWeight: 600 },
  repP: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#eff6ff", color: "#2563eb", fontWeight: 600 },
  repW: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#fef9c3", color: "#ca8a04", fontWeight: 600 },
  prioH: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#fee2e2", color: "#dc2626", fontWeight: 600 },
  prioM: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#fef3c7", color: "#d97706", fontWeight: 600 },
  prioL: { fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "#f0fdf4", color: "#16a34a", fontWeight: 600 },
  updateBtn: { fontSize: 12, padding: "5px 12px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 },
  roomSelectBox: { background: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" },
  selectInput: { width: "100%", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fafc", color: "#1e293b" },
  emptyPay: { textAlign: "center", padding: "48px 20px", color: "#94a3b8" },
  balCard: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 20, padding: 20, marginBottom: 14, color: "#fff" },
  payNowBtn: { background: "#fff", color: "#4f46e5", border: "none", padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  payRow: { background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" },
  payMeth: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", marginBottom: 8, fontSize: 14, cursor: "pointer", color: "#1e293b" },
  bigBtn: { width: "100%", padding: 14, background: "#4f46e5", color: "#fff", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 14 },
  empty: { textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: 14, lineHeight: 2, whiteSpace: "pre-line" },
  nav: { display: "flex", background: "#fff", borderTop: "1px solid #f1f5f9", flexShrink: 0, padding: "8px 0 24px" },
  navBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "8px 0", gap: 3 },
  overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 50 },
  sheet: { background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 24px 40px", width: "100%", maxHeight: "85%", overflowY: "auto" },
  handle: { width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 16px" },
  mTitle: { fontSize: 20, fontWeight: 800, color: "#1e293b", textAlign: "center", margin: "0 0 16px" },
  confRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 15, color: "#64748b" },
  lbl: { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, marginTop: 12 },
  inp: { width: "100%", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#f8fafc", color: "#1e293b" },
  segRow: { display: "flex", gap: 8, marginBottom: 4 },
  segOn: { flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #6366f1", background: "#6366f1", fontSize: 13, cursor: "pointer", color: "#fff", fontWeight: 700 },
  segOff: { flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, cursor: "pointer", color: "#64748b" },
  aOn: { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #6366f1", background: "#ede9fe", color: "#6366f1", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  aOff: { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", fontSize: 13, cursor: "pointer" },
  primBtn: { width: "100%", padding: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 16, marginBottom: 8 },
  secBtn: { width: "100%", padding: 12, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 14, fontSize: 15, cursor: "pointer" },
};
