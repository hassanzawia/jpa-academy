// =====================================================================
// لوحة تحكم المدير - منصة الجودة للفارمسي أكاديمي
// نسخة عرض فقط (Read-Only Dashboard)
// =====================================================================
//
// ⚠️ هذا الملف يعتمد على أن الحساب الحالي يملك Custom Claim: admin = true
// (تم منحه تلقائياً لحساب admin_jawda عبر scripts/seed-users.js)
// وأن firestore.rules تسمح بالقراءة الشاملة فقط لهذا النوع من الحسابات:
//   match /{document=**} {
//     allow read: if request.auth != null && request.auth.token.admin == true;
//   }
// =====================================================================

let allUsers = [];
let allClinicalCases = [];

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
      const tokenResult = await user.getIdTokenResult(true); // true = force refresh
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
}

// ---------------------------------------------------------------------
// جلب كل البيانات دفعة واحدة (مناسب لحجم بيانات صغير-متوسط)
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
// 2) إدارة الطلاب (Students Table)
// ---------------------------------------------------------------------

function renderStudentsTable() {
  const tbody = document.getElementById("students-tbody");
  tbody.innerHTML = "";

  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);">لا يوجد مستخدمون بعد</td></tr>';
    return;
  }

  // ترتيب حسب آخر دخول (الأحدث أولاً)
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
    `;
    tbody.appendChild(tr);
  });
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

  // ربط userId بالبريد الإلكتروني لعرض أوضح
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

// إعادة تحميل يدوية للبيانات (زر تحديث)
function refreshAdminData() {
  loadAllData();
}
