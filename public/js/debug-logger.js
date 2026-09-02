// داخل دالة إنشاء الـ DOM الخاصة بالـ logger:
const panel = document.getElementById('debug-logger-panel') || document.createElement('div');
panel.id = 'debug-logger-panel';
panel.style.cssText = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  max-width: 90vw;
  width: 400px;
  background: rgba(15, 23, 42, 0.95);
  color: #10b981;
  font-family: monospace;
  font-size: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 999999;
  display: none; /* مخفي افتراضياً */
  flex-direction: column;
  max-height: 40vh;
`;

// زر عائم صغير لفتح/إغلاق اللوج
const toggleBtn = document.createElement('button');
toggleBtn.textContent = '🛠️ Log';
toggleBtn.style.cssText = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000000;
  background: #1e293b;
  color: #fff;
  border: 1px solid #475569;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
`;

toggleBtn.onclick = () => {
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? 'flex' : 'none';
};

document.body.appendChild(toggleBtn);