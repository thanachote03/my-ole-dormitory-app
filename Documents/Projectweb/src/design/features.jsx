// Feature components: Payment reminder, Bank/Slip, Utility, Repair reply
import { useState, useRef } from "react";
import { DI } from "./icons";
import { MONTHS_TH, MONTHS_FULL, dl, baht, UTIL_RATE } from "./seed";
import { useData } from "./DataContext";

// ─── Payment Due Reminder (mobile, top banner) ─────────────────────
export function PaymentDueBanner({ payment, room, onPay, onDismiss }) {
  const { owner } = useData();
  if (!payment || payment.status !== "รอชำระ") return null;
  // Previously hardcoded dueDay=5 and only compared day-of-month — that broke
  // when the payment month was different from "now" (e.g. May rent viewed
  // late May with owner.dueDay=26 showed "เกินกำหนด 22 วัน" using day 5 as
  // the reference, contradicting the main rent card on the same screen).
  const dueDay = owner?.dueDay ?? 5;
  const dueDate = new Date(payment.year, payment.month, dueDay);
  const dayMs = 86400000;
  const diffDays = Math.floor((dueDate.getTime() - Date.now()) / dayMs);
  const overdue = diffDays < 0;
  const daysLeft = Math.abs(diffDays);

  return (
    <div className="screen-in" style={{
      margin: "0 0 14px",
      background: overdue ? "linear-gradient(135deg, var(--danger), oklch(0.55 0.14 25))" : "linear-gradient(135deg, var(--brand), var(--brand-2))",
      borderRadius: 18, padding: "14px 16px", color: "white",
      display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden",
      boxShadow: overdue ? "0 14px 32px -14px var(--danger)" : "0 14px 32px -14px var(--brand)",
    }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -10, bottom: -10, width: 80, opacity: 0.15 }}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10"/>
      </svg>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <DI.IconBell size={20} stroke="white"/>
        <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "white" }}/>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.1 }}>
          {overdue ? `เกินกำหนด ${daysLeft} วันแล้ว!` : `ครบกำหนดอีก ${daysLeft} วัน`}
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>
          ค่าเช่าห้อง {room.id} · {MONTHS_FULL[payment.month]} {payment.year} · ภายในวันที่ {dueDay} {MONTHS_TH[payment.month]}
        </div>
      </div>
      <button onClick={onPay} style={{
        background: "white", color: overdue ? "var(--danger)" : "var(--brand-2)",
        border: "none", padding: "7px 13px", borderRadius: 100, fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0,
        position: "relative", zIndex: 2,
      }}>ชำระ</button>
      <button onClick={onDismiss} aria-label="ปิด" style={{
        background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", color: "white",
        width: 22, height: 22, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "absolute", top: 4, right: 4, zIndex: 1, padding: 0,
      }}><DI.IconX size={12} stroke="white"/></button>
    </div>
  );
}

// ─── Bank Account Cards ─────────────────────────────────────────────
export function BankAccounts({ onCopy }) {
  const { banks } = useData();
  const [copied, setCopied] = useState(null);
  const [qrOpen, setQrOpen] = useState(null); // bank id with QR panel expanded
  const copy = (n, id) => {
    navigator.clipboard?.writeText(n);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
    onCopy?.(n);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {banks.map(b => (
        <div key={b.id} style={{
          background: "var(--surface)", border: "1px solid var(--line)",
          borderRadius: 14, overflow: "hidden",
        }}>
          {/* Bank row */}
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            {/* Clickable left area — toggles QR panel */}
            <div
              onClick={() => b.qrImage && setQrOpen(qrOpen === b.id ? null : b.id)}
              style={{
                flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12,
                cursor: b.qrImage ? "pointer" : "default",
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: b.color,
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12, flexShrink: 0,
              }}>{b.short}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{b.bank}</div>
                  {b.primary && <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--brand)",
                    background: "var(--brand-soft)", padding: "1px 6px", borderRadius: 100 }}>หลัก</span>}
                  {b.qrImage && <span style={{ fontSize: 9, color: "var(--ink-3)" }}>📱</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{b.name}</div>
                <div className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 4, letterSpacing: 0.5 }}>
                  {b.number}
                </div>
              </div>
            </div>
            {/* Copy button */}
            <button onClick={() => copy(b.number, b.id)} style={{
              background: copied === b.id ? "var(--ok-soft)" : "var(--surface-2)",
              border: "1px solid var(--line)", borderRadius: 9, padding: "6px 10px",
              fontSize: 11.5, fontWeight: 700, cursor: "pointer", flexShrink: 0,
              color: copied === b.id ? "var(--ok)" : "var(--ink-2)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              {copied === b.id ? <><DI.IconCheck size={12} stroke="var(--ok)"/> คัดลอกแล้ว</> : "คัดลอก"}
            </button>
          </div>

          {/* QR inline panel */}
          {b.qrImage && qrOpen === b.id && (
            <div style={{ borderTop: "1px solid var(--line)", background: "var(--surface-2)",
              padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>สแกน QR เพื่อโอนเงิน</div>
              <img src={b.qrImage} alt="QR Code" style={{
                width: 200, height: 200, objectFit: "contain",
                borderRadius: 14, border: "1px solid var(--line)", background: "white", padding: 8,
              }}/>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "center" }}>
                {b.bank} · {b.number}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Slip Upload Tile ──────────────────────────────────────────────
export function SlipUploadTile({ amount, onSubmit }) {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const inputRef = useRef(null);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Use FileReader to get data URL so the image can be persisted in state
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFile({ name: f.name, url: ev.target.result, dataUrl: ev.target.result, size: (f.size / 1024).toFixed(0) + " KB", raw: f });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)",
      borderRadius: 18, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>แนบสลิปการโอน</div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 14 }}>
        ถ่ายรูปสลิปหรือเลือกจากแกลเลอรี — เจ้าของหอจะตรวจสอบและยืนยันภายใน 24 ชม.
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} style={{ display: "none" }}/>

      {!file ? (
        <button onClick={() => inputRef.current?.click()} style={{
          width: "100%", padding: "22px 14px", borderRadius: 14,
          border: "1.5px dashed var(--line-2)", background: "var(--surface-2)",
          cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 8, color: "var(--ink-2)",
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brand-soft)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DI.IconPlus size={22} stroke="var(--brand)"/>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>เลือกรูปสลิป</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>JPG / PNG · ไม่เกิน 5MB</div>
        </button>
      ) : (
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
          <img src={file.url} alt="slip" style={{ width: "100%", display: "block", maxHeight: 180, objectFit: "cover" }}/>
          <button onClick={() => setFile(null)} style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(0,0,0,0.5)", color: "white", border: "none",
            borderRadius: "50%", width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><DI.IconX size={14} stroke="white"/></button>
          <div style={{ padding: "10px 14px", background: "var(--surface)", fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: "var(--ink)" }}>{file.name}</div>
            <div style={{ color: "var(--ink-3)", marginTop: 2 }}>{file.size}</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 4 }}>วันที่โอน</div>
          <input type="text" value={date} onChange={e => setDate(e.target.value)} placeholder="21 พ.ค. 2026" style={{
            width: "100%", padding: "10px 12px", borderRadius: 10,
            border: "1px solid var(--line)", background: "var(--surface-2)",
            outline: "none", fontSize: 13, color: "var(--ink)", boxSizing: "border-box",
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 4 }}>จำนวนเงิน</div>
          <div style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line)",
            background: "var(--surface-2)", fontSize: 13, fontWeight: 700, color: "var(--ink)" }} className="num">
            {baht(amount)}
          </div>
        </div>
      </div>

      <button onClick={() => onSubmit?.(file?.raw || file, file?.dataUrl)} disabled={!file} className="lift" style={{
        width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 14,
        border: "none", cursor: file ? "pointer" : "not-allowed",
        background: file ? "var(--ink)" : "var(--line-2)",
        color: "white", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <DI.IconCheck size={16} stroke="white"/> ส่งสลิปให้เจ้าของหอ
      </button>
    </div>
  );
}

// ─── Utility Readings (tenant view) ────────────────────────────────
export function UtilityCard({ roomId }) {
  const { utils, curY, curM, resolveBilling } = useData();
  const filtered = utils.filter(u => u.room_id === roomId)
    .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  const cur = filtered[0];
  const prev = filtered[1];
  if (!cur) return <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ยังไม่มีข้อมูลมิเตอร์</div>;

  // Resolve billing mode for current month
  const billing = resolveBilling ? resolveBilling(roomId, cur.year, cur.month) : { elecMode: "metered", waterMode: "metered" };
  const elecFlat = billing?.elecFlat ?? 400;
  const waterFlat = billing?.waterFlat ?? 200;

  const elecAmt = billing?.elecMode === "flat" ? elecFlat : cur.elec_amount;
  const waterAmt = billing?.waterMode === "flat" ? waterFlat : cur.water_amount;
  const total = elecAmt + waterAmt;
  const elecDiff = prev ? cur.elec_use - prev.elec_use : 0;
  const waterDiff = prev ? cur.water_use - prev.water_use : 0;

  return (
    <div>
      <div style={{ background: "linear-gradient(140deg, var(--lilac-soft), var(--brand-soft))",
        borderRadius: 20, padding: 18, marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1 }}>
          ค่าน้ำ-ไฟ · {dl(cur.year, cur.month)}
        </div>
        <div className="num" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", marginTop: 8, letterSpacing: -0.8 }}>
          {baht(total)}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>จดล่าสุด {cur.read_at}</div>
      </div>

      {billing?.elecMode === "flat" ? (
        <div style={{ background: "oklch(0.96 0.04 80)", border: "1px solid oklch(0.88 0.07 80)", borderRadius: 16, padding: "12px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "oklch(0.96 0.04 80)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DI.IconSparkle size={18} stroke="oklch(0.65 0.15 80)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>ค่าไฟฟ้า <span style={{ fontSize: 10.5, fontWeight: 600, color: "oklch(0.55 0.18 310)", background: "oklch(0.94 0.04 310)", padding: "2px 7px", borderRadius: 100, marginLeft: 6 }}>💰 เหมาจ่าย</span></div>
            </div>
            <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{baht(elecFlat)}</div>
          </div>
        </div>
      ) : (
        <UtilRow
          icon={<DI.IconSparkle size={18} stroke="oklch(0.65 0.15 80)"/>}
          bg="oklch(0.96 0.04 80)" title="ค่าไฟฟ้า" unit="หน่วย"
          prev={cur.elec_prev} cur={cur.elec_cur} use={cur.elec_use} amount={cur.elec_amount}
          rate={UTIL_RATE.electric} diff={elecDiff}
        />
      )}
      <div style={{ height: 8 }}/>
      {billing?.waterMode === "flat" ? (
        <div style={{ background: "oklch(0.96 0.025 230)", border: "1px solid oklch(0.88 0.05 230)", borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "oklch(0.96 0.025 230)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DI.IconWifi size={18} stroke="oklch(0.65 0.12 230)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>ค่าน้ำประปา <span style={{ fontSize: 10.5, fontWeight: 600, color: "oklch(0.55 0.18 310)", background: "oklch(0.94 0.04 310)", padding: "2px 7px", borderRadius: 100, marginLeft: 6 }}>💰 เหมาจ่าย</span></div>
            </div>
            <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{baht(waterFlat)}</div>
          </div>
        </div>
      ) : (
        <UtilRow
          icon={<DI.IconWifi size={18} stroke="oklch(0.65 0.12 230)"/>}
          bg="oklch(0.96 0.025 230)" title="ค่าน้ำประปา" unit="หน่วย"
          prev={cur.water_prev} cur={cur.water_cur} use={cur.water_use} amount={cur.water_amount}
          rate={UTIL_RATE.water} diff={waterDiff}
        />
      )}

      <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8 }}>ประวัติย้อนหลัง</div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {filtered.slice(0, 6).map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "11px 14px",
            borderBottom: i < Math.min(filtered.length, 6) - 1 ? "1px solid var(--line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{dl(u.year, u.month)}</div>
              <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                ไฟ {u.elec_use} หน่วย · น้ำ {u.water_use} หน่วย
              </div>
            </div>
            <div className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>{baht(u.elec_amount + u.water_amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UtilRow({ icon, bg, title, unit, prev, cur, use, amount, rate, diff }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
          <div className="num" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{rate} บาท/หน่วย</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{baht(amount)}</div>
          <div style={{ fontSize: 10.5, fontWeight: 600,
            color: diff > 0 ? "var(--warn)" : diff < 0 ? "var(--ok)" : "var(--ink-4)", marginTop: 2 }}>
            {diff > 0 ? `↑ ${diff}` : diff < 0 ? `↓ ${Math.abs(diff)}` : "—"} เทียบเดือนก่อน
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <UtilCell label="เลขก่อน"  value={prev}/>
        <UtilCell label="เลขล่าสุด" value={cur} hi/>
        <UtilCell label="ใช้ไป"     value={`${use} ${unit}`}/>
      </div>
    </div>
  );
}

function UtilCell({ label, value, hi }) {
  return (
    <div style={{ background: hi ? "var(--brand-soft)" : "var(--surface-2)", borderRadius: 10, padding: "8px 10px" }}>
      <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{label}</div>
      <div className="num" style={{ fontSize: 14, fontWeight: 700, marginTop: 2,
        color: hi ? "var(--brand-ink)" : "var(--ink)" }}>{value}</div>
    </div>
  );
}
