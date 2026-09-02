// =====================================================================
// منطق تسجيل الدخول / الخروج - Auth Logic
// 🔍 يشمل الآن استدعاءات dlog() في كل خطوة حرجة لتشخيص مشاكل الهاتف
// =====================================================================

const DEMO_ACCOUNTS = [
  { role: "صيدلي إكلينيكي", email: "dr_sarah@jpa-academy.com", password: "sarah@2026", label: "dr_sarah" },
  { role: "طالب صيدلة (سنة تخرج)", email: "ahmed_pharma@jpa-academy.com", password: "ahmed@123", label: "ahmed_pharma" },
  { role: "صيدلي امتياز متدرب", email: "nour_intern@jpa-academy.com", password: "nour@pass", label: "nour_intern" },
  { role: "طبيب بشري مراجع سريري", email: "dr_tariq@jpa-academy.com", password: "tariq@med26", label: "dr_tariq" },
  { role: "مدير الأكاديمية (Admin)", email: "admin_jawda@jpa-academy.com", password: "admin@jawda2026", label: "admin_jawda" }
];

function loginWithEmail(email, password) {
  dlog(`loginWithEmail() called for: ${email}`);
  return auth.signInWithEmailAndPassword(email, password)
    .then(async (cred) => {
      dlog(`✅ signInWithEmailAndPassword SUCCESS, uid=${cred.user.uid}`);
      try {
        await ensureUserProfile(cred.user);
        dlog("✅ ensureUserProfile() completed");
      } catch (e) {
        dlog(`🔴 ensureUserProfile() FAILED: ${e.message}`);
        throw e;
      }
      try {
        await startNewSession(cred.user.uid);
        dlog("✅ startNewSession() completed");
      } catch (e) {
        dlog(`🔴 startNewSession() FAILED: ${e.message}`);
        throw e;
      }
      dlog("➡️ Redirecting to courses.html now...");
      window.location.href = "courses.html";
    })
    .catch((err) => {
      dlog(`🔴 loginWithEmail() CHAIN FAILED: [${err.code || "?"}] ${err.message}`);
      throw err;
    });
}

async function ensureUserProfile(user) {
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();
  dlog(`ensureUserProfile: doc.exists = ${snap.exists}`);
  if (!snap.exists) {
    await ref.set({
      email: user.email,
      fullName: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      walletBalance: 0,
      enrolledCourses: [],
      progress: {},
      completedChapters: {},
      certificates: {}
    });
    dlog("ensureUserProfile: new doc created");
  } else {
    await ref.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() });
    dlog("ensureUserProfile: lastLogin updated");
  }
}

function saveFullName(name) {
  const user = auth.currentUser;
  if (!user) return Promise.reject(new Error("المستخدم غير مسجل الدخول"));
  return db.collection("users").doc(user.uid).update({ fullName: name });
}

function logout() {
  dlog("logout() called");
  localStorage.removeItem(SESSION_STORAGE_KEY);
  auth.signOut().then(() => (window.location.href = "login.html"));
}

function requireAuth() {
  dlog("requireAuth() attached, waiting for onAuthStateChanged...");
  auth.onAuthStateChanged((user) => {
    dlog(`requireAuth: onAuthStateChanged fired, user=${user ? user.email : "null"}`);
    if (!user) {
      dlog("➡️ requireAuth: no user, redirecting to login.html");
      window.location.href = "login.html";
    } else {
      dlog("requireAuth: user present, staying on page");
    }
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
  dlog(`showError() called: ${err.message || err}`);
  const box = document.getElementById("error-box");
  if (box) {
    box.textContent = "خطأ: " + (err.message || "تعذر تسجيل الدخول");
    box.style.display = "block";
  } else {
    alert(err.message);
  }
}
