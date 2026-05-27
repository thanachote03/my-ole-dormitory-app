// All owner modals (Add/Edit/Settings/RoomDetail/BulkMeter/MonthDetail/AddRoom/AddRepair)
// Ported faithfully from design-bundle/project/owner-desktop.jsx
import { useState, useEffect } from "react";
import { DI, amenityIcon } from "./icons";
import { MONTHS_TH, MONTHS_FULL, AMENITY_OPTS, CUR_Y, CUR_M, dl, baht, UTIL_RATE } from "./seed";
import { useData } from "./DataContext";

const {
  IconUsers, IconBuilding, IconLock, IconBell, IconSparkle, IconUser,
  IconCal, IconCard, IconWrench, IconSettings, IconDownload, IconFilter,
  IconCheck, IconX, IconArrowRight, IconArrowLeft, IconChevR, IconTrash,
  IconEdit, IconPhone, IconPlus,
} = DI;

// ─── Avatar ──────────────────────────────────────────────────────────────
export function Avatar({ name = "?", size = 36 }) {
  const colors = ["var(--brand)","var(--sage)","var(--lilac)","var(--warn)","var(--info)"];
  const hash = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  const bg = colors[hash % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: bg,
      color: "white", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>
      {name.charAt(0)}
    </div>
  );
}

export const detailBtn = (kind) => kind === "primary" ? ({
  padding: "9px 14px", background: "var(--ink)", color: "white", border: "none", borderRadius: 11,
  fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
}) : ({
  padding: "9px 14px", background: "var(--surface)", color: "var(--ink-2)", border: "1px solid var(--line)",
  borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
});

export function MiniStat2({ label, value, tone }) {
  const bg = { brand: "var(--brand-soft)", ok: "var(--ok-soft)", warn: "var(--warn-soft)", lilac: "var(--lilac-soft)" }[tone];
  const fg = { brand: "var(--brand-ink)", ok: "var(--ok)", warn: "var(--warn)", lilac: "var(--lilac)" }[tone];
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "11px 14px" }}>
      <div style={{ fontSize: 11.5, color: fg, opacity: 0.85, fontWeight: 600 }}>{label}</div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: fg, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function ModalShell({ onClose, width = 520, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(46, 32, 22, 0.42)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
      backdropFilter: "blur(3px)", padding: 24,
    }}
    onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="screen-in" style={{
        width, maxWidth: "100%", maxHeight: "92%", overflow: "auto",
        background: "var(--surface)", borderRadius: 20, border: "1px solid var(--line)",
        boxShadow: "0 30px 70px -20px rgba(46, 32, 22, 0.35)",
      }}>
        {children}
      </div>
    </div>
  );
}

export function AtField({ label, hint, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{label}</span>
        {hint && <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const atInputStyle = {
  width: "100%", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10,
  background: "var(--surface)", fontSize: 13.5, color: "var(--ink)", outline: "none",
  boxSizing: "border-box",
};

// ─── CSV helpers ─────────────────────────────────────────────────────────
export function downloadCsv(filename, rows) {
  const csv = "﻿" + rows.map(r => r.map(c => {
    const s = c == null ? "" : String(c);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// ─── ADD TENANT MODAL ────────────────────────────────────────────────────
export function AddTenantModal({ onClose, onSubmit, initialRoom }) {
  const { rooms, tenants } = useData();
  const todayIso = `${CUR_Y}-${String(CUR_M + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const vacant = rooms.filter(r => r.status === "ว่าง");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState(initialRoom || vacant[0]?.id || "");
  const [date, setDate] = useState(todayIso);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  // Personal info & docs
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardImage, setIdCardImage] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [docsOpen, setDocsOpen] = useState(false);
  // Initial meter readings — UI moved to the "ค่าน้ำค่าไฟ" page. Owner records
  // them on the first meter visit after creating the tenant; that page already
  // shows the "มิเตอร์เริ่มต้น" form whenever a room has no readings yet.
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState(null);

  const onIdCardPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) { alert("ไฟล์ใหญ่เกิน 6MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setIdCardImage(ev.target.result);
    reader.readAsDataURL(f);
  };

  const genPass = () => {
    const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let p = "";
    for (let i = 0; i < 8; i++) p += c.charAt(Math.floor(Math.random() * c.length));
    setPass(p); setPass2(p); setShowPass(true);
  };

  const errors = [];
  if (!name.trim()) errors.push("ชื่อ-นามสกุล");
  if (!phone.trim()) errors.push("เบอร์โทร");
  // room is optional — can be assigned later
  if (!date) errors.push("วันที่เข้าพัก");
  if (pass.length < 6) errors.push("รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)");
  if (pass && pass !== pass2) errors.push("รหัสผ่านไม่ตรงกัน");
  // Initial meter readings are optional — can be recorded later from the
  // meter page. If left blank, the first month's usage will baseline from 0
  // until the owner enters real numbers.

  const submit = async () => {
    if (errors.length || saving) return;
    setSaving(true);
    setSaveErr(null);
    const [y, m] = date.split("-").map(Number);
    const newId = "T" + (Math.max(0, ...tenants.map(t => parseInt(t.id.slice(1)) || 0)) + 1);
    try {
      const res = await onSubmit({
        id: newId, name: name.trim(), phone: phone.trim(), room,
        sinceY: y, sinceM: m - 1, moveInDate: date,
        username: username.trim() || room,
        password: pass,
        // Personal info & docs
        email: email.trim(),
        address: address.trim(),
        idCardNumber: idCardNumber.trim(),
        idCardImage,
        emergencyName: emergencyName.trim(),
        emergencyPhone: emergencyPhone.trim(),
      });
      if (res?.ok === false) {
        setSaveErr(res.msg || "บันทึกไม่สำเร็จ กรุณาลองใหม่");
        setSaving(false);
        return;
      }
    } catch (e) {
      setSaveErr("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <ModalShell onClose={onClose} width={560}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconUsers size={20} stroke="var(--brand)"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>เพิ่มผู้เช่าใหม่</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>กรอกข้อมูล จัดห้อง และตั้งรหัสผ่านสำหรับล็อกอินผู้เช่า</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <AtField label="ชื่อ-นามสกุล">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="เช่น สมศักดิ์ ใจดี" style={atInputStyle}/>
        </AtField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AtField label="เบอร์โทร">
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
          </AtField>
          <AtField label="วันที่เข้าพัก" hint="ใช้สำหรับเริ่มคิดค่าเช่า">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
          </AtField>
        </div>

        <AtField
          label="ห้องที่จะเข้าพัก"
          hint={vacant.length === 0
            ? "ไม่มีห้องว่างในขณะนี้ — สามารถเพิ่มผู้เช่าก่อนได้ กำหนดห้องทีหลัง"
            : `มี ${vacant.length} ห้องว่าง · กดห้องที่เลือกอีกครั้งเพื่อยกเลิก`}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {/* ตัวเลือก "ยังไม่กำหนดห้อง" */}
            <button onClick={() => setRoom("")} style={{
              padding: "10px 8px", borderRadius: 11, textAlign: "center",
              border: !room ? "1.5px solid var(--ink-3)" : "1px dashed var(--line)",
              background: !room ? "var(--surface-2)" : "transparent",
              cursor: "pointer",
            }}>
              <div style={{ fontSize: 18, lineHeight: 1, color: !room ? "var(--ink-2)" : "var(--ink-4)" }}>—</div>
              <div style={{ fontSize: 9.5, color: !room ? "var(--ink-2)" : "var(--ink-4)", marginTop: 3, fontWeight: !room ? 700 : 400 }}>
                ยังไม่กำหนด
              </div>
            </button>
            {[...rooms].sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map(r => {
              const occ = r.status === "ไม่ว่าง";
              const sel = room === r.id;
              return (
                <button key={r.id}
                  onClick={() => { if (!occ) setRoom(sel ? "" : r.id); }}
                  disabled={occ}
                  style={{
                    padding: "10px 8px", borderRadius: 11,
                    border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                    background: sel ? "var(--brand-soft)" : occ ? "var(--surface-2)" : "var(--surface)",
                    cursor: occ ? "not-allowed" : "pointer", opacity: occ ? 0.5 : 1, textAlign: "center",
                  }}>
                  <div className="num" style={{ fontSize: 13, fontWeight: 700, color: sel ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                    {occ ? "ไม่ว่าง" : baht(r.price)}
                  </div>
                </button>
              );
            })}
          </div>
          {!room && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-3)",
              background: "var(--surface-2)", borderRadius: 9, padding: "8px 12px",
              border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>ℹ️</span>
              <span>ผู้เช่าจะถูกเพิ่มเข้าระบบโดยยังไม่มีห้อง · สามารถกำหนดห้องได้ทีหลังผ่านหน้า <strong>แก้ไข</strong></span>
            </div>
          )}
        </AtField>

        {/* Personal info & documents (collapsible) */}
        <div style={{ background: "var(--surface-2)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden" }}>
          <button type="button" onClick={() => setDocsOpen(!docsOpen)} style={{
            width: "100%", padding: 14, background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          }}>
            <IconCard size={16} stroke="var(--ink-3)"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>ข้อมูลส่วนบุคคล & เอกสาร</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                {(address || idCardNumber || idCardImage || email || emergencyName)
                  ? `${idCardImage ? "✓ แนบรูปบัตร " : ""}${idCardNumber ? "· มีเลข ID " : ""}${address ? "· มีที่อยู่ " : ""}${emergencyName ? "· มีผู้ติดต่อฉุกเฉิน" : ""}`
                  : "ที่อยู่ · เลขบัตรประชาชน · รูปถ่ายบัตร · ผู้ติดต่อฉุกเฉิน (กดเพื่อกรอก)"}
              </div>
            </div>
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>{docsOpen ? "ซ่อน ▴" : "ขยาย ▾"}</span>
          </button>
          {docsOpen && (
            <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              <AtField label="ที่อยู่ตามทะเบียนบ้าน">
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  style={{ ...atInputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, background: "white" }}/>
              </AtField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AtField label="อีเมล">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white" }}/>
                </AtField>
                <AtField label="เลขบัตรประชาชน 13 หลัก">
                  <input value={idCardNumber} onChange={e => setIdCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 13))}
                    placeholder="1-2345-67890-12-3"
                    style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                </AtField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AtField label="ผู้ติดต่อฉุกเฉิน (ชื่อ)">
                  <input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white" }}/>
                </AtField>
                <AtField label="เบอร์ติดต่อฉุกเฉิน">
                  <input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                </AtField>
              </div>
              <AtField label="รูปถ่ายบัตรประชาชน" hint="JPG/PNG ไม่เกิน 6MB">
                {idCardImage ? (
                  <div style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <img src={idCardImage} alt="ID card"
                      style={{ width: 120, height: 75, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>✓ แนบรูปบัตรแล้ว</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>
                        คลิก "เปลี่ยนรูป" เพื่ออัปโหลดใหม่ หรือ "ลบรูป" เพื่อนำออก
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <label style={{ ...detailBtn("ghost"), fontSize: 11.5 }}>
                          เปลี่ยนรูป
                          <input type="file" accept="image/*" onChange={onIdCardPick} style={{ display: "none" }}/>
                        </label>
                        <button type="button" onClick={() => setIdCardImage("")} style={{ ...detailBtn("ghost"), fontSize: 11.5, color: "var(--danger)" }}>
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "24px 14px", border: "1.5px dashed var(--line-2)", borderRadius: 12, cursor: "pointer",
                    background: "white", color: "var(--ink-3)",
                  }}>
                    <div style={{ fontSize: 22 }}>📷</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>คลิกเพื่ออัปโหลดรูปบัตรประชาชน</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>หรือลากไฟล์มาวาง</div>
                    <input type="file" accept="image/*" onChange={onIdCardPick} style={{ display: "none" }}/>
                  </label>
                )}
              </AtField>
            </div>
          )}
        </div>

        {/* Initial meter readings — moved to the "ค่าน้ำค่าไฟ" page. When the
            new tenant is opened there, the meter page shows a "มิเตอร์เริ่มต้น
            ณ วันเข้าพัก" form because the room has no readings yet. */}
        <div style={{ background: "oklch(0.97 0.02 240)", borderRadius: 12, padding: "10px 14px",
          border: "1px solid oklch(0.88 0.04 240)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <div style={{ fontSize: 12, color: "oklch(0.35 0.08 240)", lineHeight: 1.5 }}>
            เลขมิเตอร์เริ่มต้น (น้ำ + ไฟ) จะกรอกที่หน้า <b>ค่าน้ำค่าไฟ</b> หลังบันทึกผู้เช่า —
            เลือกห้องของผู้เช่าใหม่ ระบบจะแสดงฟอร์ม "มิเตอร์เริ่มต้น" ให้กรอกอัตโนมัติ
          </div>
        </div>

        <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: 16, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>บัญชีล็อกอินสำหรับผู้เช่า</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ผู้เช่าจะใช้รหัสนี้ในการเข้าสู่ระบบครั้งแรก</div>
            </div>
            <button onClick={genPass} style={{ background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: 9, padding: "6px 10px", fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
              <IconSparkle size={12} stroke="var(--ink-2)"/> สุ่มรหัส
            </button>
          </div>
          <AtField label="ชื่อผู้ใช้ (Username)" hint="ปล่อยว่างเพื่อใช้เลขห้องเป็นชื่อผู้ใช้">
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder={room || "เลขห้อง หรือชื่อผู้ใช้"} style={atInputStyle}/>
          </AtField>
          <div style={{ height: 12 }}/>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <AtField label="รหัสผ่าน">
              <div style={{ position: "relative" }}>
                <input value={pass} onChange={e => setPass(e.target.value)}
                  type={showPass ? "text" : "password"} placeholder="อย่างน้อย 6 ตัวอักษร"
                  style={{ ...atInputStyle, paddingRight: 38, fontFamily: "var(--font-num)" }}/>
                <button onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 6, top: 6, width: 28, height: 28, border: "none",
                  background: "transparent", cursor: "pointer", color: "var(--ink-3)", fontSize: 11, fontWeight: 700,
                }}>{showPass ? "ซ่อน" : "ดู"}</button>
              </div>
            </AtField>
            <AtField label="ยืนยันรหัสผ่าน">
              <input value={pass2} onChange={e => setPass2(e.target.value)}
                type={showPass ? "text" : "password"} placeholder="พิมพ์รหัสอีกครั้ง"
                style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
            </AtField>
          </div>
          {pass.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--surface)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${Math.min(100, pass.length * 12)}%`,
                  background: pass.length < 6 ? "var(--warn)" : pass.length < 10 ? "oklch(0.75 0.13 80)" : "var(--ok)",
                  transition: "width 0.2s",
                }}/>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: pass.length < 6 ? "var(--warn)" : pass.length < 10 ? "var(--ink-2)" : "var(--ok)" }}>
                {pass.length < 6 ? "อ่อน" : pass.length < 10 ? "ปานกลาง" : "แข็งแรง"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "var(--surface-2)",
        display: "flex", flexDirection: "column", gap: 10, borderRadius: "0 0 20px 20px" }}>
        {saveErr && (
          <div style={{ background: "var(--danger-soft,#fff0f0)", border: "1px solid var(--danger,#e53935)",
            borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "var(--danger,#e53935)", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6 }}>
            ⚠️ {saveErr}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, fontSize: 11.5, color: errors.length ? "var(--warn)" : saving ? "var(--ink-3)" : saveErr ? "var(--danger,#e53935)" : "var(--ink-3)" }}>
            {errors.length ? `ต้องกรอก: ${errors.join(", ")}` : saving ? "กำลังบันทึก..." : "พร้อมบันทึก — ผู้เช่าจะได้รับ SMS แจ้งรหัสล็อกอิน"}
          </div>
          <button onClick={onClose} style={{ ...detailBtn("ghost"), padding: "10px 16px" }}>ยกเลิก</button>
          <button onClick={submit} disabled={errors.length > 0 || saving} style={{
            padding: "10px 18px", borderRadius: 11,
            background: (errors.length || saving) ? "var(--surface)" : "var(--brand)",
            color: (errors.length || saving) ? "var(--ink-4)" : "white",
            fontWeight: 700, fontSize: 13.5, cursor: (errors.length || saving) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
            border: (errors.length || saving) ? "1px solid var(--line)" : "none",
          }}>
            <IconCheck size={15} stroke={(errors.length || saving) ? "var(--ink-4)" : "white"}/>
            {saving ? "กำลังบันทึก..." : "บันทึกผู้เช่าใหม่"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── EDIT TENANT MODAL ───────────────────────────────────────────────────
export function EditTenantModal({ tenant, onClose, onSave, onDelete }) {
  const { rooms, tenants } = useData();
  const [name, setName] = useState(tenant.name);
  const [phone, setPhone] = useState(tenant.phone);
  const [room, setRoom] = useState(tenant.room);
  const sinceY = tenant.sinceY ?? new Date().getFullYear();
  const sinceM = tenant.sinceM ?? new Date().getMonth();
  const sinceIso = `${sinceY}-${String(sinceM + 1).padStart(2, "0")}-01`;
  const [date, setDate] = useState(tenant.moveInDate || sinceIso);
  const [email, setEmail] = useState(tenant.email || "");
  const [address, setAddress] = useState(tenant.address || "");
  const [idCardNumber, setIdCardNumber] = useState(tenant.idCardNumber || "");
  const [idCardImage, setIdCardImage] = useState(tenant.idCardImage || "");
  const [emergencyName, setEmergencyName] = useState(tenant.emergencyName || "");
  const [emergencyPhone, setEmergencyPhone] = useState(tenant.emergencyPhone || "");
  const [resetPassOpen, setResetPassOpen] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  const onIdCardPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 6 * 1024 * 1024) { alert("ไฟล์ใหญ่เกิน 6MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setIdCardImage(ev.target.result);
    reader.readAsDataURL(f);
  };

  const save = () => {
    const [y, m] = date.split("-").map(Number);
    const patch = {
      name: name.trim(), phone: phone.trim(), room,
      sinceY: y, sinceM: m - 1, moveInDate: date,
      email: email.trim(), address: address.trim(),
      idCardNumber: idCardNumber.trim(), idCardImage,
      emergencyName: emergencyName.trim(), emergencyPhone: emergencyPhone.trim(),
    };
    if (resetPassOpen && newPass.length >= 6) patch.password = newPass;
    onSave(patch);
  };

  const valid = name.trim() && phone.trim() && room && date && (!resetPassOpen || newPass.length >= 6);

  return (
    <ModalShell onClose={onClose} width={560}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={tenant.name} size={40}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>แก้ไขข้อมูลผู้เช่า</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{tenant.name} · ห้อง {tenant.room}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <AtField label="ชื่อ-นามสกุล">
          <input value={name} onChange={e => setName(e.target.value)} style={atInputStyle}/>
        </AtField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AtField label="เบอร์โทร">
            <input value={phone} onChange={e => setPhone(e.target.value)} style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
          </AtField>
          <AtField label="วันที่เข้าพัก">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
          </AtField>
        </div>

        <AtField label="ห้องพัก" hint="เลือกห้องว่างเพื่อย้าย">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[...rooms].sort((a,b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true })).map(r => {
              const otherTenant = tenants.find(t => t.room === r.id && t.id !== tenant.id);
              const isCurrent = tenant.room === r.id;
              const sel = room === r.id;
              const disabled = !!otherTenant;
              return (
                <button key={r.id} onClick={() => !disabled && setRoom(r.id)} disabled={disabled} style={{
                  padding: "10px 8px", borderRadius: 11,
                  border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                  background: sel ? "var(--brand-soft)" : disabled ? "var(--surface-2)" : "var(--surface)",
                  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, textAlign: "center",
                }}>
                  <div className="num" style={{ fontSize: 13, fontWeight: 700, color: sel ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>
                    {isCurrent ? "ปัจจุบัน" : disabled ? "ไม่ว่าง" : baht(r.price)}
                  </div>
                </button>
              );
            })}
          </div>
        </AtField>

        {/* Personal info & documents */}
        <div style={{ background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
          <button onClick={() => setDocsOpen(!docsOpen)} style={{
            width: "100%", padding: 14, background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12, textAlign: "left",
          }}>
            <IconCard size={16} stroke="var(--ink-3)"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}>ข้อมูลส่วนบุคคล & เอกสาร</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                {(address || idCardNumber || idCardImage)
                  ? `${idCardImage ? "✓ แนบบัตรประชาชน " : ""}${address ? "· มีที่อยู่ " : ""}${idCardNumber ? "· มีเลข ID" : ""}`
                  : "ที่อยู่ · เลขบัตรประชาชน · รูปถ่ายบัตร · ผู้ติดต่อฉุกเฉิน"}
              </div>
            </div>
            <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 700 }}>{docsOpen ? "ซ่อน ▴" : "ขยาย ▾"}</span>
          </button>
          {docsOpen && (
            <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              <AtField label="ที่อยู่ตามทะเบียนบ้าน">
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
                  style={{ ...atInputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5, background: "white" }}/>
              </AtField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AtField label="อีเมล">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white" }}/>
                </AtField>
                <AtField label="เลขบัตรประชาชน 13 หลัก">
                  <input value={idCardNumber} onChange={e => setIdCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 13))}
                    placeholder="1-2345-67890-12-3"
                    style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                </AtField>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AtField label="ผู้ติดต่อฉุกเฉิน (ชื่อ)">
                  <input value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white" }}/>
                </AtField>
                <AtField label="เบอร์ติดต่อฉุกเฉิน">
                  <input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} placeholder="optional"
                    style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                </AtField>
              </div>
              <AtField label="รูปถ่ายบัตรประชาชน" hint="JPG/PNG ไม่เกิน 6MB">
                {idCardImage ? (
                  <div style={{ background: "white", borderRadius: 12, padding: 12, border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <img src={idCardImage} alt="ID card"
                      style={{ width: 120, height: 75, objectFit: "cover", borderRadius: 8, border: "1px solid var(--line)" }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>✓ แนบรูปบัตรแล้ว</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4, lineHeight: 1.4 }}>
                        คลิก "เปลี่ยนรูป" เพื่ออัปโหลดใหม่ หรือ "ลบรูป" เพื่อนำออก
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <label style={{ ...detailBtn("ghost"), fontSize: 11.5 }}>
                          เปลี่ยนรูป
                          <input type="file" accept="image/*" onChange={onIdCardPick} style={{ display: "none" }}/>
                        </label>
                        <button onClick={() => setIdCardImage("")} style={{ ...detailBtn("ghost"), fontSize: 11.5, color: "var(--danger)" }}>
                          ลบรูป
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "24px 14px", border: "1.5px dashed var(--line-2)", borderRadius: 12, cursor: "pointer",
                    background: "white", color: "var(--ink-3)",
                  }}>
                    <div style={{ fontSize: 22 }}>📷</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}>คลิกเพื่ออัปโหลดรูปบัตรประชาชน</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>หรือลากไฟล์มาวาง</div>
                    <input type="file" accept="image/*" onChange={onIdCardPick} style={{ display: "none" }}/>
                  </label>
                )}
              </AtField>
            </div>
          )}
        </div>

        <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 14, border: "1px solid var(--line)" }}>
          {!resetPassOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconLock size={16} stroke="var(--ink-3)"/>
              <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>รีเซ็ตรหัสผ่านล็อกอินของผู้เช่า</div>
              <button onClick={() => setResetPassOpen(true)} style={detailBtn("ghost")}>เปลี่ยนรหัสผ่าน</button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>ตั้งรหัสผ่านใหม่</div>
                <button onClick={() => { setResetPassOpen(false); setNewPass(""); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 11.5, fontWeight: 700 }}>
                  ยกเลิก ✕
                </button>
              </div>
              <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร"
                style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
            </div>
          )}
        </div>

        <div style={{ background: "var(--danger-soft)", borderRadius: 12, padding: 14, border: "1px dashed var(--danger)" }}>
          {!confirmDel ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <IconTrash size={16} stroke="var(--danger)"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>ลบผู้เช่าออกจากระบบ</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ประวัติการชำระและซ่อมยังคงอยู่</div>
              </div>
              <button onClick={() => setConfirmDel(true)} style={{ ...detailBtn("ghost"), color: "var(--danger)" }}>ลบ</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>ยืนยันลบ {tenant.name}?</div>
              <button onClick={() => setConfirmDel(false)} style={detailBtn("ghost")}>ไม่ลบ</button>
              <button onClick={() => { onDelete?.(tenant.id); onClose(); }} style={{ ...detailBtn("primary"), background: "var(--danger)" }}>ยืนยันลบ</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "var(--surface-2)",
        display: "flex", alignItems: "center", gap: 12, borderRadius: "0 0 20px 20px" }}>
        <div style={{ flex: 1, fontSize: 11.5, color: "var(--ink-3)" }}>การเปลี่ยนแปลงจะบันทึกทันที</div>
        <button onClick={onClose} style={detailBtn("ghost")}>ยกเลิก</button>
        <button onClick={save} disabled={!valid} style={{
          ...detailBtn("primary"),
          background: !valid ? "var(--surface)" : "var(--brand)",
          color: !valid ? "var(--ink-4)" : "white",
          cursor: !valid ? "not-allowed" : "pointer",
          border: !valid ? "1px solid var(--line)" : "none",
        }}>
          <IconCheck size={14} stroke={!valid ? "var(--ink-4)" : "white"}/> บันทึก
        </button>
      </div>
    </ModalShell>
  );
}

// ─── ROOM DETAIL MODAL ───────────────────────────────────────────────────
export function RoomDetailModal({ roomId, onClose, onMove, onTenant, onAddTenant }) {
  const { rooms, tenants, payments, utils, repairs, updateRoom, deleteRoom, owner, reactivateTenant, saveInitialReading, curY, curM } = useData();
  const dynRoomTypes   = owner?.roomTypes   ?? ["เดี่ยว","คู่","สตูดิโอ"];
  const dynAmenityOpts = owner?.amenityOpts ?? AMENITY_OPTS;
  const room = rooms.find(r => r.id === roomId);
  const [moveOpen, setMoveOpen] = useState(false);
  const [destRoom, setDestRoom] = useState("");
  // Per req 3.2: every time a tenant moves into a room, an initial meter
  // reading must be captured for the new room — default to that room's
  // last known meter values so the typical case is a one-click confirm.
  const [moveInitElec, setMoveInitElec]   = useState("");
  const [moveInitWater, setMoveInitWater] = useState("");
  useEffect(() => {
    if (!destRoom) { setMoveInitElec(""); setMoveInitWater(""); return; }
    const dest = rooms.find(r => r.id === destRoom);
    setMoveInitElec(String(dest?.lastElecMeter  ?? 0));
    setMoveInitWater(String(dest?.lastWaterMeter ?? 0));
  }, [destRoom, rooms]);
  const [editOpen, setEditOpen] = useState(false);
  const [editType, setEditType] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAmenities, setEditAmenities] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pickExistingOpen, setPickExistingOpen] = useState(false); // toggle existing-tenant picker
  if (!room) return null;
  const tenant = tenants.find(t => t.room === roomId);
  const roomRepairs = repairs.filter(r => r.room_id === roomId);
  const pays = payments.filter(p => p.room_id === roomId)
    .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month).slice(0, 6);
  // Filter utils to only show CURRENT tenant's history (from their sinceY/sinceM onwards)
  const roomUtils = utils.filter(u => {
    if (u.room_id !== roomId) return false;
    if (tenant) {
      if (u.year < tenant.sinceY) return false;
      if (u.year === tenant.sinceY && u.month < tenant.sinceM) return false;
    }
    return true;
  }).sort((a, b) => b.year - a.year || b.month - a.month).slice(0, 4);
  // Use room-level persisted meter values (survive tenant move-out)
  const hasMeter = room.lastElecMeter != null || room.lastWaterMeter != null;
  const latestReal = roomUtils.find(u => !u.isInitial); // fallback for month label

  const moveOptions = rooms.filter(r => r.id !== roomId);
  const occ = room.status === "ไม่ว่าง";

  return (
    <ModalShell onClose={onClose} width={720}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 14 }}>
        <div className="num" style={{ width: 60, height: 60, borderRadius: 14,
          background: occ ? "var(--brand)" : "var(--sage-soft)",
          color: occ ? "white" : "var(--sage-ink)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700,
        }}>
          {room.id}
          <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>ชั้น {room.floor}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>ห้องพัก {room.type}</div>
            <span style={{ background: occ ? "var(--brand-soft)" : "var(--sage-soft)",
              color: occ ? "var(--brand-ink)" : "var(--sage-ink)", padding: "3px 9px",
              borderRadius: 100, fontSize: 10.5, fontWeight: 700 }}>{room.status}</span>
          </div>
          <div className="num" style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
            {baht(room.price)}<span style={{ color: "var(--ink-4)" }}>/เดือน</span>
          </div>
        </div>

        {/* ── Small inline meter chip — reference for next tenant's starting values ── */}
        {hasMeter && (
          <div title={`เลขมิเตอร์ล่าสุด${room.lastMeterYear != null ? ` (${dl(room.lastMeterYear, room.lastMeterMonth)})` : ""} — ใช้เป็นค่าเริ่มต้นสำหรับผู้เช่าคนถัดไป`}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
              background: "var(--surface-2)", borderRadius: 100, border: "1px solid var(--line)" }}>
            <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: "oklch(0.48 0.13 80)",
              display: "flex", alignItems: "center", gap: 3 }}>
              ⚡<span style={{ color: "var(--ink)" }}>{room.lastElecMeter ?? '—'}</span>
            </span>
            <span style={{ width: 1, height: 12, background: "var(--line)" }}/>
            <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: "oklch(0.40 0.13 230)",
              display: "flex", alignItems: "center", gap: 3 }}>
              💧<span style={{ color: "var(--ink)" }}>{room.lastWaterMeter ?? '—'}</span>
            </span>
          </div>
        )}

        <button onClick={() => {
          if (!editOpen) { setEditType(room.type); setEditPrice(String(room.price)); setEditAmenities([...room.amenities]); }
          setEditOpen(!editOpen);
        }} style={{ padding: "7px 12px", borderRadius: 11, border: "1px solid var(--line)", background: editOpen ? "var(--brand-soft)" : "var(--surface-2)",
          color: editOpen ? "var(--brand-ink)" : "var(--ink-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600 }}>
          <IconEdit size={14} stroke={editOpen ? "var(--brand)" : "var(--ink-3)"}/> แก้ไขห้อง
        </button>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {editOpen && (
          <div className="screen-in" style={{ background: "var(--brand-soft)", borderRadius: 14, padding: 16, border: "1px dashed var(--brand)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>แก้ไขรายละเอียดห้อง {room.id}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <AtField label="ประเภทห้อง">
                <div style={{ display: "flex", gap: 6 }}>
                  {dynRoomTypes.map(t => (
                    <button key={t} onClick={() => setEditType(t)} style={{
                      flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600,
                      border: editType === t ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                      background: editType === t ? "white" : "var(--surface)", color: editType === t ? "var(--brand-ink)" : "var(--ink-2)",
                    }}>{t}</button>
                  ))}
                </div>
              </AtField>
              <AtField label="ค่าเช่า (฿/เดือน)">
                <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                  style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
              </AtField>
            </div>
            <AtField label="สิ่งอำนวยความสะดวก" hint={`${editAmenities.length} รายการ`}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {dynAmenityOpts.map(a => {
                  const on = editAmenities.includes(a);
                  return (
                    <button key={a} onClick={() => setEditAmenities(prev => on ? prev.filter(x=>x!==a) : [...prev,a])} style={{
                      padding: "6px 10px", borderRadius: 100, cursor: "pointer", fontSize: 11.5, fontWeight: 600,
                      border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                      background: on ? "white" : "var(--surface)", color: on ? "var(--brand-ink)" : "var(--ink-2)",
                    }}>{on ? "✓ " : ""}{a}</button>
                  );
                })}
              </div>
            </AtField>
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setConfirmDelete(true)} style={{
                padding: "9px 14px", borderRadius: 11, border: "1px solid var(--danger-soft)",
                background: "var(--surface)", color: "var(--danger)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700,
              }}>
                <IconX size={14} stroke="var(--danger)"/> ลบห้องนี้
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditOpen(false)} style={detailBtn("ghost")}>ยกเลิก</button>
                <button onClick={() => {
                  updateRoom(room.id, { type: editType, price: Number(editPrice), amenities: editAmenities });
                  setEditOpen(false);
                }} style={detailBtn("primary")}>
                  <IconCheck size={14} stroke="white"/> บันทึก
                </button>
              </div>
            </div>

            {confirmDelete && (
              <div className="screen-in" style={{ marginTop: 12, background: "var(--danger-soft)",
                borderRadius: 12, padding: 14, border: "1px solid var(--danger)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>
                  ⚠️ ยืนยันการลบห้อง {room.id}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 10, lineHeight: 1.5 }}>
                  การลบจะนำห้องนี้ออกจากระบบถาวร{tenant ? ` พร้อมทั้งย้ายผู้เช่า "${tenant.name}" ออกจากห้อง` : ""}
                  {" "}และลบประวัติการชำระ/มิเตอร์/งานซ่อมที่เกี่ยวข้องทั้งหมด — ไม่สามารถยกเลิกได้
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setConfirmDelete(false)} style={detailBtn("ghost")}>ยกเลิก</button>
                  <button onClick={() => {
                    deleteRoom(room.id);
                    setConfirmDelete(false);
                    setEditOpen(false);
                    onClose();
                  }} style={{
                    padding: "9px 14px", borderRadius: 11, background: "var(--danger)", color: "white",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    fontSize: 12.5, fontWeight: 700,
                  }}>
                    <IconX size={14} stroke="white"/> ลบห้องถาวร
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ background: tenant ? "var(--brand-soft)" : "var(--surface-2)", borderRadius: 14,
          padding: 16, display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--line)" }}>
          {tenant ? (
            <>
              <Avatar name={tenant.name} size={48}/>
              <div
                onClick={() => onTenant && onTenant(tenant)}
                style={{ flex: 1, cursor: onTenant ? "pointer" : "default" }}
                title={onTenant ? "คลิกเพื่อดูรายละเอียดผู้เช่า" : undefined}
              >
                <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>ผู้เช่าปัจจุบัน</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                  {tenant.name}
                  {onTenant && <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600 }}>→ ดูรายละเอียด</span>}
                </div>
                <div className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  {tenant.phone} · เข้าพัก {dl(tenant.sinceY, tenant.sinceM)}
                </div>
              </div>
              <button onClick={() => { setMoveOpen(true); setDestRoom(""); }} style={{
                padding: "9px 14px", borderRadius: 11, background: "var(--ink)", color: "white", border: "none",
                fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              }}>
                <IconArrowRight size={14} stroke="white"/> ย้ายห้อง
              </button>
            </>
          ) : (
            <>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--sage-soft)",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconUsers size={22} stroke="var(--sage-ink)"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>ห้องว่าง · พร้อมเช่า</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>เพิ่มผู้เช่าใหม่ หรือเลือกผู้เช่าเดิมเพื่อเข้าพักห้องนี้</div>
              </div>
              <button onClick={() => setPickExistingOpen(!pickExistingOpen)} style={{
                background: pickExistingOpen ? "var(--brand-soft)" : "var(--surface-2)",
                color: pickExistingOpen ? "var(--brand-ink)" : "var(--ink-2)",
                border: "1px solid var(--line)", borderRadius: 11,
                padding: "10px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              }}>
                <IconUsers size={14} stroke={pickExistingOpen ? "var(--brand)" : "var(--ink-3)"}/> เลือกผู้เช่าเดิม
              </button>
              {onAddTenant && (
                <button onClick={() => onAddTenant(roomId)} style={{
                  background: "var(--brand)", color: "white", border: "none", borderRadius: 11,
                  padding: "10px 16px", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                }}>
                  <IconPlus size={14} stroke="white"/> เพิ่มผู้เช่าใหม่
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Pick existing (evicted/no-room) tenant to assign to this vacant room ── */}
        {pickExistingOpen && !tenant && (() => {
          const available = tenants.filter(t => !t.room); // tenants without a current room
          return (
            <div className="screen-in" style={{ background: "var(--surface-2)", borderRadius: 14,
              padding: 16, border: "1px dashed var(--brand)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>เลือกผู้เช่าเดิมเข้าห้อง {roomId}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                    {available.length === 0
                      ? "ไม่มีผู้เช่าที่ไม่มีห้อง — เพิ่มผู้เช่าใหม่แทน"
                      : `มี ${available.length} คนไม่มีห้อง · กดเพื่อให้เข้าพักห้องนี้`}
                  </div>
                </div>
                <button onClick={() => setPickExistingOpen(false)} style={{ background: "transparent", border: "none",
                  color: "var(--ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>ยกเลิก ✕</button>
              </div>
              {available.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                  {available.map(t => {
                    const isEvicted = !!t.evicted;
                    // Status palette: evicted = warm red, never-assigned = cool gray-blue
                    const statusBg    = isEvicted ? "oklch(0.94 0.05 25)"  : "oklch(0.94 0.025 250)";
                    const statusFg    = isEvicted ? "oklch(0.48 0.16 25)"  : "oklch(0.45 0.08 250)";
                    const statusLabel = isEvicted ? "เลิกเช่า"             : "ไม่มีห้อง";
                    const roomBadgeBg = isEvicted ? "oklch(0.97 0.03 25)"  : "var(--surface-2)";
                    const roomBadgeFg = isEvicted ? "oklch(0.48 0.16 25)"  : "var(--ink-3)";
                    const roomBadgeBd = isEvicted ? "oklch(0.85 0.06 25)"  : "var(--line)";
                    return (
                      <button key={t.id}
                        onClick={() => {
                          reactivateTenant(t.id, roomId, curY, curM);
                          setPickExistingOpen(false);
                        }}
                        style={{ background: "var(--surface)", border: "1px solid var(--line)",
                          borderRadius: 11, padding: "10px 14px", cursor: "pointer", textAlign: "left",
                          display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Room number badge (previous room or dashes) */}
                        <div className="num" style={{ width: 44, height: 44, borderRadius: 11,
                          background: roomBadgeBg, color: roomBadgeFg, border: `1px solid ${roomBadgeBd}`,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {t.prevRoom || "—"}
                          {t.prevRoom && <span style={{ fontSize: 8, fontWeight: 500, opacity: 0.7, marginTop: 1 }}>ห้องเดิม</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{t.name}</span>
                            <span style={{ background: statusBg, color: statusFg,
                              padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                            {t.phone || "—"}
                            {isEvicted && t.evictedY != null && <span> · ออกเมื่อ {dl(t.evictedY, t.evictedM)}</span>}
                          </div>
                        </div>
                        <span style={{ background: "var(--brand)", color: "white", padding: "5px 12px",
                          borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                          ให้เข้าพัก →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {moveOpen && tenant && (
          <div className="screen-in" style={{ background: "var(--surface-2)", borderRadius: 14,
            padding: 16, border: "1px dashed var(--brand)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>ย้าย {tenant.name} ไปยังห้องอื่น</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>ห้องเดิม {roomId} จะถูกตั้งเป็น "ว่าง" อัตโนมัติ</div>
              </div>
              <button onClick={() => setMoveOpen(false)} style={{ background: "transparent", border: "none",
                color: "var(--ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>ยกเลิก ✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {moveOptions.map(r => {
                const occu = r.status === "ไม่ว่าง";
                const sel = destRoom === r.id;
                return (
                  <button key={r.id} onClick={() => setDestRoom(r.id)} style={{
                    padding: "10px 8px", borderRadius: 11,
                    border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                    background: sel ? "var(--brand-soft)" : "var(--surface)",
                    cursor: "pointer", textAlign: "center",
                  }}>
                    <div className="num" style={{ fontSize: 13, fontWeight: 700,
                      color: sel ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                    <div style={{ fontSize: 10, color: occu ? "var(--warn)" : "var(--ink-3)", marginTop: 2, fontWeight: occu ? 700 : 500 }}>
                      {occu ? "มีผู้เช่า" : baht(r.price)}
                    </div>
                  </button>
                );
              })}
            </div>
            {destRoom && (() => {
              const dest = rooms.find(r => r.id === destRoom);
              const swap = tenants.find(t => t.room === destRoom);
              const meterValid = moveInitElec !== "" && moveInitWater !== "";
              const canConfirm = !swap && meterValid;
              return (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ padding: "12px 14px", background: "var(--surface)", borderRadius: 10,
                    border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
                    <IconBell size={16} stroke={swap ? "var(--warn)" : "var(--brand)"}/>
                    <div style={{ flex: 1, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                      {swap ? (
                        <>ห้อง {destRoom} มี <b>{swap.name}</b> อยู่แล้ว — การย้ายจะต้องจัดการผู้เช่าเดิมก่อน</>
                      ) : (
                        <>ย้าย <b>{tenant.name}</b> จาก <b>{roomId}</b> → <b>{destRoom}</b> ({dest.type}, {baht(dest.price)}/เดือน)</>
                      )}
                    </div>
                  </div>
                  {!swap && (
                    <div style={{ padding: "12px 14px", background: "oklch(0.97 0.025 145)", borderRadius: 10,
                      border: "1px solid oklch(0.85 0.06 145)" }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "oklch(0.35 0.1 145)", marginBottom: 6 }}>
                        ⚡💧 เลขมิเตอร์เริ่มต้นของห้อง {destRoom} (วันย้ายเข้า)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input type="number" value={moveInitElec} onChange={e => setMoveInitElec(e.target.value)}
                          placeholder="ไฟ" style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                        <input type="number" value={moveInitWater} onChange={e => setMoveInitWater(e.target.value)}
                          placeholder="น้ำ" style={{ ...atInputStyle, background: "white", fontFamily: "var(--font-num)" }}/>
                      </div>
                    </div>
                  )}
                  <button disabled={!canConfirm} onClick={async () => {
                    await onMove(tenant.id, destRoom);
                    if (saveInitialReading) {
                      const today = new Date();
                      saveInitialReading({
                        room_id: destRoom,
                        year: today.getFullYear(),
                        month: today.getMonth(),
                        elec_cur: +moveInitElec || 0,
                        water_cur: +moveInitWater || 0,
                      });
                    }
                    setMoveOpen(false);
                  }} style={{
                    padding: "10px 14px", borderRadius: 10, border: "none", alignSelf: "flex-end",
                    background: canConfirm ? "var(--brand)" : "var(--surface-2)",
                    color: canConfirm ? "white" : "var(--ink-4)",
                    fontWeight: 700, fontSize: 12.5, cursor: canConfirm ? "pointer" : "not-allowed",
                  }}>ยืนยันย้าย + บันทึกมิเตอร์เริ่มต้น</button>
                </div>
              );
            })()}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <MiniStat2 label="ค่าเช่า/เดือน" value={baht(room.price)} tone="brand"/>
          <MiniStat2 label="ค้างชำระ" value={pays.filter(p => p.status === "รอชำระ").length} tone="warn"/>
          <MiniStat2 label="ซ่อมค้าง" value={roomRepairs.filter(r => r.status !== "เสร็จแล้ว").length} tone="lilac"/>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
            letterSpacing: 1, marginBottom: 10 }}>สิ่งอำนวยความสะดวก</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(room.amenities || []).map(a => {
              const Ic = amenityIcon(a);
              return (
                <div key={a} style={{ padding: "8px 12px", borderRadius: 100, background: "var(--surface-2)",
                  border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <Ic size={14} stroke="var(--ink-2)"/> {a}
                </div>
              );
            })}
          </div>
        </div>

        {/* Per req 2.4: vacant rooms show only the meter icon (top-right) + a clean-slate
            hint, not the previous tenant's usage history — that history lives on the
            tenant's detail page instead. */}
        {!occ && (
          <div style={{ background: "var(--sage-soft)", borderRadius: 12, padding: 14,
            border: "1px dashed oklch(0.78 0.07 145)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <div style={{ flex: 1, fontSize: 12.5, color: "oklch(0.35 0.1 145)", lineHeight: 1.5 }}>
              ห้องนี้ว่าง — ประวัติการใช้ห้องของผู้เช่าก่อนหน้าถูกซ่อนไว้
              {hasMeter && <> · เลขมิเตอร์ล่าสุดแสดงอยู่ที่มุมขวาบน ⚡{room.lastElecMeter ?? 0} 💧{room.lastWaterMeter ?? 0}</>}
              {" "}— ใช้เป็นค่าเริ่มต้นเมื่อมีผู้เช่าใหม่
            </div>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: occ ? "1fr 1fr" : "1fr", gap: 12 }}>
          {occ && (
            <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 14, border: "1px solid var(--line)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 10 }}>ประวัติการชำระล่าสุด</div>
              {pays.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", padding: 12 }}>—</div>
              ) : pays.map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0",
                  borderBottom: "1px solid var(--line)", fontSize: 12 }}>
                  <span style={{ color: "var(--ink-2)" }}>{dl(p.year, p.month)}</span>
                  <span className="num" style={{ fontWeight: 600,
                    color: p.status === "ชำระแล้ว" ? "var(--ok)" : "var(--warn)" }}>
                    {p.status === "ชำระแล้ว" ? "✓ " : "⏳ "}{baht(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {occ && (
          <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 14, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 10 }}>ประวัติมิเตอร์ย้อนหลัง</div>

            {/* ── History rows ── */}
            {roomUtils.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", padding: 12 }}>—</div>
            ) : (
              <div>
                {roomUtils.map(u => (
                  <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{dl(u.year, u.month)}</span>
                      {u.isInitial && (
                        <span style={{ fontSize: 9.5, fontWeight: 700, background: "oklch(0.88 0.08 145)",
                          color: "oklch(0.35 0.1 145)", borderRadius: 4, padding: "1px 5px" }}>เริ่มต้น</span>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="num" style={{ fontSize: 12, fontWeight: 700,
                        display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        <span style={{ color: "oklch(0.48 0.13 80)" }}>⚡ {u.elec_cur}</span>
                        <span style={{ color: "oklch(0.40 0.13 230)" }}>💧 {u.water_cur}</span>
                      </div>
                      {!u.isInitial && (
                        <div className="num" style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 1 }}>
                          ใช้ {u.elec_use + u.water_use} หน่วย · {baht(u.elec_amount + u.water_amount)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── SETTINGS MODAL ──────────────────────────────────────────────────────
function NotifToggle({ label, desc, on: defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
      background: "var(--surface-2)", borderRadius: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 42, height: 24, borderRadius: 100, padding: 2, border: "none",
        background: on ? "var(--brand)" : "var(--line-2)", cursor: "pointer", position: "relative", transition: "0.15s",
      }}>
        <span style={{
          position: "absolute", top: 2, left: on ? 20 : 2, width: 20, height: 20, borderRadius: "50%",
          background: "white", boxShadow: "var(--sh-1)", transition: "0.15s",
        }}/>
      </button>
    </div>
  );
}

function SettingsFooter({ onCancel, onSave, label }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
      <button onClick={onCancel} style={detailBtn("ghost")}>ยกเลิก</button>
      <button onClick={onSave} style={detailBtn("primary")}>
        <IconCheck size={14} stroke="white"/> {label}
      </button>
    </div>
  );
}

export function SettingsModal({ onClose }) {
  const { owner, updateOwner, ownerUsername, updateOwnerUsername,
    banks, addBank, updateBank, deleteBank, setPrimaryBank,
    staff, addStaff, updateStaff, deleteStaff, resetAllData } = useData();
  const [section, setSection] = useState("profile");
  const [name, setName] = useState(owner.name);
  const [displayName, setDisplayName] = useState(owner.displayName);
  const [dorm, setDorm] = useState(owner.dorm);
  const [address, setAddress] = useState(owner.address);
  const [phone, setPhone] = useState(owner.phone);
  const [email, setEmail] = useState(owner.email);

  const [numFloors,   setNumFloors]   = useState(owner.numFloors   ?? 5);
  const [roomTypes,   setRoomTypes]   = useState(owner.roomTypes   ?? ["เดี่ยว","คู่","สตูดิโอ"]);
  const [amenityOpts, setAmenityOpts] = useState(owner.amenityOpts ?? AMENITY_OPTS);
  const [newRoomType, setNewRoomType] = useState("");
  const [newAmenity,  setNewAmenity]  = useState("");
  const [dueDay, setDueDay] = useState(owner.dueDay ?? 5);
  const [billDay, setBillDay] = useState(owner.billDay ?? 25);
  const [elecRate, setElecRate] = useState(owner.elecRate ?? UTIL_RATE.electric);
  const [waterRate, setWaterRate] = useState(owner.waterRate ?? UTIL_RATE.water);

  const [savedFlash, setSavedFlash] = useState(null);

  // Sync local field state whenever the global `owner` context changes
  // (e.g. after factory reset — owner becomes BLANK_OWNER, so the form should clear too)
  useEffect(() => {
    setName(owner.name);
    setDisplayName(owner.displayName);
    setDorm(owner.dorm);
    setAddress(owner.address);
    setPhone(owner.phone);
    setEmail(owner.email);
    setNumFloors(owner.numFloors ?? 5);
    setRoomTypes(owner.roomTypes ?? ["เดี่ยว","คู่","สตูดิโอ"]);
    setAmenityOpts(owner.amenityOpts ?? AMENITY_OPTS);
    setDueDay(owner.dueDay ?? 5);
    setBillDay(owner.billDay ?? 25);
    setElecRate(owner.elecRate ?? UTIL_RATE.electric);
    setWaterRate(owner.waterRate ?? UTIL_RATE.water);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  // ─── Unified account management state ───
  const [acctEditId,   setAcctEditId]   = useState(null);
  const [acctAdding,   setAcctAdding]   = useState(false);
  const [acctForm,     setAcctForm]     = useState({ name: "", username: "", password: "", role: "meter" });
  const [acctShowPass, setAcctShowPass] = useState(false);

  const saveAccount = async () => {
    const u = acctForm.username.trim();
    if (!u || !acctForm.password) { setSavedFlash({ kind: "error", msg: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }); return; }
    const dup = staff.find(s => s.username.toLowerCase() === u.toLowerCase() && s.id !== acctEditId);
    if (dup) { setSavedFlash({ kind: "error", msg: "ชื่อผู้ใช้นี้มีอยู่แล้ว" }); return; }
    if (acctEditId) {
      const original = staff.find(s => s.id === acctEditId);
      // Update staff table (handles DB + state for all fields)
      const res = await updateStaff(acctEditId, { username: u, password: acctForm.password, role: acctForm.role, name: acctForm.name });
      if (res?.ok === false) {
        setSavedFlash({ kind: "error", msg: `บันทึกไม่สำเร็จ — ${res.msg}` });
        return;
      }
      // If this is the owner's primary account, also sync config keys
      if (original?.username.toLowerCase() === (ownerUsername || "admin").toLowerCase()) {
        if (u !== original.username) await updateOwnerUsername(u);
        if (acctForm.password !== original.password) await updateOwner({ password: acctForm.password });
      }
      setSavedFlash({ kind: "ok", msg: "บันทึกแล้ว ✓" });
      setAcctEditId(null);
    } else {
      const res = await addStaff({ username: u, password: acctForm.password, role: acctForm.role, name: acctForm.name });
      if (res?.ok === false) {
        setSavedFlash({ kind: "error", msg: `เพิ่มบัญชีไม่สำเร็จ — ${res.msg}` });
        return;
      }
      setSavedFlash({ kind: "ok", msg: `เพิ่มบัญชี "@${u}" เรียบร้อย` });
      setAcctAdding(false);
    }
  };

  const saveProfile = () => {
    updateOwner({ name, displayName, phone, email });
    setSavedFlash({ kind: "ok", msg: "บันทึกโปรไฟล์เรียบร้อย" });
  };
  const saveDorm = () => {
    updateOwner({
      dorm, address,
      numFloors: Math.max(1, Math.min(20, +numFloors || 5)),
      roomTypes:   roomTypes.length   ? roomTypes   : ["เดี่ยว","คู่","สตูดิโอ"],
      amenityOpts: amenityOpts.length ? amenityOpts : AMENITY_OPTS,
    });
    setSavedFlash({ kind: "ok", msg: "บันทึกข้อมูลหอพักเรียบร้อย" });
  };
  const saveBilling = () => {
    updateOwner({ dueDay, billDay, elecRate, waterRate });
    setSavedFlash({ kind: "ok", msg: "บันทึกการตั้งค่าค่าน้ำ-ไฟเรียบร้อย" });
  };

  return (
    <ModalShell onClose={onClose} width={680}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSettings size={20} stroke="var(--brand)"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>ตั้งค่าเจ้าของหอ</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>จัดการข้อมูลส่วนตัว ชื่อหอพัก และรหัสผ่าน</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr" }}>
        <div style={{ borderRight: "1px solid var(--line)", padding: "12px 8px", background: "var(--surface-2)",
          display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { id: "profile",  label: "โปรไฟล์",     icon: IconUser },
            { id: "dorm",     label: "ข้อมูลหอพัก",  icon: IconBuilding },
            { id: "password", label: "บัญชีผู้ใช้",   icon: IconLock },
            { id: "notify",   label: "การแจ้งเตือน", icon: IconBell },
            { id: "billing",  label: "ค่าน้ำ-ไฟ",   icon: IconSparkle },
            { id: "banks",    label: "บัญชีธนาคาร", icon: IconCard },
            { id: "reset",    label: "ตั้งค่าโรงงาน", icon: IconTrash },
          ].map(s => {
            const Ic = s.icon;
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => { setSection(s.id); setSavedFlash(null); }} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "var(--surface)" : "transparent",
                color: active ? "var(--ink)" : "var(--ink-2)",
                fontWeight: active ? 700 : 500, fontSize: 13,
                boxShadow: active ? "var(--sh-1)" : "none",
              }}>
                <Ic size={15} stroke={active ? "var(--brand)" : "var(--ink-3)"}/> {s.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "20px 24px", maxHeight: 520, overflow: "auto" }}>
          {section === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 14px",
                background: "var(--brand-soft)", borderRadius: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--brand)",
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700 }}>
                  {(displayName || "ส").charAt(displayName?.startsWith("คุณ") ? 3 : 0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--brand-ink)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>เจ้าของหอพัก</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{displayName}</div>
                </div>
              </div>
              <AtField label="ชื่อ-นามสกุล จริง" hint="ใช้ในเอกสาร / ใบเสร็จ">
                <input value={name} onChange={e => setName(e.target.value)} style={atInputStyle}/>
              </AtField>
              <AtField label="ชื่อแสดงในระบบ" hint="ที่ผู้เช่าและพนักงานเห็น">
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={atInputStyle}/>
              </AtField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AtField label="เบอร์โทร">
                  <input value={phone} onChange={e => setPhone(e.target.value)} style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
                </AtField>
                <AtField label="อีเมล">
                  <input value={email} onChange={e => setEmail(e.target.value)} style={atInputStyle}/>
                </AtField>
              </div>
              {savedFlash && <FlashMsg flash={savedFlash}/>}
              <SettingsFooter onCancel={onClose} onSave={saveProfile} label="บันทึกโปรไฟล์"/>
            </div>
          )}

          {section === "dorm" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AtField label="ชื่อหอพัก" hint="แสดงในแอปผู้เช่าและใบเสร็จ">
                <input value={dorm} onChange={e => setDorm(e.target.value)} style={atInputStyle}/>
              </AtField>
              <AtField label="ที่อยู่หอพัก">
                <textarea value={address} onChange={e => setAddress(e.target.value)}
                  style={{ ...atInputStyle, height: 80, resize: "vertical", fontFamily: "var(--font-thai)" }}/>
              </AtField>

              {/* ประเภทห้อง */}
              <AtField label="ประเภทห้อง" hint="แสดงในแบบฟอร์มเพิ่ม/แก้ไขห้อง">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {roomTypes.map(t => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 10px 5px 12px", borderRadius: 100,
                      background: "var(--brand-soft)", border: "1px solid var(--brand)",
                      fontSize: 12.5, fontWeight: 600, color: "var(--brand-ink)" }}>
                      {t}
                      {roomTypes.length > 1 && (
                        <button onClick={() => setRoomTypes(prev => prev.filter(x => x !== t))} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--brand-ink)", fontSize: 15, lineHeight: 1, padding: "0 2px",
                          opacity: 0.7,
                        }}>×</button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={newRoomType} onChange={e => setNewRoomType(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter" && newRoomType.trim() && !roomTypes.includes(newRoomType.trim())) { setRoomTypes(p=>[...p,newRoomType.trim()]); setNewRoomType(""); }}}
                    placeholder="เพิ่มประเภทใหม่..." style={{ ...atInputStyle, flex: 1 }}/>
                  <button onClick={() => { const v=newRoomType.trim(); if(v&&!roomTypes.includes(v)){setRoomTypes(p=>[...p,v]);setNewRoomType("");} }}
                    disabled={!newRoomType.trim() || roomTypes.includes(newRoomType.trim())}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", fontSize: 12.5,
                      background: "var(--brand)", color: "white", fontWeight: 700,
                      cursor: !newRoomType.trim() || roomTypes.includes(newRoomType.trim()) ? "not-allowed" : "pointer",
                      opacity: !newRoomType.trim() || roomTypes.includes(newRoomType.trim()) ? 0.45 : 1 }}>
                    + เพิ่ม</button>
                </div>
              </AtField>

              {/* สิ่งอำนวยความสะดวก */}
              <AtField label="สิ่งอำนวยความสะดวก" hint="แสดงในแบบฟอร์มเพิ่ม/แก้ไขห้อง">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {amenityOpts.map(a => (
                    <span key={a} style={{ display: "flex", alignItems: "center", gap: 5,
                      padding: "5px 10px 5px 12px", borderRadius: 100,
                      background: "var(--surface-2)", border: "1px solid var(--line)",
                      fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>
                      {a}
                      {amenityOpts.length > 1 && (
                        <button onClick={() => setAmenityOpts(prev => prev.filter(x => x !== a))} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--ink-3)", fontSize: 15, lineHeight: 1, padding: "0 2px",
                        }}>×</button>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)}
                    onKeyDown={e => { if (e.key==="Enter" && newAmenity.trim() && !amenityOpts.includes(newAmenity.trim())) { setAmenityOpts(p=>[...p,newAmenity.trim()]); setNewAmenity(""); }}}
                    placeholder="เพิ่มสิ่งอำนวยความสะดวกใหม่..." style={{ ...atInputStyle, flex: 1 }}/>
                  <button onClick={() => { const v=newAmenity.trim(); if(v&&!amenityOpts.includes(v)){setAmenityOpts(p=>[...p,v]);setNewAmenity("");} }}
                    disabled={!newAmenity.trim() || amenityOpts.includes(newAmenity.trim())}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", fontSize: 12.5,
                      background: "var(--brand)", color: "white", fontWeight: 700,
                      cursor: !newAmenity.trim() || amenityOpts.includes(newAmenity.trim()) ? "not-allowed" : "pointer",
                      opacity: !newAmenity.trim() || amenityOpts.includes(newAmenity.trim()) ? 0.45 : 1 }}>
                    + เพิ่ม</button>
                </div>
              </AtField>

              {/* จำนวนชั้น */}
              <AtField label="จำนวนชั้นของหอพัก" hint="ใช้กำหนดตัวเลือกชั้นเมื่อเพิ่มห้องพักใหม่">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setNumFloors(f => Math.max(1, f - 1))} style={{
                    width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
                    background: "var(--surface-2)", fontSize: 20, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--ink-2)",
                  }}>−</button>
                  <div style={{ flex: 1, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                    {Array.from({ length: Math.max(1, Math.min(20, numFloors)) }, (_, i) => i + 1).map(f => (
                      <div key={f} style={{
                        minWidth: 36, height: 36, borderRadius: 9,
                        background: "var(--brand-soft)", border: "1px solid var(--brand)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "var(--brand-ink)",
                      }}>{f}</div>
                    ))}
                  </div>
                  <button onClick={() => setNumFloors(f => Math.min(20, f + 1))} style={{
                    width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)",
                    background: "var(--surface-2)", fontSize: 20, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--ink-2)",
                  }}>+</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-3)", textAlign: "center" }}>
                  {numFloors} ชั้น (สูงสุด 20 ชั้น)
                </div>
              </AtField>

              {savedFlash && <FlashMsg flash={savedFlash}/>}
              <SettingsFooter onCancel={onClose} onSave={saveDorm} label="บันทึกข้อมูลหอพัก"/>
            </div>
          )}

          {section === "password" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* ── Info banner ── */}
              <div style={{ padding: "10px 14px", background: "var(--brand-soft)", borderRadius: 12,
                display: "flex", alignItems: "flex-start", gap: 10 }}>
                <IconUsers size={15} stroke="var(--brand)"/>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6 }}>
                  กดปุ่ม <b>แก้ไข</b> ที่บัญชีใดก็ได้ เพื่อเปลี่ยน ชื่อผู้ใช้ · รหัสผ่าน · สิทธิ์ ·
                  บัญชี <b>Admin</b> เข้าได้ทุกหน้า · <b>จดมิเตอร์</b> เข้าได้เฉพาะหน้าจดมิเตอร์
                </div>
              </div>

              {/* ── Account cards ── */}
              {staff.map(s => {
                const isEditing = acctEditId === s.id;
                const adminCount = staff.filter(x => x.role === "admin").length;
                const canDelete = s.role !== "admin" || adminCount > 1;

                if (isEditing) return (
                  <div key={s.id} style={{ padding: 14, background: "var(--surface-2)",
                    border: "1.5px solid var(--brand)", borderRadius: 13,
                    display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-ink)" }}>
                      แก้ไขบัญชี @{s.username}
                    </div>
                    <AtField label="ชื่อ-นามสกุล (แสดงในระบบ)">
                      <input value={acctForm.name} onChange={e => setAcctForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="เช่น สมชาย ใจดี" style={atInputStyle}/>
                    </AtField>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <AtField label="ชื่อผู้ใช้ (login)">
                        <input value={acctForm.username} onChange={e => setAcctForm(f => ({ ...f, username: e.target.value }))}
                          style={atInputStyle} autoComplete="off"/>
                      </AtField>
                      <AtField label="รหัสผ่าน">
                        <div style={{ position: "relative" }}>
                          <input type={acctShowPass ? "text" : "password"} value={acctForm.password}
                            onChange={e => setAcctForm(f => ({ ...f, password: e.target.value }))}
                            style={{ ...atInputStyle, paddingRight: 40 }} autoComplete="new-password"/>
                          <button onClick={() => setAcctShowPass(v => !v)} style={{
                            position: "absolute", right: 6, top: 6, width: 28, height: 28, border: "none",
                            background: "transparent", cursor: "pointer", color: "var(--ink-3)", fontSize: 11, fontWeight: 700,
                          }}>{acctShowPass ? "ซ่อน" : "ดู"}</button>
                        </div>
                      </AtField>
                    </div>
                    <AtField label="สิทธิ์การเข้าถึง">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { v: "admin", label: "Admin", desc: "เข้าได้ทุกอย่าง" },
                          { v: "meter", label: "จดมิเตอร์", desc: "เฉพาะหน้าจดมิเตอร์น้ำ-ไฟ" },
                        ].map(opt => (
                          <button key={opt.v} onClick={() => setAcctForm(f => ({ ...f, role: opt.v }))} style={{
                            padding: "10px 12px", textAlign: "left", cursor: "pointer", borderRadius: 11,
                            border: `1.5px solid ${acctForm.role === opt.v ? "var(--brand)" : "var(--line)"}`,
                            background: acctForm.role === opt.v ? "var(--brand-soft)" : "var(--surface)",
                          }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: acctForm.role === opt.v ? "var(--brand-ink)" : "var(--ink)" }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </AtField>
                    {savedFlash && <FlashMsg flash={savedFlash}/>}
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => { setAcctEditId(null); setSavedFlash(null); }} style={{
                        padding: "9px 16px", borderRadius: 10, border: "1px solid var(--line)",
                        background: "var(--surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)",
                      }}>ยกเลิก</button>
                      <button onClick={saveAccount} style={{
                        padding: "9px 18px", borderRadius: 10, border: "none",
                        background: "var(--brand)", color: "white", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                      }}>บันทึก</button>
                    </div>
                  </div>
                );

                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 13 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: s.role === "admin" ? "var(--brand-soft)" : "var(--surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {s.role === "admin"
                        ? <IconLock size={15} stroke="var(--brand)"/>
                        : <IconSparkle size={15} stroke="var(--ink-3)"/>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{s.name || s.username}</span>
                        <span style={{
                          background: s.role === "admin" ? "var(--brand-soft)" : "var(--surface-2)",
                          color: s.role === "admin" ? "var(--brand-ink)" : "var(--ink-3)",
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                        }}>{s.role === "admin" ? "Admin" : "จดมิเตอร์"}</span>
                      </div>
                      <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>
                        @{s.username} · {"●".repeat(Math.min(s.password?.length ?? 0, 8))}
                      </div>
                    </div>
                    <button onClick={() => {
                      setAcctEditId(s.id); setAcctAdding(false);
                      setAcctForm({ name: s.name || "", username: s.username, password: s.password, role: s.role });
                      setAcctShowPass(false); setSavedFlash(null);
                    }} style={{ padding: "6px 12px", borderRadius: 9, border: "1px solid var(--line)",
                      background: "var(--surface-2)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                      แก้ไข
                    </button>
                    {canDelete ? (
                      <button onClick={async () => {
                        if (!window.confirm(`ลบบัญชี "${s.username}" ออกจากระบบ?`)) return;
                        await deleteStaff(s.id);
                        setSavedFlash({ kind: "ok", msg: `ลบ "@${s.username}" แล้ว` });
                      }} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)",
                        background: "var(--surface-2)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconTrash size={13} stroke="var(--danger)"/>
                      </button>
                    ) : <div style={{ width: 32 }}/>}
                  </div>
                );
              })}

              {/* ── Add new account form ── */}
              {acctAdding && (
                <div style={{ padding: 14, background: "var(--surface-2)",
                  border: "1.5px dashed var(--brand)", borderRadius: 13,
                  display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>เพิ่มบัญชีทีมงานใหม่</div>
                  <AtField label="ชื่อ-นามสกุล (แสดงในระบบ)">
                    <input value={acctForm.name} onChange={e => setAcctForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="เช่น สมชาย ใจดี" style={atInputStyle}/>
                  </AtField>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <AtField label="ชื่อผู้ใช้ (login)">
                      <input value={acctForm.username} onChange={e => setAcctForm(f => ({ ...f, username: e.target.value }))}
                        placeholder="เช่น meter1" style={atInputStyle} autoComplete="off"/>
                    </AtField>
                    <AtField label="รหัสผ่าน">
                      <div style={{ position: "relative" }}>
                        <input type={acctShowPass ? "text" : "password"} value={acctForm.password}
                          onChange={e => setAcctForm(f => ({ ...f, password: e.target.value }))}
                          placeholder="กรอกรหัสผ่าน"
                          style={{ ...atInputStyle, paddingRight: 40 }} autoComplete="new-password"/>
                        <button onClick={() => setAcctShowPass(v => !v)} style={{
                          position: "absolute", right: 6, top: 6, width: 28, height: 28, border: "none",
                          background: "transparent", cursor: "pointer", color: "var(--ink-3)", fontSize: 11, fontWeight: 700,
                        }}>{acctShowPass ? "ซ่อน" : "ดู"}</button>
                      </div>
                    </AtField>
                  </div>
                  <AtField label="สิทธิ์การเข้าถึง">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { v: "admin", label: "Admin", desc: "เข้าได้ทุกอย่าง" },
                        { v: "meter", label: "จดมิเตอร์", desc: "เฉพาะหน้าจดมิเตอร์น้ำ-ไฟ" },
                      ].map(opt => (
                        <button key={opt.v} onClick={() => setAcctForm(f => ({ ...f, role: opt.v }))} style={{
                          padding: "10px 12px", textAlign: "left", cursor: "pointer", borderRadius: 11,
                          border: `1.5px solid ${acctForm.role === opt.v ? "var(--brand)" : "var(--line)"}`,
                          background: acctForm.role === opt.v ? "var(--brand-soft)" : "var(--surface)",
                        }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: acctForm.role === opt.v ? "var(--brand-ink)" : "var(--ink)" }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </AtField>
                  {savedFlash && <FlashMsg flash={savedFlash}/>}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => { setAcctAdding(false); setSavedFlash(null); }} style={{
                      padding: "9px 16px", borderRadius: 10, border: "1px solid var(--line)",
                      background: "var(--surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)",
                    }}>ยกเลิก</button>
                    <button onClick={saveAccount} style={{
                      padding: "9px 18px", borderRadius: 10, border: "none",
                      background: "var(--brand)", color: "white", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                    }}>เพิ่มบัญชี</button>
                  </div>
                </div>
              )}

              {/* ── Add button & flash (when not in edit/add mode) ── */}
              {!acctAdding && !acctEditId && (
                <>
                  {savedFlash && <FlashMsg flash={savedFlash}/>}
                  <button onClick={() => {
                    setAcctAdding(true); setAcctEditId(null);
                    setAcctForm({ name: "", username: "", password: "", role: "meter" });
                    setAcctShowPass(false); setSavedFlash(null);
                  }} style={{ padding: "11px 14px", borderRadius: 11,
                    border: "1.5px dashed var(--brand)", background: "var(--brand-soft)", cursor: "pointer",
                    fontSize: 13, fontWeight: 700, color: "var(--brand-ink)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <IconPlus size={14} stroke="var(--brand)"/> เพิ่มบัญชีทีมงานใหม่
                  </button>
                </>
              )}
            </div>
          )}

          {section === "notify" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { k: "slip", label: "สลิปการชำระเงินใหม่", desc: "แจ้งเตือนทันทีเมื่อผู้เช่าแนบสลิป", on: true },
                { k: "repair", label: "แจ้งซ่อมใหม่", desc: "แจ้งเตือนเมื่อมีการแจ้งซ่อม", on: true },
                { k: "due", label: "ผู้เช่าค้างชำระ", desc: "เตือนเมื่อเลยกำหนดชำระ 3 วัน", on: true },
                { k: "meter", label: "ครบกำหนดจดมิเตอร์", desc: "เตือนทุกวันที่ 25 ของเดือน", on: false },
                { k: "summary", label: "สรุปรายเดือน", desc: "ส่งรายงานสรุปทุกต้นเดือน", on: true },
              ].map(t => <NotifToggle key={t.k} {...t}/>)}
              <SettingsFooter onCancel={onClose} onSave={onClose} label="บันทึก"/>
            </div>
          )}

          {section === "banks" && (
            <BanksSettings banks={banks} addBank={addBank} updateBank={updateBank} deleteBank={deleteBank} setPrimaryBank={setPrimaryBank} onClose={onClose}/>
          )}

          {section === "billing" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "12px 14px", background: "var(--brand-soft)", borderRadius: 12,
                display: "flex", alignItems: "flex-start", gap: 10 }}>
                <IconCal size={16} stroke="var(--brand)"/>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  ค่าเช่าจะออกบิลอัตโนมัติทุกวันที่ <b className="num">{billDay}</b> ของเดือน · ครบกำหนดชำระวันที่ <b className="num">{dueDay}</b> ของเดือนถัดไป
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AtField label="วันชำระค่าห้องทุกเดือน" hint="กำหนดส่งภายในวันนี้">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" min={1} max={28} value={dueDay} onChange={e => setDueDay(Number(e.target.value))}
                      style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
                    <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap" }}>ของทุกเดือน</span>
                  </div>
                </AtField>
                <AtField label="วันที่ออกบิลทุกเดือน" hint="วันที่จดมิเตอร์ + ออกบิล">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" min={1} max={28} value={billDay} onChange={e => setBillDay(Number(e.target.value))}
                      style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
                    <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, whiteSpace: "nowrap" }}>ของทุกเดือน</span>
                  </div>
                </AtField>
              </div>

              <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }}/>

              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1 }}>อัตราค่าน้ำ-ไฟ</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AtField label="ค่าไฟ (บาท / หน่วย)">
                  <input type="number" value={elecRate} onChange={e => setElecRate(Number(e.target.value))}
                    style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
                </AtField>
                <AtField label="ค่าน้ำ (บาท / หน่วย)">
                  <input type="number" value={waterRate} onChange={e => setWaterRate(Number(e.target.value))}
                    style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
                </AtField>
              </div>
              {savedFlash && <FlashMsg flash={savedFlash}/>}
              <SettingsFooter onCancel={onClose} onSave={saveBilling} label="บันทึก"/>
            </div>
          )}

          {section === "reset" && (
            <ResetDataPanel resetAllData={resetAllData} onClose={onClose}/>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Factory reset panel ─────────────────────────────────────────────────
function ResetDataPanel({ resetAllData, onClose }) {
  const { ownerPin, ownerUsername, staff } = useData();
  // steps: 0=info  1=enter-password  2=confirm-word  3=running  4=done
  const [step,      setStep]      = useState(0);
  const [passInput, setPassInput] = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [passErr,   setPassErr]   = useState(false);
  const [typed,     setTyped]     = useState("");
  const CONFIRM_WORD = "ยืนยันลบ";

  // Validate password: match any admin staff account OR ownerPin config fallback
  const checkPass = () => {
    const adminUser = ownerUsername || "admin";
    const staffMatch = staff.find(s =>
      s.username.toLowerCase() === adminUser.toLowerCase() && s.password === passInput
    );
    const configMatch = passInput === (ownerPin || "admin1234");
    if (staffMatch || configMatch) {
      setPassErr(false); setStep(2);
    } else {
      setPassErr(true); setTimeout(() => setPassErr(false), 900);
    }
  };

  const doReset = async () => {
    setStep(3);
    await resetAllData();
    setStep(4);
  };

  // ── Done ──
  if (step === 4) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>ตั้งค่าโรงงานเรียบร้อยแล้ว</div>
      <div style={{ fontSize: 13, color: "var(--ink-3)", textAlign: "center", lineHeight: 1.6 }}>
        ลบข้อมูลทั้งหมดแล้ว · ระบบกลับสู่ค่าเริ่มต้นสมบูรณ์
      </div>
      <button onClick={onClose} style={{ marginTop: 8, background: "var(--brand)", color: "white",
        border: "none", borderRadius: 11, padding: "11px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
        ปิดและใช้งาน
      </button>
    </div>
  );

  // ── Running ──
  if (step === 3) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 0" }}>
      <div style={{ width: 40, height: 40, border: "4px solid var(--danger)", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <div style={{ fontSize: 14, color: "var(--ink-2)", fontWeight: 600 }}>กำลังล้างข้อมูล…</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Danger banner ── */}
      <div style={{ background: "var(--danger-soft)", border: "1.5px solid var(--danger)",
        borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>
            คำเตือน: การกระทำนี้ไม่สามารถยกเลิกได้
          </div>
          <div style={{ fontSize: 12.5, color: "oklch(0.45 0.12 25)", lineHeight: 1.6 }}>
            ข้อมูลที่จะถูกลบ <b>ทั้งหมด</b>: ห้องพัก · ผู้เช่า · ผู้เช่าเก่า · การชำระเงิน · สลิป ·
            มิเตอร์น้ำ-ไฟ · แจ้งซ่อม · บัญชีธนาคาร · พนักงาน · โปรไฟล์เจ้าของหอ · ข้อมูลหอพัก
          </div>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{ background: "var(--info-soft)", border: "1px solid var(--info)",
        borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div style={{ fontSize: 12.5, color: "oklch(0.35 0.08 240)", lineHeight: 1.5 }}>
          หลังตั้งค่าโรงงาน ระบบจะกลับสู่ค่าเริ่มต้นสมบูรณ์ — ต้องตั้งค่าหอพัก เพิ่มห้อง และเพิ่มผู้เช่าใหม่ทั้งหมด
        </div>
      </div>

      {/* ── Step 0: Start button ── */}
      {step === 0 && (
        <button onClick={() => setStep(1)} style={{ background: "var(--danger)", color: "white",
          border: "none", borderRadius: 11, padding: "12px", fontWeight: 700, fontSize: 14,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <IconTrash size={16} stroke="white"/> ดำเนินการตั้งค่าโรงงาน
        </button>
      )}

      {/* ── Step 1: Password verification ── */}
      {step === 1 && (
        <div className={passErr ? "shake" : ""} style={{ display: "flex", flexDirection: "column", gap: 12,
          padding: "14px 16px", background: "var(--surface-2)", borderRadius: 13, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconLock size={15} stroke="var(--danger)"/>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>
              ยืนยันตัวตนก่อนดำเนินการ
            </div>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            กรอกรหัสผ่าน Admin เพื่อยืนยันว่าคุณต้องการตั้งค่าโรงงาน
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={passInput}
              onChange={e => setPassInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && passInput && checkPass()}
              placeholder="รหัสผ่าน Admin"
              autoFocus
              style={{ width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10, fontSize: 14,
                border: `2px solid ${passErr ? "var(--danger)" : "var(--line)"}`,
                outline: "none", background: "var(--surface)", color: "var(--ink)", boxSizing: "border-box",
                fontFamily: "var(--font-num)", transition: "border-color .15s" }}
            />
            <button onClick={() => setShowPass(v => !v)} style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              width: 28, height: 28, border: "none", background: "transparent",
              cursor: "pointer", color: "var(--ink-3)", fontSize: 11, fontWeight: 700,
            }}>{showPass ? "ซ่อน" : "ดู"}</button>
          </div>
          {passErr && (
            <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>
              รหัสผ่านไม่ถูกต้อง — กรุณาลองอีกครั้ง
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep(0); setPassInput(""); setPassErr(false); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface)", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--ink-2)" }}>
              ยกเลิก
            </button>
            <button onClick={checkPass} disabled={!passInput}
              style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none",
                background: passInput ? "var(--danger)" : "var(--line)",
                color: passInput ? "white" : "var(--ink-4)",
                fontWeight: 700, fontSize: 13, cursor: passInput ? "pointer" : "not-allowed" }}>
              ยืนยันรหัสผ่าน →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm word ── */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12,
          padding: "14px 16px", background: "var(--surface-2)", borderRadius: 13, border: "1px solid var(--line)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)" }}>
            ขั้นตอนสุดท้าย — ยืนยันการลบ
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            พิมพ์ <b style={{ color: "var(--danger)", letterSpacing: 1 }}>{CONFIRM_WORD}</b> เพื่อดำเนินการต่อ
          </div>
          <input
            value={typed} onChange={e => setTyped(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoFocus
            style={{ padding: "10px 14px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              border: `2px solid ${typed === CONFIRM_WORD ? "var(--danger)" : "var(--line)"}`,
              outline: "none", background: "var(--surface)", color: "var(--ink)",
              textAlign: "center", letterSpacing: 2 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep(0); setTyped(""); setPassInput(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--line)",
                background: "var(--surface)", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--ink-2)" }}>
              ยกเลิก
            </button>
            <button onClick={doReset} disabled={typed !== CONFIRM_WORD}
              style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none",
                background: typed === CONFIRM_WORD ? "var(--danger)" : "var(--line)",
                color: typed === CONFIRM_WORD ? "white" : "var(--ink-4)",
                fontWeight: 700, fontSize: 13, cursor: typed === CONFIRM_WORD ? "pointer" : "not-allowed",
                transition: "background .2s" }}>
              🗑️ ลบข้อมูลทั้งหมดถาวร
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Staff (team accounts) settings panel ──────────────────────────────
function StaffSettings({ staff, addStaff, updateStaff, deleteStaff }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ username: "", password: "", role: "meter", name: "" });
  const [flash, setFlash] = useState(null);

  const startAdd = () => { setForm({ username: "", password: "", role: "meter", name: "" }); setAdding(true); setEditId(null); setFlash(null); };
  const startEdit = (s) => { setForm({ username: s.username, password: s.password, role: s.role, name: s.name || "" }); setEditId(s.id); setAdding(false); setFlash(null); };
  const cancel = () => { setAdding(false); setEditId(null); setFlash(null); };

  const save = async () => {
    const u = form.username.trim();
    if (!u || !form.password) { setFlash({ kind: "error", msg: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }); return; }
    const dup = staff.find(s => s.username.toLowerCase() === u.toLowerCase() && s.id !== editId);
    if (dup) { setFlash({ kind: "error", msg: "ชื่อผู้ใช้นี้มีอยู่แล้ว" }); return; }
    if (editId) {
      await updateStaff(editId, { username: u, password: form.password, role: form.role, name: form.name });
      setFlash({ kind: "ok", msg: "บันทึกการแก้ไขเรียบร้อย" });
    } else {
      await addStaff({ username: u, password: form.password, role: form.role, name: form.name });
      setFlash({ kind: "ok", msg: "เพิ่มทีมงานเรียบร้อย" });
    }
    setAdding(false); setEditId(null);
  };

  const remove = async (s) => {
    if (!window.confirm(`ลบบัญชี "${s.username}"?`)) return;
    await deleteStaff(s.id);
    setFlash({ kind: "ok", msg: `ลบ "${s.username}" แล้ว` });
    if (editId === s.id) cancel();
  };

  const editing = adding || editId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ padding: "12px 14px", background: "var(--brand-soft)", borderRadius: 12,
        display: "flex", alignItems: "flex-start", gap: 10 }}>
        <IconUsers size={16} stroke="var(--brand)"/>
        <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
          เพิ่มทีมงานเพื่อแยกสิทธิ์การเข้าถึง · <b>Admin</b> เข้าได้ทุกอย่าง · <b>จดมิเตอร์</b> เข้าได้เฉพาะหน้าจดเลขมิเตอร์น้ำ-ไฟ
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {staff.length === 0 && (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--ink-4)", fontSize: 13,
            border: "1px dashed var(--line)", borderRadius: 12 }}>
            ยังไม่มีทีมงาน — กดปุ่มด้านล่างเพื่อเพิ่ม
          </div>
        )}
        {staff.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10,
              background: s.role === "admin" ? "var(--brand-soft)" : "var(--surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              {s.role === "admin"
                ? <IconLock size={15} stroke="var(--brand)"/>
                : <IconSparkle size={15} stroke="var(--ink-3)"/>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis" }}>
                {s.name || s.username}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>
                @{s.username} · {s.role === "admin" ? "Admin (เข้าได้ทุกอย่าง)" : "จดมิเตอร์"}
              </div>
            </div>
            <button onClick={() => startEdit(s)} style={{ padding: "6px 10px", borderRadius: 9,
              border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer",
              fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)" }}>แก้ไข</button>
            <button onClick={() => remove(s)} style={{ width: 30, height: 30, borderRadius: 9,
              border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--danger)" }}>
              <IconTrash size={13}/>
            </button>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {editing && (
        <div style={{ padding: "14px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 12,
          display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {editId ? "แก้ไขทีมงาน" : "เพิ่มทีมงานใหม่"}
          </div>
          <AtField label="ชื่อ-นามสกุล (optional)">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="เช่น สมชาย ใจดี" style={atInputStyle}/>
          </AtField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <AtField label="ชื่อผู้ใช้ (สำหรับ login)">
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="เช่น meter1" style={atInputStyle} autoComplete="off"/>
            </AtField>
            <AtField label="รหัสผ่าน">
              <input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="กรอกรหัสผ่าน" style={atInputStyle} autoComplete="new-password"/>
            </AtField>
          </div>
          <AtField label="สิทธิ์การเข้าถึง">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { v: "admin", label: "Admin", desc: "เข้าได้ทุกอย่าง" },
                { v: "meter", label: "จดมิเตอร์", desc: "เฉพาะหน้าจดมิเตอร์น้ำ-ไฟ" },
              ].map(opt => (
                <button key={opt.v} onClick={() => setForm(f => ({ ...f, role: opt.v }))} style={{
                  padding: "10px 12px", textAlign: "left", cursor: "pointer",
                  border: `1.5px solid ${form.role === opt.v ? "var(--brand)" : "var(--line)"}`,
                  background: form.role === opt.v ? "var(--brand-soft)" : "var(--surface)",
                  borderRadius: 11,
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: form.role === opt.v ? "var(--brand-ink)" : "var(--ink)" }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </AtField>
          {flash && <FlashMsg flash={flash}/>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={cancel} style={{ padding: "9px 16px", borderRadius: 10,
              border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer",
              fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>ยกเลิก</button>
            <button onClick={save} style={{ padding: "9px 18px", borderRadius: 10, border: "none",
              background: "var(--brand)", color: "white", cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>
              {editId ? "บันทึก" : "เพิ่มทีมงาน"}
            </button>
          </div>
        </div>
      )}

      {!editing && (
        <>
          {flash && <FlashMsg flash={flash}/>}
          <button onClick={startAdd} style={{ padding: "11px 14px", borderRadius: 11,
            border: "1.5px dashed var(--brand)", background: "var(--brand-soft)", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: "var(--brand-ink)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconPlus size={14}/> เพิ่มทีมงานใหม่
          </button>
        </>
      )}
    </div>
  );
}

function FlashMsg({ flash }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 11,
      background: flash.kind === "ok" ? "var(--ok-soft)" : "var(--danger-soft)",
      color: flash.kind === "ok" ? "var(--ok)" : "var(--danger)",
      fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
      {flash.kind === "ok" ? <IconCheck size={15} stroke="var(--ok)"/> : <IconX size={15} stroke="var(--danger)"/>}
      {flash.msg}
    </div>
  );
}

// ─── BANK SETTINGS COMPONENT ─────────────────────────────────────────────
const BANK_PRESETS = [
  { short: "KBANK", bank: "ธนาคารกสิกรไทย",    color: "oklch(0.7 0.14 145)" },
  { short: "SCB",   bank: "ธนาคารไทยพาณิชย์",  color: "oklch(0.55 0.18 310)" },
  { short: "KTB",   bank: "ธนาคารกรุงไทย",      color: "oklch(0.62 0.16 220)" },
  { short: "BBL",   bank: "ธนาคารกรุงเทพ",       color: "oklch(0.40 0.15 250)" },
  { short: "BAY",   bank: "ธนาคารกรุงศรีอยุธยา", color: "oklch(0.65 0.17 35)" },
  { short: "TTB",   bank: "ทีทีบี",               color: "oklch(0.58 0.14 220)" },
  { short: "PP",    bank: "พร้อมเพย์ (PromptPay)", color: "oklch(0.7 0.14 25)" },
];

function BanksSettings({ banks, addBank, updateBank, deleteBank, setPrimaryBank, onClose }) {
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ bank: "", name: "", number: "", short: "", color: "oklch(0.7 0.14 145)", qrImage: "" });
  const [adding, setAdding] = useState(false);
  const [flash, setFlash] = useState(null);

  const pickQr = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 4 * 1024 * 1024) { alert("ไฟล์ใหญ่เกิน 4MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(prev => ({ ...prev, qrImage: ev.target.result }));
    reader.readAsDataURL(f);
  };

  const openEdit = (b) => { setEditId(b.id); setForm({ bank: b.bank, name: b.name, number: b.number, short: b.short || "", color: b.color, qrImage: b.qrImage || "" }); setAdding(false); };
  const openAdd = () => { setAdding(true); setEditId(null); setForm({ bank: BANK_PRESETS[0].bank, name: "", number: "", short: BANK_PRESETS[0].short, color: BANK_PRESETS[0].color, qrImage: "" }); };
  const cancel = () => { setEditId(null); setAdding(false); };

  const saveEdit = async () => {
    if (!form.bank || !form.number) return;
    const res = await updateBank(editId, form);
    if (res?.ok === false) {
      setFlash({ kind: "error", msg: `บันทึกไม่สำเร็จ — ${res.msg}` });
      setTimeout(() => setFlash(null), 4000);
      return;
    }
    setEditId(null);
    setFlash({ kind: "ok", msg: "บันทึกบัญชีธนาคารเรียบร้อย" });
    setTimeout(() => setFlash(null), 2000);
  };
  const saveAdd = async () => {
    if (!form.bank || !form.number) return;
    const res = await addBank(form);
    if (res?.ok === false) {
      setFlash({ kind: "error", msg: `เพิ่มบัญชีไม่สำเร็จ — ${res.msg}` });
      setTimeout(() => setFlash(null), 4000);
      return;
    }
    setAdding(false);
    setFlash({ kind: "ok", msg: "เพิ่มบัญชีธนาคารเรียบร้อย" });
    setTimeout(() => setFlash(null), 2000);
  };

  const bankFormJsx = (onSave) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "14px 14px", borderRadius: 12, background: "var(--surface)", border: "1px dashed var(--brand)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", marginBottom: 4 }}>เลือกธนาคาร</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
        {BANK_PRESETS.map(p => {
          const sel = form.bank === p.bank;
          return (
            <button key={p.short} onClick={() => setForm(f => ({ ...f, bank: p.bank, short: p.short, color: p.color }))} style={{
              padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11.5, fontWeight: 600,
              border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
              background: sel ? "var(--brand-soft)" : "var(--surface-2)", color: sel ? "var(--brand-ink)" : "var(--ink-2)",
            }}>{p.short}</button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <AtField label="ชื่อเจ้าของบัญชี">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="เช่น นายสมพร เจริญสุข" style={atInputStyle}/>
        </AtField>
        <AtField label="เลขบัญชี / หมายเลขพร้อมเพย์">
          <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="xxx-x-xxxxx-x" style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
        </AtField>
      </div>
      {/* QR Code / payment image */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>รูป QR Code <span style={{ fontWeight: 400, color: "var(--ink-4)" }}>(ไม่บังคับ)</span></div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>ผู้เช่าจะเห็นรูปนี้เมื่อกดดู QR — ใช้สำหรับสแกนโอนเงิน</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {form.qrImage ? (
            <>
              <img src={form.qrImage} alt="QR" style={{ width: 92, height: 92, objectFit: "contain",
                borderRadius: 10, border: "1px solid var(--line)", background: "white", flexShrink: 0 }}/>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
                <span style={{ fontSize: 11.5, color: "var(--ok)", fontWeight: 600 }}>✓ มีรูป QR แล้ว</span>
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer",
                  fontSize: 11.5, color: "var(--brand)", fontWeight: 600 }}>
                  <IconEdit size={12} stroke="var(--brand)"/> เปลี่ยนรูป
                  <input type="file" accept="image/*" onChange={pickQr} style={{ display: "none" }}/>
                </label>
                <button onClick={() => setForm(f => ({ ...f, qrImage: "" }))} style={{
                  fontSize: 11.5, color: "var(--danger)", background: "none",
                  border: "1px solid var(--danger)", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontWeight: 600,
                }}>ลบรูป</button>
              </div>
            </>
          ) : (
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              width: 92, height: 92, borderRadius: 10, border: "1.5px dashed var(--line)",
              cursor: "pointer", gap: 5, background: "var(--surface-2)",
            }}>
              <IconPlus size={22} stroke="var(--ink-4)"/>
              <span style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>เพิ่มรูป<br/>QR Code</span>
              <input type="file" accept="image/*" onChange={pickQr} style={{ display: "none" }}/>
            </label>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
        <button onClick={cancel} style={detailBtn("ghost")}>ยกเลิก</button>
        <button onClick={onSave} style={detailBtn("primary")}><IconCheck size={13} stroke="white"/> บันทึก</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ padding: "12px 14px", background: "var(--brand-soft)", borderRadius: 12,
        display: "flex", alignItems: "flex-start", gap: 10 }}>
        <IconCard size={16} stroke="var(--brand)"/>
        <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
          บัญชีธนาคารที่เพิ่มไว้จะแสดงในหน้าชำระเงินของผู้เช่าทุกคน
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {banks.map(b => editId === b.id ? bankFormJsx(saveEdit) : (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: b.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 11, textAlign: "center", letterSpacing: 0 }}>
              {b.short || b.bank.slice(0,2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{b.bank}</div>
              <div className="num" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{b.number}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{b.name}</div>
            </div>
            {b.primary && <span style={{ background: "var(--brand-soft)", color: "var(--brand-ink)", fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 100 }}>หลัก</span>}
            {!b.primary && <button onClick={() => setPrimaryBank(b.id)} style={{ ...detailBtn("ghost"), padding: "5px 10px", fontSize: 11.5 }}>ตั้งเป็นหลัก</button>}
            {b.qrImage ? (
              <img src={b.qrImage} alt="QR" title="มี QR Code" style={{ width: 34, height: 34, borderRadius: 8,
                objectFit: "contain", border: "1px solid var(--line)", background: "white", flexShrink: 0 }}/>
            ) : (
              <div title="ยังไม่มี QR Code" style={{ width: 34, height: 34, borderRadius: 8,
                border: "1px dashed var(--line)", background: "var(--surface-2)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 14, color: "var(--ink-4)" }}>QR</div>
            )}
            <button onClick={() => openEdit(b)} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconEdit size={14} stroke="var(--ink-3)"/>
            </button>
            <button onClick={() => { if (confirm(`ลบบัญชี ${b.bank}?`)) deleteBank(b.id); }} style={{ width: 32, height: 32, borderRadius: 9, border: "1px dashed var(--danger)", background: "var(--danger-soft)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconTrash size={14} stroke="var(--danger)"/>
            </button>
          </div>
        ))}
        {adding && bankFormJsx(saveAdd)}
        {!adding && !editId && (
          <button onClick={openAdd} style={{ padding: "11px 16px", borderRadius: 12, border: "1.5px dashed var(--line)", background: "var(--surface)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <IconPlus size={15} stroke="var(--brand)"/> เพิ่มบัญชีธนาคาร
          </button>
        )}
      </div>
      {flash && <FlashMsg flash={flash}/>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={onClose} style={detailBtn("primary")}><IconCheck size={14} stroke="white"/> เสร็จสิ้น</button>
      </div>
    </div>
  );
}

// ─── BULK METER MODAL ─────────────────────────────────────────────────────
export function BulkMeterModal({ onClose }) {
  const { rooms, tenants, utils, bulkSaveUtils } = useData();

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const [viewY, setViewY] = useState(CUR_Y);
  const [viewM, setViewM] = useState(CUR_M);
  const [saved, setSaved] = useState(false);

  // Rooms that had a tenant during (y, m) — respects move-in date and eviction date
  const byRoomId = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  const liveAt = (y, m) => rooms.filter(r =>
    tenants.some(t => {
      const inRoom = t.room === r.id || (t.evicted && t.prevRoom === r.id);
      if (!inRoom) return false;
      const movedIn = t.sinceY < y || (t.sinceY === y && t.sinceM <= m);
      if (!movedIn) return false;
      if (t.evicted && t.evictedY != null) {
        const evictedBefore = t.evictedY < y || (t.evictedY === y && (t.evictedM ?? 0) < m);
        if (evictedBefore) return false;
      }
      return true;
    })
  ).sort(byRoomId);

  const live = liveAt(viewY, viewM);

  const buildInitial = (y, m) => {
    const init = {};
    liveAt(y, m).forEach(r => {
      const prevRead = utils
        .filter(u => u.room_id === r.id && (u.year < y || (u.year === y && u.month < m)))
        .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)[0];
      const existing = utils.find(u => u.room_id === r.id && u.year === y && u.month === m);
      init[r.id] = {
        elecPrev:  prevRead?.elec_cur  ?? 0,
        waterPrev: prevRead?.water_cur ?? 0,
        elecCur:   existing ? String(existing.elec_cur)  : "",
        waterCur:  existing ? String(existing.water_cur) : "",
      };
    });
    return init;
  };

  const [readings, setReadings] = useState(() => buildInitial(CUR_Y, CUR_M));

  const changeMonth = (y, m) => {
    setViewY(y); setViewM(m);
    setReadings(buildInitial(y, m));
    setSaved(false);
  };

  const goPrev = () => viewM === 0 ? changeMonth(viewY - 1, 11) : changeMonth(viewY, viewM - 1);
  const goNext = () => {
    if (viewY > CUR_Y || (viewY === CUR_Y && viewM >= CUR_M)) return;
    viewM === 11 ? changeMonth(viewY + 1, 0) : changeMonth(viewY, viewM + 1);
  };
  const isCurrent = viewY === CUR_Y && viewM === CUR_M;

  const set = (rid, key, val) => setReadings(prev => ({ ...prev, [rid]: { ...prev[rid], [key]: val } }));

  const totals = live.reduce((acc, r) => {
    const x = readings[r.id];
    const eu = Math.max(0, Number(x.elecCur || 0) - x.elecPrev);
    const wu = Math.max(0, Number(x.waterCur || 0) - x.waterPrev);
    acc.elec += eu; acc.water += wu;
    acc.amount += eu * UTIL_RATE.electric + wu * UTIL_RATE.water;
    if (x.elecCur && x.waterCur) acc.done += 1;
    return acc;
  }, { elec: 0, water: 0, amount: 0, done: 0 });

  const exportRows = () => {
    const head = ["ห้อง","ผู้เช่า","ไฟ_ก่อน","ไฟ_ล่าสุด","ไฟ_หน่วย","น้ำ_ก่อน","น้ำ_ล่าสุด","น้ำ_หน่วย","ค่าไฟ","ค่าน้ำ","รวม"];
    const rows = live.map(r => {
      const x = readings[r.id];
      const t = tenants.find(t => t.room === r.id);
      const eu = Math.max(0, Number(x.elecCur || 0) - x.elecPrev);
      const wu = Math.max(0, Number(x.waterCur || 0) - x.waterPrev);
      return [r.id, t?.name || "—", x.elecPrev, x.elecCur, eu, x.waterPrev, x.waterCur, wu,
        eu * UTIL_RATE.electric, wu * UTIL_RATE.water,
        eu * UTIL_RATE.electric + wu * UTIL_RATE.water];
    });
    downloadCsv(`มิเตอร์-${MONTHS_TH[viewM]}-${viewY}.csv`, [head, ...rows]);
  };

  const saveAll = () => {
    const filled = live
      .filter(r => readings[r.id].elecCur && readings[r.id].waterCur)
      .map(r => ({
        room_id: r.id, year: viewY, month: viewM,
        elec_cur: Number(readings[r.id].elecCur),
        water_cur: Number(readings[r.id].waterCur),
      }));
    if (filled.length) bulkSaveUtils(filled);
    setSaved(true);
    setTimeout(onClose, 1100);
  };

  // ── Shared header nav ──────────────────────────────────────────────
  const navBtn = (onClick, disabled, icon) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 34, height: 34, borderRadius: 10, border: "1px solid var(--line)",
      background: "var(--surface-2)", cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.35 : 1,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>{icon}</button>
  );

  // ── MOBILE layout ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column",
      }} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{
          marginTop: "auto", background: "var(--bg)", borderRadius: "20px 20px 0 0",
          maxHeight: "92dvh", height: "92dvh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
        }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--line)" }}>
            {/* drag handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--line)",
              margin: "0 auto 14px" }}/>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-soft)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconSparkle size={18} stroke="var(--brand)"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>
                  จดมิเตอร์รวม
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>
                  กรอกแล้ว {totals.done}/{live.length} ห้อง
                </div>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--surface-2)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconX size={14} stroke="var(--ink-3)"/>
              </button>
            </div>
            {/* Month nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              {navBtn(goPrev, false, <IconArrowLeft size={13} stroke="var(--ink-2)"/>)}
              <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 700 }}>
                {dl(viewY, viewM)}
              </div>
              {navBtn(goNext, isCurrent, <IconArrowRight size={13} stroke="var(--ink-2)"/>)}
              {!isCurrent && (
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--warn)",
                  background: "var(--warn-soft)", padding: "2px 9px", borderRadius: 100 }}>
                  ย้อนหลัง
                </span>
              )}
            </div>
          </div>

          {/* Room cards scroll */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {live.map(r => {
              const x = readings[r.id];
              const t = tenants.find(t => t.room === r.id);
              const eu = Math.max(0, Number(x.elecCur || 0) - x.elecPrev);
              const wu = Math.max(0, Number(x.waterCur || 0) - x.waterPrev);
              const amt = eu * UTIL_RATE.electric + wu * UTIL_RATE.water;
              const done = x.elecCur !== "" && x.waterCur !== "";
              return (
                <div key={r.id} style={{
                  background: "var(--surface)", border: `1.5px solid ${done ? "var(--ok)" : "var(--line)"}`,
                  borderRadius: 13, overflow: "hidden",
                }}>
                  {/* Card header — compact single row */}
                  <div style={{ padding: "7px 10px",
                    background: done ? "var(--ok-soft)" : "var(--surface-2)",
                    display: "flex", alignItems: "center", gap: 8,
                    borderBottom: "1px solid var(--line)" }}>
                    <div className="num" style={{ width: 30, height: 30, borderRadius: 8,
                      background: done ? "var(--ok)" : "var(--surface)", border: "1.5px solid var(--line)",
                      color: done ? "white" : "var(--ink-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      {r.id}
                    </div>
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, minWidth: 0,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t?.name || "—"}
                    </span>
                    <span style={{ fontSize: 10.5, color: "var(--ink-3)", flexShrink: 0 }}>ชั้น {r.floor}</span>
                    {done && <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ok)", flexShrink: 0 }}>✓</span>}
                  </div>

                  {/* Elec + Water inputs — compact */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {[
                      { emoji: "⚡", label: "ไฟ", prev: x.elecPrev, cur: x.elecCur, use: eu,
                        rate: UTIL_RATE.electric, key: "elecCur",
                        borderCol: "oklch(0.72 0.13 80)", textCol: "oklch(0.48 0.13 80)", borderRight: true },
                      { emoji: "💧", label: "น้ำ", prev: x.waterPrev, cur: x.waterCur, use: wu,
                        rate: UTIL_RATE.water, key: "waterCur",
                        borderCol: "oklch(0.65 0.12 230)", textCol: "oklch(0.40 0.13 230)", borderRight: false },
                    ].map(f => (
                      <div key={f.key} style={{ padding: "8px 10px",
                        borderRight: f.borderRight ? "1px solid var(--line)" : "none" }}>
                        {/* label row: icon + label + prev */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                          <span style={{ fontSize: 11 }}>{f.emoji}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: f.textCol }}>{f.label}</span>
                          <span style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: "auto" }}>
                            ก่อน <span className="num" style={{ fontWeight: 700, color: "var(--ink-3)" }}>{f.prev}</span>
                          </span>
                        </div>
                        {/* input */}
                        <input
                          type="number" inputMode="numeric" value={f.cur}
                          onChange={e => set(r.id, f.key, e.target.value)}
                          placeholder={String(f.prev)}
                          style={{ width: "100%", padding: "7px 8px", borderRadius: 8,
                            border: `1.5px solid ${f.cur ? f.borderCol : "var(--line)"}`,
                            background: "white", fontSize: 16, fontWeight: 800, color: "var(--ink)",
                            outline: "none", boxSizing: "border-box",
                            fontFamily: "var(--font-num)", fontVariantNumeric: "tabular-nums" }}
                        />
                        {/* use + amount */}
                        {f.cur !== "" && (
                          <div style={{ marginTop: 4, fontSize: 10.5, color: f.textCol, fontWeight: 700,
                            display: "flex", justifyContent: "space-between" }}>
                            <span className="num">{f.use} หน่วย</span>
                            <span className="num">{baht(f.use * f.rate)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total row — only when done */}
                  {done && (
                    <div style={{ padding: "5px 10px", background: "var(--ok-soft)",
                      borderTop: "1px solid var(--line)",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "var(--ok)", fontWeight: 700 }}>รวม</span>
                      <span className="num" style={{ fontSize: 14, fontWeight: 800, color: "var(--ok)" }}>
                        {baht(amt)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ height: 4 }}/>
          </div>

          {/* Sticky footer */}
          <div style={{ padding: "12px 14px 20px", borderTop: "1px solid var(--line)",
            background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>ยอดรวมทุกห้อง</div>
                <div className="num" style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>
                  {baht(totals.amount)}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>
                  ⚡ {totals.elec} หน่วย &nbsp;·&nbsp; 💧 {totals.water} หน่วย
                </div>
              </div>
              {saved && (
                <span style={{ fontSize: 12, color: "var(--ok)", fontWeight: 700,
                  background: "var(--ok-soft)", padding: "6px 12px", borderRadius: 100 }}>
                  ✓ บันทึกแล้ว
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={exportRows} style={{ flex: 1, padding: "12px 0", borderRadius: 12,
                border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer",
                fontSize: 13.5, fontWeight: 700, color: "var(--ink-2)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <IconDownload size={15}/> CSV
              </button>
              <button onClick={saveAll} style={{ flex: 2, padding: "12px 0", borderRadius: 12,
                border: "none", background: "var(--brand)", cursor: "pointer",
                fontSize: 14, fontWeight: 700, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <IconCheck size={16} stroke="white"/> บันทึกทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP layout ─────────────────────────────────────────────────
  return (
    <ModalShell onClose={onClose} width={860}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconSparkle size={20} stroke="var(--brand)"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            {navBtn(goPrev, false, <IconArrowLeft size={13} stroke="var(--ink-2)"/>)}
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2, minWidth: 160 }}>
              จดมิเตอร์รวม · {dl(viewY, viewM)}
            </div>
            {navBtn(goNext, isCurrent, <IconArrowRight size={13} stroke="var(--ink-2)"/>)}
            {!isCurrent && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--warn)",
                background: "var(--warn-soft)", padding: "2px 9px", borderRadius: 100 }}>
                ย้อนหลัง
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            กรอกเลขมิเตอร์ของทุกห้องในคราวเดียว · กรอกแล้ว {totals.done}/{live.length} ห้อง
          </div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "16px 24px", maxHeight: 460, overflow: "auto" }}>
        <div style={{ background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.4fr 0.9fr 0.9fr 0.7fr 0.9fr 0.9fr 0.7fr 0.9fr",
            padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
            textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid var(--line)" }}>
            <span>ห้อง</span><span>ผู้เช่า</span><span>ไฟ ก่อน</span><span>ไฟ ล่าสุด</span><span>หน่วย</span>
            <span>น้ำ ก่อน</span><span>น้ำ ล่าสุด</span><span>หน่วย</span><span style={{textAlign:"right"}}>รวม</span>
          </div>
          {live.map((r, i) => {
            const x = readings[r.id];
            const t = tenants.find(t => t.room === r.id);
            const eu = Math.max(0, Number(x.elecCur || 0) - x.elecPrev);
            const wu = Math.max(0, Number(x.waterCur || 0) - x.waterPrev);
            const amt = eu * UTIL_RATE.electric + wu * UTIL_RATE.water;
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "0.7fr 1.4fr 0.9fr 0.9fr 0.7fr 0.9fr 0.9fr 0.7fr 0.9fr",
                padding: "10px 14px", borderBottom: i < live.length - 1 ? "1px solid var(--line)" : "none",
                background: "var(--surface)", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span className="num" style={{ fontWeight: 700 }}>{r.id}</span>
                <span style={{ color: "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</span>
                <span className="num" style={{ color: "var(--ink-3)" }}>{x.elecPrev}</span>
                <input type="number" value={x.elecCur} onChange={e => set(r.id, "elecCur", e.target.value)}
                  style={{ ...atInputStyle, padding: "6px 8px", fontSize: 12, fontFamily: "var(--font-num)" }}/>
                <span className="num" style={{ fontWeight: 700, color: eu > 0 ? "oklch(0.55 0.15 80)" : "var(--ink-4)" }}>{eu || "—"}</span>
                <span className="num" style={{ color: "var(--ink-3)" }}>{x.waterPrev}</span>
                <input type="number" value={x.waterCur} onChange={e => set(r.id, "waterCur", e.target.value)}
                  style={{ ...atInputStyle, padding: "6px 8px", fontSize: 12, fontFamily: "var(--font-num)" }}/>
                <span className="num" style={{ fontWeight: 700, color: wu > 0 ? "oklch(0.55 0.13 230)" : "var(--ink-4)" }}>{wu || "—"}</span>
                <span className="num" style={{ textAlign: "right", fontWeight: 700, color: amt > 0 ? "var(--ink)" : "var(--ink-4)" }}>
                  {amt > 0 ? baht(amt) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "var(--surface-2)",
        display: "flex", alignItems: "center", gap: 12, borderRadius: "0 0 20px 20px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>ยอดรวม</div>
          <div className="num" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
            {baht(totals.amount)} <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 500 }}>
              · ไฟ {totals.elec} หน่วย · น้ำ {totals.water} หน่วย
            </span>
          </div>
        </div>
        {saved && <span style={{ fontSize: 12, color: "var(--ok)", fontWeight: 700,
          background: "var(--ok-soft)", padding: "5px 10px", borderRadius: 100 }}>✓ บันทึก & ส่งออกแล้ว</span>}
        <button onClick={exportRows} style={detailBtn("ghost")}>
          <IconDownload size={14}/> ส่งออก CSV
        </button>
        <button onClick={saveAll} style={detailBtn("primary")}>
          <IconCheck size={14} stroke="white"/> บันทึกทั้งหมด
        </button>
      </div>
    </ModalShell>
  );
}

// ─── MONTH DETAIL MODAL ──────────────────────────────────────────────────
export function MonthDetailModal({ monthKey, onClose }) {
  const { tenants, payments, utils, slips } = useData();
  const { year, month } = monthKey;

  // Helper: was this tenant living in the room during the given year/month?
  const wasInRoom = (t, y, m) => {
    if (t.sinceY == null) return false;
    if (y < t.sinceY || (y === t.sinceY && m < t.sinceM)) return false;
    if (t.evicted && t.evictedY != null) {
      if (y > t.evictedY || (y === t.evictedY && m > t.evictedM)) return false;
    }
    return true;
  };
  // Find the tenant who was in the given room during the specified year/month (current or evicted)
  const findTenantAt = (room_id, y, m) => tenants.find(t =>
    (t.room === room_id || (t.evicted && t.prevRoom === room_id)) && wasInRoom(t, y, m)
  );

  // Only include payments where someone was actually living in the room during that month.
  // This hides orphaned payment records left from previous tenants.
  const pays = payments.filter(p =>
    p.year === year && p.month === month && findTenantAt(p.room_id, p.year, p.month) != null
  );
  const monUtils = utils.filter(u => u.year === year && u.month === month);
  const monSlips = slips.filter(s => s.year === year && s.month === month);

  const rev = pays.filter(p => p.status === "ชำระแล้ว").reduce((s, p) => s + p.amount, 0);
  const due = pays.filter(p => p.status === "รอชำระ").reduce((s, p) => s + p.amount, 0);
  const utilRev = monUtils.reduce((s, u) => s + u.elec_amount + u.water_amount, 0);

  const exportMonth = () => {
    const head = ["ห้อง","ผู้เช่า","ค่าเช่า","สถานะค่าเช่า","วันชำระ","ค่าไฟหน่วย","ค่าน้ำหน่วย","ค่าน้ำไฟรวม","รวมทั้งสิ้น"];
    const rows = pays.map(p => {
      const t = findTenantAt(p.room_id, p.year, p.month);
      const u = monUtils.find(u => u.room_id === p.room_id);
      const ut = u ? u.elec_amount + u.water_amount : 0;
      return [p.room_id, t?.name || "—", p.amount, p.status, p.paid_at || "—",
        u?.elec_use || 0, u?.water_use || 0, ut, p.amount + ut];
    });
    downloadCsv(`รายงาน-${MONTHS_TH[month]}-${year}.csv`, [head, ...rows]);
  };

  return (
    <ModalShell onClose={onClose} width={820}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14,
          background: "linear-gradient(140deg, var(--brand), var(--brand-2))",
          color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 9, opacity: 0.85, fontWeight: 700 }}>{year}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{MONTHS_TH[month]}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2 }}>รายงาน {MONTHS_FULL[month]} {year}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
            {pays.length} บิล · เก็บได้ {pays.filter(p => p.status === "ชำระแล้ว").length} · ค้าง {pays.filter(p => p.status === "รอชำระ").length}
          </div>
        </div>
        <button onClick={exportMonth} style={detailBtn("ghost")}>
          <IconDownload size={14}/> ส่งออก
        </button>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <MiniStat2 label="ค่าเช่าเก็บได้" value={baht(rev)} tone="ok"/>
        <MiniStat2 label="ค่าน้ำ-ไฟ" value={baht(utilRev)} tone="brand"/>
        <MiniStat2 label="ค้างชำระ" value={baht(due)} tone="warn"/>
        <MiniStat2 label="สลิปรอ" value={monSlips.filter(s => s.status === "pending").length} tone="lilac"/>
      </div>

      <div style={{ padding: "4px 24px 20px", maxHeight: 360, overflow: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase",
          letterSpacing: 1, margin: "8px 0 10px" }}>รายละเอียดรายห้อง</div>
        <div style={{ background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "0.7fr 1.6fr 1fr 1fr 1fr 1fr 0.9fr",
            padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
            textTransform: "uppercase", letterSpacing: 0.8, borderBottom: "1px solid var(--line)" }}>
            <span>ห้อง</span><span>ผู้เช่า</span><span>ค่าเช่า</span><span>น้ำ-ไฟ</span><span>รวม</span><span>สถานะ</span><span style={{textAlign:"right"}}>วันชำระ</span>
          </div>
          {pays.map((p, i) => {
            const t = findTenantAt(p.room_id, p.year, p.month);
            const u = monUtils.find(u => u.room_id === p.room_id);
            const ut = u ? u.elec_amount + u.water_amount : 0;
            const paid = p.status === "ชำระแล้ว";
            return (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "0.7fr 1.6fr 1fr 1fr 1fr 1fr 0.9fr",
                padding: "11px 14px", borderBottom: i < pays.length - 1 ? "1px solid var(--line)" : "none",
                background: "var(--surface)", alignItems: "center", fontSize: 12.5 }}>
                <span className="num" style={{ fontWeight: 700 }}>{p.room_id}</span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</span>
                <span className="num" style={{ fontWeight: 600 }}>{baht(p.amount)}</span>
                <span className="num" style={{ color: "var(--ink-3)" }}>{ut ? baht(ut) : "—"}</span>
                <span className="num" style={{ fontWeight: 700 }}>{baht(p.amount + ut)}</span>
                <span>
                  <span style={{ background: paid ? "var(--ok-soft)" : "var(--warn-soft)",
                    color: paid ? "var(--ok)" : "var(--warn)", fontSize: 10.5, fontWeight: 700,
                    padding: "2px 8px", borderRadius: 100 }}>
                    {paid ? "✓ ชำระแล้ว" : "⏳ รอชำระ"}
                  </span>
                </span>
                <span className="num" style={{ textAlign: "right", color: "var(--ink-3)", fontSize: 11.5 }}>{p.paid_at || "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}

// ─── RECEIPT MODAL ───────────────────────────────────────────────────────
export function ReceiptModal({ payment, onClose }) {
  const { tenants, rooms, utils, owner, utilRate } = useData();
  const tenant = tenants.find(t => t.room === payment.room_id);
  const room   = rooms.find(r => r.id === payment.room_id);
  const util   = utils.find(u =>
    u.room_id === payment.room_id && u.year === payment.year && u.month === payment.month && !u.isInitial
  );

  const receiptNo   = `REC-${payment.year}-${payment.room_id}-${String(payment.month + 1).padStart(2,"0")}`;
  const elecAmt     = util?.elec_amount  || 0;
  const waterAmt    = util?.water_amount || 0;
  const grandTotal  = payment.amount + elecAmt + waterAmt;
  const isPaid      = payment.status === "ชำระแล้ว";

  // Detailed labels with unit × rate breakdown
  const elecRate  = utilRate?.electric ?? 8;
  const waterRate = utilRate?.water    ?? 18;
  const elecDetail  = util ? `${util.elec_use} หน่วย × ฿${elecRate}` : "";
  const waterDetail = util ? `${util.water_use} หน่วย × ฿${waterRate}` : "";

  const handlePrint = () => {
    const items = [
      { label: `ค่าเช่าห้อง ${payment.room_id}${room ? ` (${room.type})` : ""}`, sub: "", amt: payment.amount },
      elecAmt  > 0 && { label: "ค่าไฟฟ้า",   sub: elecDetail,  amt: elecAmt  },
      waterAmt > 0 && { label: "ค่าน้ำประปา", sub: waterDetail, amt: waterAmt },
    ].filter(Boolean);
    // Compact rows for 80mm thermal slip — single-row label+amount, sub-detail below
    const rows = items.map(it => `
      <div class="item">
        <div class="row"><span>${it.label}</span><span class="amt">${it.amt.toLocaleString()}</span></div>
        ${it.sub ? `<div class="subrow">${it.sub}</div>` : ""}
      </div>
    `).join("");

    // 80mm thermal slip receipt template
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${receiptNo}</title><style>
      @page { size: 80mm auto; margin: 0; }
      *{box-sizing:border-box;margin:0;padding:0}
      html,body{width:80mm}
      body{font-family:Sarabun,'TH Sarabun New',Arial,sans-serif;font-size:11px;color:#000;padding:4mm;position:relative;line-height:1.4}
      h1{font-size:15px;font-weight:800;text-align:center;letter-spacing:-.2px}
      .sub{font-size:9px;color:#555;text-align:center;margin-top:1mm}
      .div{border-top:1px dashed #888;margin:2mm 0}
      .row{display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
      .lbl{font-size:8.5px;color:#666;font-weight:700}
      .val{font-size:10.5px;font-weight:700}
      .meta{display:flex;justify-content:space-between;font-size:9.5px}
      .party{margin:1.5mm 0}
      .party .name{font-size:11px;font-weight:700}
      .party .info{font-size:9px;color:#444;margin-top:.5mm}
      .items-hdr{font-size:9px;color:#666;font-weight:700;margin:2mm 0 1mm}
      .item{padding:1.5mm 0;border-bottom:1px dotted #ccc}
      .item:last-child{border-bottom:none}
      .item .row span:first-child{font-size:10.5px;flex:1}
      .item .amt{font-family:'Sarabun',monospace;font-weight:700;font-size:11px;white-space:nowrap}
      .subrow{font-size:8.5px;color:#666;margin-top:.5mm}
      .total{display:flex;justify-content:space-between;align-items:baseline;
        padding:2mm 1mm;margin-top:1.5mm;border-top:1.5px solid #000;border-bottom:1.5px solid #000}
      .total .lbl-t{font-size:12px;font-weight:800}
      .total .val-t{font-size:15px;font-weight:900;font-family:'Sarabun',monospace}
      .paid-line{text-align:center;font-size:9.5px;margin-top:2mm;color:#333}
      .sigwrap{margin-top:6mm;text-align:center}
      .sigline{border-top:1px solid #888;width:55%;margin:0 auto;padding-top:1mm;font-size:8.5px;color:#666}
      footer{margin-top:3mm;text-align:center;font-size:8.5px;color:#555;line-height:1.4}
      .paid-stamp{position:absolute;top:50%;left:50%;
        transform:translate(-50%,-50%) rotate(-12deg);
        border:2px double #2d8a4a;border-radius:4px;padding:3mm 5mm;
        color:#2d8a4a;font-size:14px;font-weight:900;letter-spacing:1px;
        background:rgba(255,255,255,0);opacity:0.7;pointer-events:none;
        text-align:center;line-height:1.1;white-space:nowrap}
      .paid-stamp .en{font-size:7px;letter-spacing:2px;margin-top:.5mm;font-weight:700}
      @media print { body { padding:2mm 3mm } }
    </style></head><body>
      ${isPaid ? '<div class="paid-stamp">✓ ชำระเงินแล้ว<div class="en">PAID</div></div>' : ''}
      <h1>${owner.dorm || "หอพัก"}</h1>
      <div class="sub">ใบเสร็จรับเงิน / Payment Receipt</div>
      <div class="div"></div>

      <div class="meta">
        <div><span class="lbl">เลขที่:</span> <span class="val">${receiptNo}</span></div>
        <div style="text-align:right"><span class="lbl">วันที่:</span> <span class="val">${payment.paid_at || "—"}</span></div>
      </div>
      <div class="div"></div>

      <div class="party">
        <div class="lbl">ออกให้แก่</div>
        <div class="name">${tenant?.name || "—"}</div>
        <div class="info">ห้อง ${payment.room_id}${tenant?.phone ? ` · ${tenant.phone}` : ""}</div>
      </div>
      <div class="party">
        <div class="lbl">ผู้รับเงิน</div>
        <div class="name">${owner.name || "—"}</div>
        <div class="info">${owner.dorm || ""}</div>
      </div>
      <div class="div"></div>

      <div class="items-hdr">รายการ · งวด ${MONTHS_TH[payment.month]} ${payment.year}</div>
      ${rows}

      <div class="total">
        <span class="lbl-t">รวมทั้งสิ้น</span>
        <span class="val-t">${grandTotal.toLocaleString()} บาท</span>
      </div>

      <div class="paid-line">ชำระเมื่อ: ${payment.paid_at || "—"}</div>

      <div class="sigwrap">
        <div style="height:9mm"></div>
        <div class="sigline">ลายมือชื่อผู้รับเงิน</div>
      </div>

      <div class="div"></div>
      <footer>${owner.dorm || ""}${owner.address ? "<br>" + owner.address : ""}${owner.phone ? "<br>โทร. " + owner.phone : ""}</footer>
    </body></html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const lineItems = [
    { label: `ค่าเช่าห้อง ${payment.room_id}${room ? ` (${room.type})` : ""}`, sub: "", amount: payment.amount },
    elecAmt  > 0 && { label: "ค่าไฟฟ้า",   sub: elecDetail,  amount: elecAmt  },
    waterAmt > 0 && { label: "ค่าน้ำประปา", sub: waterDetail, amount: waterAmt },
  ].filter(Boolean);

  return (
    <ModalShell onClose={onClose} width={560}>
      {/* ── Header ── */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 50, height: 50, borderRadius: 13,
          background: "var(--ok-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
          🧾
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>ใบเสร็จรับเงิน</div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{receiptNo}</div>
        </div>
        <button onClick={handlePrint} style={{ padding: "9px 16px", borderRadius: 11, border: "none",
          background: "var(--ink)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6 }}>
          🖨 พิมพ์
        </button>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10,
          background: "var(--surface-2)", border: "1px solid var(--line)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      {/* ── Receipt body ── */}
      <div style={{ padding: "20px 22px", position: "relative" }}>
        {/* PAID stamp — only shown when payment is settled */}
        {isPaid && (
          <div style={{
            position: "absolute", top: "46%", right: 36, transform: "rotate(-14deg)",
            border: "3px double oklch(0.55 0.16 145)", borderRadius: 10,
            padding: "10px 22px", color: "oklch(0.45 0.18 145)",
            fontSize: 22, fontWeight: 900, letterSpacing: 2,
            background: "rgba(255,255,255,0.55)", opacity: 0.85,
            pointerEvents: "none", zIndex: 1, textAlign: "center", lineHeight: 1.1,
          }}>
            ✓ ชำระเงินแล้ว
            <div style={{ fontSize: 10, letterSpacing: 3, marginTop: 2, fontWeight: 700 }}>PAID</div>
          </div>
        )}

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>{owner.dorm || "หอพัก"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>ใบเสร็จรับเงิน / Payment Receipt</div>
        </div>

        {/* Receipt number + date */}
        <div style={{ display: "flex", justifyContent: "space-between",
          padding: "10px 0", borderTop: "1.5px dashed var(--line-2)", borderBottom: "1.5px dashed var(--line-2)", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>เลขที่ใบเสร็จ</div>
            <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{receiptNo}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>วันที่ออก</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginTop: 2 }}>{payment.paid_at || "—"}</div>
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "11px 14px" }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>ออกให้แก่</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{tenant?.name || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>ห้อง {payment.room_id}</div>
            {tenant?.phone && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{tenant.phone}</div>}
          </div>
          <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: "11px 14px" }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>ผู้รับเงิน</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{owner.name || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{owner.dorm}</div>
          </div>
        </div>

        {/* Line items */}
        <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
          รายการ · งวด {dl(payment.year, payment.month)}
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 8 }}>
          {lineItems.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "11px 14px", borderBottom: i < lineItems.length - 1 ? "1px solid var(--line)" : "none",
              background: "var(--surface)", fontSize: 13 }}>
              <div>
                <div>{item.label}</div>
                {item.sub && (
                  <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{item.sub}</div>
                )}
              </div>
              <span className="num" style={{ fontWeight: 700 }}>{baht(item.amount)}</span>
            </div>
          ))}
        </div>

        {/* Grand total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "13px 16px", background: "var(--brand-soft)", borderRadius: 12,
          border: "1px solid oklch(0.88 0.06 35)" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-ink)" }}>รวมทั้งสิ้น</span>
          <span className="num" style={{ fontSize: 22, fontWeight: 800, color: "var(--brand-ink)", letterSpacing: -0.5 }}>{baht(grandTotal)}</span>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
            ชำระเมื่อ: <span style={{ fontWeight: 600, color: "var(--ok)" }}>{payment.paid_at || "—"}</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 140, height: 30, borderBottom: "1.5px solid var(--line-2)" }}/>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>ลายมือชื่อผู้รับเงิน</div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── FLAT RATE MODAL ─────────────────────────────────────────────────────
export function FlatRateModal({ onClose }) {
  const { rooms, tenants, billing, setRoomBilling, curY, curM } = useData();
  const [viewY, setViewY] = useState(curY);
  const [viewM, setViewM] = useState(curM);

  // Build initial draft from existing billing for this month
  const buildDraft = (y, m) => {
    const draft = {};
    rooms.filter(r => r.status === "ไม่ว่าง").forEach(r => {
      const key = `${r.id}|${y}|${m}`;
      const b = billing.monthly[key] || {};
      draft[r.id] = {
        elecMode:  b.elecMode  || "metered",
        waterMode: b.waterMode || "metered",
        elecFlat:  b.elecFlat  ?? billing.defaultElecFlat ?? 0,
        waterFlat: b.waterFlat ?? billing.defaultWaterFlat ?? 0,
      };
    });
    return draft;
  };

  const [draft, setDraft] = useState(() => buildDraft(curY, curM));
  const [saved, setSaved] = useState(false);

  const changeMonth = (y, m) => {
    setViewY(y); setViewM(m);
    setDraft(buildDraft(y, m));
    setSaved(false);
  };
  const goPrev = () => viewM === 0 ? changeMonth(viewY - 1, 11) : changeMonth(viewY, viewM - 1);
  const goNext = () => {
    if (viewY > curY || (viewY === curY && viewM >= curM)) return;
    viewM === 11 ? changeMonth(viewY + 1, 0) : changeMonth(viewY, viewM + 1);
  };
  const isCurrent = viewY === curY && viewM === curM;

  const setD = (roomId, patch) =>
    setDraft(prev => ({ ...prev, [roomId]: { ...prev[roomId], ...patch } }));

  const saveAll = () => {
    Object.entries(draft).forEach(([roomId, d]) => {
      setRoomBilling(roomId, d, viewY, viewM);
    });
    setSaved(true);
    setTimeout(onClose, 900);
  };

  const byNum = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
  const occupied = [...rooms].filter(r => r.status === "ไม่ว่าง").sort(byNum);

  const modeBtn = (active, color) => ({
    padding: "5px 11px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
    border: `1px solid ${active ? color : "var(--line)"}`,
    background: active ? color + "22" : "transparent",
    color: active ? color : "var(--ink-4)",
  });

  return (
    <ModalShell onClose={onClose} width={740}>
      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>ตั้งค่าเหมาจ่ายค่าน้ำ-ไฟ</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>กำหนดรูปแบบการเก็บค่าน้ำ-ไฟแต่ละห้อง</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {/* Month nav */}
          <button onClick={goPrev} style={{ background: "var(--surface-2)", border: "1px solid var(--line)",
            borderRadius: 8, width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconArrowLeft size={13} stroke="var(--ink-2)"/>
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)",
            background: "var(--surface-2)", border: "1px solid var(--line)",
            padding: "5px 14px", borderRadius: 8, minWidth: 100, textAlign: "center" }}>
            {MONTHS_TH[viewM]} {viewY}
          </span>
          <button onClick={goNext} disabled={isCurrent} style={{
            background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 8,
            width: 28, height: 28, cursor: isCurrent ? "not-allowed" : "pointer",
            opacity: isCurrent ? 0.35 : 1,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconArrowRight size={13} stroke="var(--ink-2)"/>
          </button>
          {!isCurrent && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--warn)",
              background: "var(--warn-soft)", padding: "2px 9px", borderRadius: 100 }}>ย้อนหลัง</span>
          )}
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: "var(--surface-2)",
            border: "1px solid var(--line)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
            <IconX size={15} stroke="var(--ink-3)"/>
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 22px 0", maxHeight: 480, overflow: "auto" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr",
          padding: "8px 14px", fontSize: 11, fontWeight: 700, color: "var(--ink-3)",
          textTransform: "uppercase", letterSpacing: 0.8, gap: 14, marginBottom: 4 }}>
          <span>ห้อง</span><span>ผู้เช่า</span>
          <span style={{ color: "oklch(0.55 0.15 80)" }}>⚡ ค่าไฟ</span>
          <span style={{ color: "oklch(0.45 0.13 230)" }}>💧 ค่าน้ำ</span>
        </div>

        {occupied.map(r => {
          const d = draft[r.id] || { elecMode: "metered", waterMode: "metered", elecFlat: billing.defaultElecFlat ?? 0, waterFlat: billing.defaultWaterFlat ?? 0 };
          const t = tenants.find(x => x.room === r.id);
          const ELC = "oklch(0.55 0.15 80)";
          const WTR = "oklch(0.45 0.13 230)";

          return (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr",
              gap: 14, alignItems: "center", padding: "12px 14px",
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: 12, marginBottom: 6 }}>
              {/* Room badge */}
              <div className="num" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: "var(--brand-soft)", color: "var(--brand-ink)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700 }}>
                {r.id}
                <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.65 }}>ชั้น {r.floor}</span>
              </div>
              {/* Tenant */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t?.name || "—"}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{baht(r.price)}/เดือน</div>
              </div>
              {/* Electric */}
              <div>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  <button onClick={() => setD(r.id, { elecMode: "metered" })} style={modeBtn(d.elecMode === "metered", ELC)}>จดมิเตอร์</button>
                  <button onClick={() => setD(r.id, { elecMode: "flat" })} style={modeBtn(d.elecMode === "flat", ELC)}>เหมาจ่าย</button>
                </div>
                {d.elecMode === "flat" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input type="number" value={d.elecFlat} onChange={e => setD(r.id, { elecFlat: +e.target.value })}
                      style={{ width: 68, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${ELC}`,
                        fontSize: 13, fontWeight: 700, color: ELC, outline: "none", textAlign: "center",
                        background: "oklch(0.98 0.02 80)", fontFamily: "var(--font-num)" }}/>
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>บาท</span>
                  </div>
                )}
              </div>
              {/* Water */}
              <div>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  <button onClick={() => setD(r.id, { waterMode: "metered" })} style={modeBtn(d.waterMode === "metered", WTR)}>จดมิเตอร์</button>
                  <button onClick={() => setD(r.id, { waterMode: "flat" })} style={modeBtn(d.waterMode === "flat", WTR)}>เหมาจ่าย</button>
                </div>
                {d.waterMode === "flat" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <input type="number" value={d.waterFlat} onChange={e => setD(r.id, { waterFlat: +e.target.value })}
                      style={{ width: 68, padding: "5px 8px", borderRadius: 8, border: `1.5px solid ${WTR}`,
                        fontSize: 13, fontWeight: 700, color: WTR, outline: "none", textAlign: "center",
                        background: "oklch(0.97 0.015 230)", fontFamily: "var(--font-num)" }}/>
                    <span style={{ fontSize: 11, color: "var(--ink-3)" }}>บาท</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {occupied.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ยังไม่มีห้องที่มีผู้เช่า</div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "14px 22px 18px", borderTop: "1px solid var(--line)",
        display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, background: "var(--surface-2)",
        borderRadius: "0 0 20px 20px" }}>
        {saved && <span style={{ fontSize: 12, color: "var(--ok)", fontWeight: 700,
          background: "var(--ok-soft)", padding: "5px 10px", borderRadius: 100 }}>✓ บันทึกแล้ว</span>}
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 11, border: "1px solid var(--line)",
          background: "var(--surface)", color: "var(--ink-2)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          ยกเลิก
        </button>
        <button onClick={saveAll} style={{ padding: "10px 24px", borderRadius: 11, border: "none",
          background: "var(--brand)", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6 }}>
          <IconCheck size={14} stroke="white"/> บันทึก
        </button>
      </div>
    </ModalShell>
  );
}

// ─── ADD ROOM MODAL ──────────────────────────────────────────────────────
export function AddRoomModal({ onClose, onSubmit }) {
  const { rooms, owner } = useData();
  const numFloors     = Math.max(1, Math.min(20, owner?.numFloors ?? 5));
  const dynRoomTypes  = owner?.roomTypes   ?? ["เดี่ยว","คู่","สตูดิโอ"];
  const dynAmenityOpts = owner?.amenityOpts ?? AMENITY_OPTS;
  const [floor, setFloor] = useState(1);
  const [number, setNumber] = useState("");
  const [type, setType] = useState(dynRoomTypes[0] ?? "เดี่ยว");
  const [price, setPrice] = useState("");
  const [amenities, setAmenities] = useState(
    dynAmenityOpts.filter(a => ["แอร์","Wi-Fi"].includes(a)).slice(0, 2)
  );

  const suggested = (() => {
    const prefix = String.fromCharCode("A".charCodeAt(0) + floor - 1);
    const used = rooms.filter(r => r.floor === floor).map(r => r.id);
    for (let n = 1; n < 50; n++) {
      const id = `${prefix}${floor}${String(n).padStart(2, "0")}`;
      if (!used.includes(id)) return id;
    }
    return `${prefix}${floor}99`;
  })();
  const roomId = number.trim() || suggested;
  const exists = rooms.some(r => r.id.toLowerCase() === roomId.toLowerCase());
  // price is a string from the input; treat empty / 0 / non-numeric as invalid
  const valid = roomId && !exists && Number(price) > 0;

  const toggleAmenity = (a) => setAmenities(prev =>
    prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
  );

  const submit = () => {
    if (!valid) return;
    onSubmit({
      id: roomId, floor, type, price: Number(price),
      amenities, status: "ว่าง",
    });
  };

  return (
    <ModalShell onClose={onClose} width={600}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--brand-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconBuilding size={20} stroke="var(--brand)"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>เพิ่มห้องพักใหม่</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>กำหนดเลขห้อง ราคา และสิ่งอำนวยความสะดวก</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <AtField label="ชั้น" hint={`${numFloors} ชั้น (ตั้งค่าได้ที่ ตั้งค่า → ข้อมูลหอพัก)`}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Array.from({ length: numFloors }, (_, i) => i + 1).map(f => (
              <button key={f} onClick={() => setFloor(f)} className="num" style={{
                minWidth: numFloors <= 8 ? `calc(${100/numFloors}% - 6px)` : 48,
                padding: "10px 6px", borderRadius: 11,
                border: floor === f ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                background: floor === f ? "var(--brand-soft)" : "var(--surface)",
                color: floor === f ? "var(--brand-ink)" : "var(--ink)",
                fontWeight: 700, fontSize: 14, cursor: "pointer", textAlign: "center",
              }}>{f}</button>
            ))}
          </div>
        </AtField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AtField label="เลขห้อง" hint={exists ? "เลขห้องนี้มีแล้ว" : `แนะนำ: ${suggested}`}>
            <input value={number} onChange={e => setNumber(e.target.value)} placeholder={suggested}
              style={{ ...atInputStyle, fontFamily: "var(--font-num)",
                borderColor: exists ? "var(--danger)" : "var(--line)" }}/>
          </AtField>
          <AtField label="ประเภทห้อง">
            <div style={{ display: "flex", gap: 8 }}>
              {dynRoomTypes.map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 11,
                  border: type === t ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                  background: type === t ? "var(--brand-soft)" : "var(--surface)",
                  color: type === t ? "var(--brand-ink)" : "var(--ink)",
                  fontWeight: 600, fontSize: 12.5, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          </AtField>
        </div>

        <AtField label="ค่าเช่า (บาท / เดือน)" hint="กรอกจำนวนเงิน">
          <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
            placeholder="เช่น 3500"
            style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
        </AtField>

        <AtField label="สิ่งอำนวยความสะดวก" hint={`เลือกแล้ว ${amenities.length} รายการ`}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {dynAmenityOpts.map(a => {
              const on = amenities.includes(a);
              return (
                <button key={a} onClick={() => toggleAmenity(a)} style={{
                  padding: "7px 12px", borderRadius: 100,
                  border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                  background: on ? "var(--brand-soft)" : "var(--surface)",
                  color: on ? "var(--brand-ink)" : "var(--ink-2)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {on && "✓"} {a}
                </button>
              );
            })}
          </div>
        </AtField>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "var(--surface-2)",
        display: "flex", alignItems: "center", gap: 12, borderRadius: "0 0 20px 20px" }}>
        <div style={{ flex: 1, fontSize: 11.5, color: exists ? "var(--danger)" : "var(--ink-3)" }}>
          {exists ? `เลขห้อง ${roomId} มีอยู่แล้วในระบบ` :
            valid ? `จะเพิ่มห้อง ${roomId} (${type}) ${baht(Number(price))}/เดือน` : "กรอกข้อมูลให้ครบ"}
        </div>
        <button onClick={onClose} style={detailBtn("ghost")}>ยกเลิก</button>
        <button onClick={submit} disabled={!valid} style={{
          ...detailBtn("primary"),
          background: !valid ? "var(--surface)" : "var(--brand)",
          color: !valid ? "var(--ink-4)" : "white",
          cursor: !valid ? "not-allowed" : "pointer",
          border: !valid ? "1px solid var(--line)" : "none",
        }}>
          <IconCheck size={14} stroke={!valid ? "var(--ink-4)" : "white"}/> เพิ่มห้อง
        </button>
      </div>
    </ModalShell>
  );
}

// ─── ADD REPAIR MODAL ────────────────────────────────────────────────────
export function AddRepairModal({ onClose, onSubmit }) {
  const { rooms } = useData();
  const today = new Date().toISOString().slice(0, 10);
  const [roomId, setRoomId] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("ปกติ");
  const [assigned, setAssigned] = useState("");
  const [eta, setEta] = useState("");
  const [note, setNote] = useState("");

  const occupied = rooms.filter(r => r.status === "ไม่ว่าง");
  const vacant = rooms.filter(r => r.status === "ว่าง");

  const valid = roomId && issue.trim();
  const submit = () => {
    if (!valid) return;
    onSubmit({
      room_id: roomId, issue: issue.trim(), status: "รอดำเนินการ",
      priority, created_at: today, assigned: assigned || null,
      eta: eta || null, note: note.trim() || null,
    });
  };

  return (
    <ModalShell onClose={onClose} width={560}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--warn-soft)",
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconWrench size={20} stroke="var(--warn)"/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>เพิ่มงานซ่อมใหม่</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>สำหรับงานที่เจ้าของหอตรวจพบเอง — ไม่ต้องรอผู้เช่าแจ้ง</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid var(--line)",
          background: "var(--surface-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconX size={15} stroke="var(--ink-3)"/>
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <AtField label="ห้องที่เกี่ยวข้อง">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[...occupied, ...vacant].map(r => {
              const sel = roomId === r.id;
              return (
                <button key={r.id} onClick={() => setRoomId(r.id)} style={{
                  padding: "8px 4px", borderRadius: 10,
                  border: sel ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                  background: sel ? "var(--brand-soft)" : "var(--surface)",
                  cursor: "pointer", textAlign: "center",
                }}>
                  <div className="num" style={{ fontSize: 12, fontWeight: 700,
                    color: sel ? "var(--brand-ink)" : "var(--ink)" }}>{r.id}</div>
                  <div style={{ fontSize: 9.5, color: "var(--ink-3)", marginTop: 1 }}>
                    {r.status === "ไม่ว่าง" ? "มีผู้เช่า" : "ว่าง"}
                  </div>
                </button>
              );
            })}
          </div>
        </AtField>

        <AtField label="รายละเอียดปัญหา">
          <textarea value={issue} onChange={e => setIssue(e.target.value)}
            placeholder="เช่น ก๊อกน้ำในห้องน้ำรั่ว / หลอดไฟทางเดินขาด"
            style={{ ...atInputStyle, height: 70, resize: "vertical", fontFamily: "var(--font-thai)" }}/>
        </AtField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <AtField label="ระดับความเร่งด่วน">
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "ต่ำ", c: "var(--sage)" },
                { v: "ปกติ", c: "var(--warn)" },
                { v: "สูง", c: "var(--danger)" },
              ].map(p => {
                const sel = priority === p.v;
                return (
                  <button key={p.v} onClick={() => setPriority(p.v)} style={{
                    flex: 1, padding: "9px 0", borderRadius: 10,
                    border: sel ? `1.5px solid ${p.c}` : "1px solid var(--line)",
                    background: sel ? p.c : "var(--surface)",
                    color: sel ? "white" : "var(--ink-2)",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                  }}>{p.v}</button>
                );
              })}
            </div>
          </AtField>
          <AtField label="วันที่คาดว่าจะเสร็จ (ถ้ามี)">
            <input type="date" value={eta} onChange={e => setEta(e.target.value)}
              style={{ ...atInputStyle, fontFamily: "var(--font-num)" }}/>
          </AtField>
        </div>

        <AtField label="มอบหมายให้ (ถ้ามี)" hint="เว้นว่างถ้ายังไม่มอบหมาย">
          <input value={assigned} onChange={e => setAssigned(e.target.value)}
            placeholder="เช่น ช่างเอก / ช่างนิด"
            style={atInputStyle}/>
        </AtField>

        <AtField label="หมายเหตุภายใน (ถ้ามี)">
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="โน้ตสำหรับเจ้าของหอ — ผู้เช่าจะไม่เห็น"
            style={{ ...atInputStyle, height: 56, resize: "vertical", fontFamily: "var(--font-thai)" }}/>
        </AtField>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--line)", background: "var(--surface-2)",
        display: "flex", alignItems: "center", gap: 12, borderRadius: "0 0 20px 20px" }}>
        <div style={{ flex: 1, fontSize: 11.5, color: "var(--ink-3)" }}>
          {valid ? "งานจะเข้าคอลัมน์ 'รอดำเนินการ'" : "เลือกห้องและกรอกปัญหา"}
        </div>
        <button onClick={onClose} style={detailBtn("ghost")}>ยกเลิก</button>
        <button onClick={submit} disabled={!valid} style={{
          ...detailBtn("primary"),
          background: !valid ? "var(--surface)" : "var(--brand)",
          color: !valid ? "var(--ink-4)" : "white",
          cursor: !valid ? "not-allowed" : "pointer",
          border: !valid ? "1px solid var(--line)" : "none",
        }}>
          <IconCheck size={14} stroke={!valid ? "var(--ink-4)" : "white"}/> เพิ่มงาน
        </button>
      </div>
    </ModalShell>
  );
}
