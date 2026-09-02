// =====================================================================
// لوحة تشخيص ثابتة على الشاشة (Persistent On-Screen Debug Logger)
// منصة الجودة للفارمسي أكاديمي
// =====================================================================
//
// 🎯 الهدف: حل مشكلتين معاً:
//   1) "الصفحة تختفي بسرعة" - السجل يُحفظ في localStorage، فيبقى ظاهراً
//      حتى لو حدثت إعادة توجيه متكررة بين عدة صفحات (login → courses → ...)
//   2) "لا أعرف الخطأ الحقيقي" - أي خطأ JavaScript غير متوقع (بما فيها
//      الأخطاء غير المُمسكة/uncaught) يُسجَّل ويظهر تلقائياً في شريط
//      أحمر ثابت أعلى الشاشة، مع زر "نسخ السجل" لإرساله كنص مباشرة.
// =====================================================================

const DLOG_KEY = "jpa_debug_log_v1";
const DLOG_MAX_ENTRIES = 200;

function dlog(message) {
  try {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour12: false }) + "." + String(now.getMilliseconds()).padStart(3, "0");
    const page = window.location.pathname.split("/").pop() || "index.html";
    const entry = `[${time}] (${page}) ${message}`;

    const raw = localStorage.getItem(DLOG_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    while (list.length > DLOG_MAX_ENTRIES) list.shift();
    localStorage.setItem(DLOG_KEY, JSON.stringify(list));

    renderDebugOverlay();
  } catch (e) {
    // لا نفعل شيئاً - لا نريد لخطأ في السجل نفسه أن يُعطّل الصفحة
  }
}

function dlogClear() {
  localStorage.removeItem(DLOG_KEY);
  renderDebugOverlay();
}

function dlogGetAll() {
  try {
    const raw = localStorage.getItem(DLOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function renderDebugOverlay() {
  let box = document.getElementById("jpa-debug-overlay");
  if (!box) {
    box = document.createElement("div");
    box.id = "jpa-debug-overlay";
    box.style.cssText = [
      "position:fixed", "bottom:0", "left:0", "right:0", "z-index:999999",
      "background:#0d1f1a", "color:#7ee8a8", "font-family:monospace",
      "font-size:11px", "max-height:45vh", "overflow-y:auto",
      "border-top:3px solid #f2a900", "direction:ltr", "text-align:left",
      "padding:8px"
    ].join(";");

    const header = document.createElement("div");
    header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:6px; flex-wrap:wrap;";
    header.innerHTML = `
      <strong style="color:#f2a900;">🔍 JPA Debug Log</strong>
      <span>
        <button id="jpa-debug-copy" style="background:#0e7c66;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;">📋 Copy log</button>
        <button id="jpa-debug-clear" style="background:#d64545;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;">🗑 Clear</button>
        <button id="jpa-debug-hide" style="background:#555;color:#fff;border:none;padding:4px 10px;border-radius:6px;font-size:11px;">✖ Hide</button>
      </span>
    `;
    box.appendChild(header);

    const content = document.createElement("div");
    content.id = "jpa-debug-content";
    content.style.cssText = "white-space:pre-wrap; word-break:break-all;";
    box.appendChild(content);

    document.body.appendChild(box);

    document.getElementById("jpa-debug-copy").onclick = () => {
      const text = dlogGetAll().join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => alert("✅ تم نسخ السجل! الصقه الآن في الرسالة."),
          () => fallbackCopy(text)
        );
      } else {
        fallbackCopy(text);
      }
    };
    document.getElementById("jpa-debug-clear").onclick = dlogClear;
    document.getElementById("jpa-debug-hide").onclick = () => {
      box.style.display = "none";
    };
  }

  const content = document.getElementById("jpa-debug-content");
  if (content) {
    content.textContent = dlogGetAll().join("\n") || "(لا توجد سجلات بعد)";
    content.scrollTop = content.scrollHeight;
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    alert("✅ تم نسخ السجل! الصقه الآن في الرسالة.");
  } catch (e) {
    alert("⚠️ تعذّر النسخ التلقائي. الرجاء تحديد النص أسفل الشاشة يدوياً ونسخه.");
  }
  document.body.removeChild(ta);
}

// --- التقاط تلقائي لكل خطأ JavaScript غير متوقع في الصفحة ---
window.addEventListener("error", (event) => {
  dlog(`🔴 JS ERROR: ${event.message} @ ${event.filename}:${event.lineno}:${event.colno}`);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const msg = reason && reason.message ? reason.message : String(reason);
  const code = reason && reason.code ? ` [code: ${reason.code}]` : "";
  dlog(`🔴 UNHANDLED PROMISE REJECTION: ${msg}${code}`);
});

dlog("=== debug-logger.js loaded ===");
document.addEventListener("DOMContentLoaded", () => {
  dlog("DOMContentLoaded fired");
  renderDebugOverlay();
});
