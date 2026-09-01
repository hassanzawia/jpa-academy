// =====================================================================
// منطق تسجيل الدخول / الخروج - Auth Logic
// =====================================================================

const DEMO_ACCOUNTS = [
  { role: "صيدلي إكلينيكي", email: "dr_sarah@jpa-academy.com", password: "sarah@2026", label: "dr_sarah" },
  { role: "طالب صيدلة (سنة تخرج)", email: "ahmed_pharma@jpa-academy.com", password: "ahmed@123", label: "ahmed_pharma" },
  { role: "صيدلي امتياز متدرب", email: "nour_intern@jpa-academy.com", password: "nour@pass", label: "nour_intern" },
  { role: "طبيب بشري مراجع سريري", email: "dr_tariq@jpa-academy.com", password: "tariq@med26", label: "dr_tariq" },
  { role: "مدير الأكاديمية (Admin)", email: "admin_jawda@jpa-academy.com", password: "admin@jawda2026", label: "admin_jawda" }
];

function loginWithEmail(email, password) {
  return auth.signInWithEmailAndPassword(email, password)
    .then(async (cred) => {
      await ensureUserProfile(cred.user);
      window.location.href = "courses.html";
    });
}

async function ensureUserProfile(user) {
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      email: user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      walletBalance: 0,
      enrolledCourses: [],
      progress: {}
    });
  } else {
    await ref.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
  }
}

function logout() {
  auth.signOut().then(() => (window.location.href = "login.html"));
}

function requireAuth() {
  auth.onAuthStateChanged((user) => {
    if (!user) window.location.href = "login.html";
  });
}

function renderDemoAccounts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  DEMO_ACCOUNTS.forEach((acc) => {
    const btn = document.createElement("button");
    btn.className = "demo-account-btn";
    btn.innerHTML = `<strong>${acc.role}</strong><span>${acc.label}</span>`;
    btn.onclick = () => {
      document.getElementById("email").value = acc.email;
      document.getElementById("password").value = acc.password;
      loginWithEmail(acc.email, acc.password).catch(showError);
    };
    container.appendChild(btn);
  });
}

function showError(err) {
  const box = document.getElementById("error-box");
  if (box) {
    box.textContent = "خطأ: " + (err.message || "تعذر تسجيل الدخول");
    box.style.display = "block";
  } else {
    alert(err.message);
  }
}
