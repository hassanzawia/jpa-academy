// =====================================================================
// منطق تسجيل الدخول / الخروج - Auth Logic
// 🔍 v3: مهلة زمنية وقائية (timeout) على كل عملية Firestore حرجة،
// لمنع أي "تجمّد صامت" غير مرئي للمستخدم أو للسجل التشخيصي.
// =====================================================================

const DEMO_ACCOUNTS = [
  { role: "صيدلي إكلينيكي", email: "dr_sarah@jpa-academy.com", password: "sarah@2026", label: "dr_sarah" },
  { role: "طالب صيدلة (سنة تخرج)", email: "ahmed_pharma@jpa-academy.com", password: "ahmed@123", label: "ahmed_pharma" },
  { role: "صيدلي امتياز متدرب", email: "nour_intern@jpa-academy.com", password: "nour@pass", label: "nour_intern" },
  { role: "طبيب بشري مراجع سريري", email: "dr_tariq@jpa-academy.com", password: "tariq@med26", label: "dr_tariq" },
  { role: "مدير الأكاديمية (Admin)", email: "admin_jawda@jpa-academy.com", password: "admin@jawda2026", label: "admin_jawda" }
];

// 🆕 دالة مساعدة: تُلحق مهلة زمنية بأي Promise. إن لم يكتمل خلال المهلة،
// تُرفض الدالة برسالة خطأ واضحة بدلاً من الانتظار للأبد بصمت.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`TIMEOUT (${ms}ms): ${label}`)), ms)
    )
  ]);
}

function loginWithEmail(email, password) {
  dlog(`loginWithEmail() called for: ${email}`);
  return auth.signInWithEmailAndPassword(email, password)
    .then(async (cred) => {
      dlog(`✅ signInWithEmailAndPassword SUCCESS, uid=${cred.user.uid}`);

      try {
        await withTimeout(ensureUserProfile(cred.user), 10000, "ensureUserProfile");
        dlog("✅ ensureUserProfile() completed");
      } catch (e) {
        dlog(`🔴 ensureUserProfile() FAILED/TIMEOUT: ${e.message}`);
        throw e;
      }

      try {
        await withTimeout(startNewSession(cred.user.uid), 10000, "startNewSession");
        dlog("✅ startNewSession() completed");
      } catch (e) {
        dlog(`🔴 startNewSession() FAILED/TIMEOUT: ${e.message}`);
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
  dlog("ensureUserProfile: calling ref.get()...");
  const snap = await withTimeout(ref.get(), 8000, "ensureUserProfile.get()");
  dlog(`ensureUserProfile: doc.exists = ${snap.exists}`);
  if (!snap.exists) {
    dlog("ensureUserProfile: calling ref.set() for new doc...");
    await withTimeout(
      ref.set({
        email: user.email,
        fullName: "",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        walletBalance: 0,
        enrolledCourses: [],
        progress: {},
        completedChapters: {},
        certificates: {}
      }),
      8000,
      "ensureUserProfile.set()"
    );
    dlog("ensureUserProfile: new doc created");
  } else {
    dlog("ensureUserProfile: calling ref.update() for lastLogin...");
    await withTimeout(
      ref.update({ lastLogin: firebase.firestore.FieldValue.serverTimestamp() }),
      8000,
      "ensureUserProfile.update()"
    );
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
