// =====================================================================
// لوحة تحكم المدير - منصة الجودة للفارمسي أكاديمي
// v2: يشمل الآن ميزة شحن الرصيد يدوياً (Manual Wallet Top-up)
// =====================================================================
//
// ⚠️ يعتمد على أن الحساب الحالي يملك Custom Claim: admin = true
// وأن firestore.rules تسمح بـ:
//   - القراءة الشاملة لحساب المدير
//   - تحديث حقل walletBalance فقط (وليس أي حقل آخر) لأي مستخدم
// =====================================================================

let allUsers = [];
let allClinicalCases = [];
let topupTargetUid = null;
let topupTargetEmail = null;

// ---------------------------------------------------------------------
// التحقق من صلاحية المدير قبل عرض أي محتوى
// ---------------------------------------------------------------------

function requireAdmin() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    try {
      const tokenResult = await user.getIdTokenResult(true);
      if (tokenResult.claims.admin === true) {
        document.getElementById("admin-email").textContent = user.email;
        loadAllData();
      } else {
        showAccessDenied();
      }
    } catch (err) {
      console.error("خطأ في التحقق من صلاحية المدير:", err);
      showAccessDenied();
    }
  });
}

function showAccessDenied() {
  document.getElementById("admin-content").style.display = "none";
  document.getElementById("access-denied").style.display = "block";
  document.getElementById("loading-indicator").style.display = "none";
}

// ---------------------------------------------------------------------
// جلب كل البيانات دفعة واحدة
// ---------------------------------------------------------------------

async function loadAllData() {
  document.getElementById("loading-indicator").style.display = "block";
  document.getElementById("admin-content").style.display = "none";

  try {
    const [usersSnap, casesSnap] = await Promise.all([
      db.collection("users").get(),
      db.collectionGroup("clinicalCases").get()
    ]);

    allUsers = usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    allClinicalCases = casesSnap.docs.map((doc) => ({
      id: doc.id,
      userId: doc.ref.parent.parent.id,
      ...doc.data()
    }));

    renderOverview();
    renderStudentsTable();
    renderClinicalCasesTable();
    renderCoursesAnalytics();

    document.getElementById("loading-indicator").style.display = "none";
    document.getElementById("admin-content").style.display = "block";
  } catch (err) {
    console.error("خطأ في جلب بيانات اللوحة:", err);
    document.getElementById("loading-indicator").innerHTML =
      `<p style="color:var(--danger);">⚠️ تعذّر تحميل البيانات: ${err.message}</p>`;
  }
}

// ---------------------------------------------------------------------
// 1) نظرة عامة (Overview)
// ---------------------------------------------------------------------

function renderOverview() {
  const totalUsers = allUsers.length;
  const totalWallet = allUsers.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
  const totalEnrollments = allUsers.reduce((sum, u) => sum + ((u.enrolledCourses || []).length), 0);
  const totalCases = allClinicalCases.length;
  const avgScore = totalCases > 0
    ? Math.round(allClinicalCases.reduce((sum, c) => sum + (c.score || 0), 0) / totalCases)
    : 0;

  document.getElementById("stat-total-users").textContent = totalUsers;
  document.getElementById("stat-total-wallet").textContent = totalWallet.toLocaleString() + " د.ل";
  document.getElementById("stat-total-enrollments").textContent = totalEnrollments;
  document.getElementById("stat-total-cases").textContent = totalCases;
  document.getElementById("stat-avg-score").textContent = avgScore + "%";
}

// ---------------------------------------------------------------------
// 2) إدارة الطلاب (Students Table) + زر شحن الرصيد
// ---------------------------------------------------------------------

function renderStudentsTable() {
  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = "";

  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);">لا يوجد مستخدمون بعد</td></tr>';
    return;
  }

  const sorted = [...allUsers].sort((a, b) => {
    const aTime = a.lastLogin?.seconds || 0;
    const bTime = b.lastLogin?.seconds || 0;
    return bTime - aTime;
  });

  sorted.forEach((u) => {
    const tr = document.createElement("tr");
    const lastLoginStr = u.lastLogin
      ? new Date(u.lastLogin.seconds * 1000).toLocaleDateString("ar-LY")
      : "—";
    const roleLabel = u.isAdmin ? "👑 مدير" : (u.role || "—");
    tr.innerHTML = `
      <td>${u.email || "—"}</td>
      <td>${roleLabel}</td>
      <td>${(u.walletBalance ?? 0).toLocaleString()} د.ل</td>
      <td>${(u.enrolledCourses || []).length}</td>
      <td>${lastLoginStr}</td>
      <td><button class="btn btn-primary btn-small" onclick="openTopUpModal('${u.id}', '${(u.email || "").replace(/'/g, "\\'")}')">💰 شحن</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------------------------------------------------------------
// 🆕 نافذة شحن الرصيد (Top-up Modal)
// ---------------------------------------------------------------------

function openTopUpModal(uid, email) {
  topupTargetUid = uid;
  topupTargetEmail = email;
  document.getElementById("topup-user-email").textContent = email;
  document.getElementById("topup-amount").value = "";
  document.getElementById("topup-note").value = "";
  document.getElementById("topup-error").style.display = "none";
  document.getElementById("topup-modal").style.display = "flex";
}

function closeTopUpModal() {
  document.getElementById("topup-modal").style.display = "none";
  topupTargetUid = null;
  topupTargetEmail = null;
}

async function submitTopUp() {
  const amountInput = document.getElementById("topup-amount");
  const noteInput = document.getElementById("topup-note");
  const errBox = document.getElementById("topup-error");
  const submitBtn = document.getElementById("topup-submit-btn");

  const amount = parseFloat(amountInput.value);

  if (!topupTargetUid) return;

  if (isNaN(amount) || amount === 0) {
    errBox.textContent = "⚠️ الرجاء إدخال مبلغ صحيح (استخدم رقماً سالباً للخصم، مثل -50)";
    errBox.style.display = "block";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "جارٍ التنفيذ...";

  try {
    await topUpWalletForUser(topupTargetUid, amount, noteInput.value.trim());
    closeTopUpModal();
    showToast(`✅ تم ${amount > 0 ? "شحن" : "خصم"} ${Math.abs(amount)} د.ل بنجاح لحساب ${topupTargetEmail || ""}`);
    await loadAllData(); // تحديث الجداول والإحصائيات فوراً
  } catch (err) {
    errBox.textContent = "❌ خطأ: " + err.message;
    errBox.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "تأكيد الشحن";
  }
}

function showToast(message) {
  const toast = document.getElementById("admin-toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 4000);
}

// ---------------------------------------------------------------------
// 3) متابعة الحالات السريرية (Clinical Cases Table)
// ---------------------------------------------------------------------

function renderClinicalCasesTable() {
  const tbody = document.getElementById("cases-tbody");
  tbody.innerHTML = "";

  if (allClinicalCases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">لا توجد محاولات بعد</td></tr>';
    return;
  }

  const userEmailMap = {};
  allUsers.forEach((u) => { userEmailMap[u.id] = u.email; });

  const sorted = [...allClinicalCases].sort((a, b) => {
    const aTime = a.submittedAt?.seconds || 0;
    const bTime = b.submittedAt?.seconds || 0;
    return bTime - aTime;
  });

  sorted.forEach((c) => {
    const tr = document.createElement("tr");
    const dateStr = c.submittedAt
      ? new Date(c.submittedAt.seconds * 1000).toLocaleString("ar-LY")
      : "—";
    const scoreClass = (c.score || 0) >= 70 ? "score-good" : "score-bad";
    tr.innerHTML = `
      <td>${userEmailMap[c.userId] || c.userId}</td>
      <td>${c.id}</td>
      <td><span class="${scoreClass}">${c.score ?? 0}%</span></td>
      <td>${c.answers?.answer || "—"}</td>
      <td>${dateStr}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------------------------------------------------------------
// 4) إحصائيات الدورات (Courses Analytics)
// ---------------------------------------------------------------------

function renderCoursesAnalytics() {
  const tbody = document.getElementById("courses-tbody");
  tbody.innerHTML = "";

  if (typeof COURSES === "undefined") {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);">بيانات الدورات غير متاحة</td></tr>';
    return;
  }

  COURSES.forEach((course) => {
    const enrolledCount = allUsers.filter((u) =>
      (u.enrolledCourses || []).includes(course.id)
    ).length;
    const revenue = enrolledCount * course.price;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${course.title}</td>
      <td>${course.instructor}</td>
      <td>${enrolledCount}</td>
      <td>${revenue.toLocaleString()} ${course.currency}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ---------------------------------------------------------------------
// التنقل بين التبويبات
// ---------------------------------------------------------------------

function showAdminTab(tabName, btnEl) {
  ["overview", "students", "cases", "courses"].forEach((t) => {
    document.getElementById("admin-tab-" + t).style.display = t === tabName ? "block" : "none";
  });
  document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");
}

function refreshAdminData() {
  loadAllData();
}
