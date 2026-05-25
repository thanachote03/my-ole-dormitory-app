// ─── Feature components: Payment reminder, Bank/Slip, Utility, Repair reply
const FDI = window.DI;
const FSEED = window.SEED;
const { useState: fState, useRef: fRef } = React;

// ─── 1. Payment Due Reminder (mobile, top banner) ────────────────────────
function PaymentDueBanner({ payment, room, onPay, onDismiss }) {
  if (!payment || payment.status !== "รอชำระ") return null;
  const dueDay = 5;
  const today = 21; // demo "today"
  const daysLeft = dueDay - today;
  const overdue = daysLeft < 0;

  return (
    <div className="screen-in" style={{
      margin: "0 0 14px",
      background: overdue ? "linear-gradient(135deg, var(--danger), oklch(0.55 0.14 25))" : "linear-gradient(135deg, var(--brand), var(--brand-2))",
      borderRadius: 18, padding: "14px 16px", color: "white",
      display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden",
      boxShadow: overdue ? "0 14px 32px -14px var(--danger)" : "0 14px 32px -14px var(--brand)",
    }}>
      {/* decorative */}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", right: -10, bottom: -10, width: 80, opacity: 0.15 }}>
        <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10"/>
      </svg>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <FDI.IconBell size={20} stroke="white"/>
        <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: "white" }}/>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.1 }}>
          {overdue ? `เกินกำหนด ${Math.abs(daysLeft)} วันแล้ว!` : `ครบกำหนดอีก ${daysLeft} วัน`}
        </div>
        <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 2 }}>
          ค่าเช่าห้อง {room.id} · {FSEED.MONTHS_FULL[payment.month]} {payment.year} · ภายในวันที่ {dueDay} {FSEED.MONTHS_TH[payment.month]}
        </div>
      </div>
      <button onClick={onPay} style={{
        background: "white", color: overdue ? "var(--danger)" : "var(--brand-2)",
        border: "none", padding: "7px 13px", borderRadius: 100, fontWeight: 700, fontSize: 12, cursor: "pointer", flexShrink: 0,
      }}>ชำระ</button>
      <button onClick={onDismiss} style={{
        background: "transparent", border: "none", cursor: "pointer", color: "white", padding: 2,
        position: "absolute", top: 6, right: 6,
      }}><FDI.IconX size={14} stroke="white"/></button>
    </div>
  );
}

// ─── 2. Bank Account Cards (tenant payment screen) ───────────────────────
function BankAccounts({ banks = FSEED.SEED_BANKS, onCopy }) {
  const [copied, setCopied] = fState(null);
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
          borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
          position: "relative",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: b.color,
            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, flexShrink: 0,
          }}>{b.short}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{b.bank}</div>
              {b.primary && <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--brand)",
                background: "var(--brand-soft)", padding: "1px 6px", borderRadius: 100 }}>หลัก</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{b.name}</div>
            <div className="num" style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 4, letterSpacing: 0.5 }}>
              {b.number}
            </div>
          </div>
          <button onClick={() => copy(b.number, b.id)} style={{
            background: copied === b.id ? "var(--ok-soft)" : "var(--surface-2)",
            border: "1px solid var(--line)", borderRadius: 9, padding: "6px 10px",
            fontSize: 11.5, fontWeight: 700, cursor: "pointer",
            color: copied === b.id ? "var(--ok)" : "var(--ink-2)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {copied === b.id ? <><FDI.IconCheck size={12} stroke="var(--ok)"/> คัดลอกแล้ว</> : "คัดลอก"}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── 3. Slip Upload Tile (tenant) ────────────────────────────────────────
function SlipUploadTile({ amount, onSubmit }) {
  const [file, setFile] = fState(null);
  const [date, setDate] = fState("");
  const inputRef = fRef(null);

  const onPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setFile({ name: f.name, url, size: (f.size / 1024).toFixed(0) + " KB" });
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
            <FDI.IconPlus size={22} stroke="var(--brand)"/>
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
          }}><FDI.IconX size={14} stroke="white"/></button>
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
            {FSEED.baht(amount)}
          </div>
        </div>
      </div>

      <button onClick={onSubmit} disabled={!file} className="lift" style={{
        width: "100%", marginTop: 12, padding: "13px 0", borderRadius: 14,
        border: "none", cursor: file ? "pointer" : "not-allowed",
        background: file ? "var(--ink)" : "var(--line-2)",
        color: "white", fontSize: 14, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>
        <FDI.IconCheck size={16} stroke="white"/> ส่งสลิปให้เจ้าของหอ
      </button>
    </div>
  );
}

// ─── 4. Utility Readings (tenant view) ───────────────────────────────────
function UtilityCard({ roomId }) {
  const utils = FSEED.SEED_UTILS.filter(u => u.room_id === roomId)
    .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);
  const cur = utils[0];
  const prev = utils[1];
  if (!cur) return <div style={{ padding: 20, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>ยังไม่มีข้อมูลมิเตอร์</div>;

  const total = cur.elec_amount + cur.water_amount;
  const elecDiff = prev ? cur.elec_use - prev.elec_use : 0;
  const waterDiff = prev ? cur.water_use - prev.water_use : 0;

  return (
    <div>
      {/* Summary */}
      <div style={{ background: "linear-gradient(140deg, var(--lilac-soft), var(--brand-soft))",
        borderRadius: 20, padding: 18, marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 1 }}>
          ค่าน้ำ-ไฟ · {FSEED.dl(cur.year, cur.month)}
        </div>
        <div className="num" style={{ fontSize: 30, fontWeight: 700, color: "var(--ink)", marginTop: 8, letterSpacing: -0.8 }}>
          {FSEED.baht(total)}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>จดล่าสุด {cur.read_at}</div>
      </div>

      {/* Electric */}
      <UtilRow
        icon={<FDI.IconSparkle size={18} stroke="oklch(0.65 0.15 80)"/>}
        bg="oklch(0.96 0.04 80)"
        title="ค่าไฟฟ้า"
        unit="หน่วย"
        prev={cur.elec_prev} cur={cur.elec_cur} use={cur.elec_use} amount={cur.elec_amount}
        rate={FSEED.UTIL_RATE.electric} diff={elecDiff}
      />
      <div style={{ height: 8 }}/>
      {/* Water */}
      <UtilRow
        icon={<FDI.IconWifi size={18} stroke="oklch(0.65 0.12 230)"/>}
        bg="oklch(0.96 0.025 230)"
        title="ค่าน้ำประปา"
        unit="หน่วย"
        prev={cur.water_prev} cur={cur.water_cur} use={cur.water_use} amount={cur.water_amount}
        rate={FSEED.UTIL_RATE.water} diff={waterDiff}
      />

      {/* History */}
      <div style={{ marginTop: 18, fontSize: 13, fontWeight: 600, color: "var(--ink-3)", paddingLeft: 4, marginBottom: 8 }}>ประวัติย้อนหลัง</div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {utils.slice(0, 6).map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "11px 14px",
            borderBottom: i < Math.min(utils.length, 6) - 1 ? "1px solid var(--line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{FSEED.dl(u.year, u.month)}</div>
              <div className="num" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>
                ไฟ {u.elec_use} หน่วย · น้ำ {u.water_use} หน่วย
              </div>
            </div>
            <div className="num" style={{ fontSize: 13.5, fontWeight: 700 }}>{FSEED.baht(u.elec_amount + u.water_amount)}</div>
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
          <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{FSEED.baht(amount)}</div>
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

window.Features = { PaymentDueBanner, BankAccounts, SlipUploadTile, UtilityCard };
